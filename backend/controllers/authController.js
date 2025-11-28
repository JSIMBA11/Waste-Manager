// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Pool } = require("pg");

// -------------------------------
// Database connection
// -------------------------------
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// -------------------------------
// External services setup (with safe fallbacks)
// -------------------------------
let sendgrid;
let twilioClient;

try {
  sendgrid = require("@sendgrid/mail");
  const key = process.env.SENDGRID_API_KEY || "";
  if (key && key.startsWith("SG.")) {
    sendgrid.setApiKey(key);
    console.log("📨 SendGrid configured");
  } else {
    console.warn("⚠️ SendGrid API key invalid or missing, emails will be mocked.");
    sendgrid = {
      send: async (msg) => {
        console.log("📧 Mock email send:", msg);
        return true;
      },
    };
  }
} catch {
  console.warn("⚠️ SendGrid not installed, emails will be mocked.");
  sendgrid = {
    send: async (msg) => {
      console.log("📧 Mock email send:", msg);
      return true;
    },
  };
}

try {
  const twilio = require("twilio");
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) {
    twilioClient = twilio(sid, token);
    console.log("📱 Twilio configured");
  } else {
    throw new Error("Twilio credentials missing");
  }
} catch {
  console.warn("⚠️ Twilio not configured, SMS will be mocked.");
  twilioClient = {
    messages: {
      create: async (msg) => {
        console.log("📱 Mock SMS send:", msg);
        return true;
      },
    },
  };
}

// -------------------------------
// Helpers
// -------------------------------
function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`❌ Missing env: ${name}`);
  }
  return v;
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function sanitizeText(value) {
  return (value || "").trim();
}

function parseSaltRounds() {
  const sr = parseInt(process.env.SALT_ROUNDS || "10", 10);
  return Number.isNaN(sr) ? 10 : sr;
}

function mapPgError(err) {
  // Provide user-friendly messages for common Postgres errors
  const msg = err?.message || "Unknown database error";
  if (msg.includes("duplicate key value") && msg.includes("users_email")) {
    return "Email already registered";
  }
  if (msg.includes("violates not-null constraint")) {
    return "Missing a required field";
  }
  if (msg.includes("invalid input syntax")) {
    return "Invalid input format";
  }
  return msg;
}

// -------------------------------
// Register
// -------------------------------
exports.register = async (req, res) => {
  console.log("📥 Register request body:", req.body);

  try {
    // Extract and sanitize
    const full_name = sanitizeText(req.body.full_name);
    const email = normalizeEmail(req.body.email);
    const phone_number = sanitizeText(req.body.phone_number);
    const location = sanitizeText(req.body.location);
    const password = req.body.password;

    // Basic validation
    const missing = [];
    if (!full_name) missing.push("full_name");
    if (!email) missing.push("email");
    if (!password) missing.push("password");

    if (missing.length) {
      console.warn("⚠️ Missing required fields:", missing);
      return res.status(400).json({ error: "Missing required fields", fields: missing });
    }

    // Check duplicates explicitly (helps clearer error)
    const dupCheck = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [email]);
    if (dupCheck.rowCount > 0) {
      console.warn("⚠️ Register blocked: email already exists:", email);
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const saltRounds = parseSaltRounds();
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);

    console.log("🔧 Inserting user:", { full_name, email, phone_number, location });

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, location, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone_number, location`,
      [full_name, email, phone_number, location, password_hash]
    );

    console.log("✅ User registered successfully:", result.rows[0]);
    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    const friendly = mapPgError(err);
    console.error("❌ Registration error:", err.stack || err);
    return res.status(400).json({ error: "Registration failed", details: friendly });
  }
};

// -------------------------------
// Login
// -------------------------------
exports.login = async (req, res) => {
  console.log("📥 Login request body:", req.body);

  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      console.warn("⚠️ Missing login fields:", { email: !!email, password: !!password });
      return res.status(400).json({ error: "Missing email or password" });
    }

    const userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userRes.rowCount === 0) {
      console.warn("⚠️ Login failed: user not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      console.warn("⚠️ Login failed: wrong password for", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = requireEnv("JWT_SECRET");
    if (!secret) {
      console.error("❌ JWT_SECRET missing, cannot issue tokens");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });
    console.log("✅ Login successful for:", email);

    return res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err.stack || err);
    return res.status(400).json({ error: "Login failed", details: err.message });
  }
};

// -------------------------------
// Request Password Reset (Email)
// -------------------------------
exports.requestPasswordResetEmail = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  console.log("📥 Password reset (email) request:", email);

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at)
       VALUES ($1, $2, $3)`,
      [email, token, expiry]
    );

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetLink = `${origin}/reset-password?token=${token}`;
    console.log("🔗 Generated reset link:", resetLink);

    await sendgrid.send({
      to: email,
      from: process.env.EMAIL_FROM || "noreply@usafi-mtaani.com",
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetLink}`,
    });

    return res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("❌ Password reset email error:", err.stack || err);
    return res.status(400).json({ error: "Failed to send reset link", details: err.message });
  }
};

// -------------------------------
// Request Password Reset (SMS)
// -------------------------------
exports.requestPasswordResetSMS = async (req, res) => {
  const phone_number = sanitizeText(req.body.phone_number);
  console.log("📥 Password reset (SMS) request:", phone_number);

  try {
    if (!phone_number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const expiry = new Date(Date.now() + 300000); // 5 minutes

    await pool.query(
      `INSERT INTO password_resets (phone_number, code, expires_at)
       VALUES ($1, $2, $3)`,
      [phone_number, code, expiry]
    );

    console.log("🔢 Generated reset code:", code);

    await twilioClient.messages.create({
      body: `Your Usafi-Mtaani reset code is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER || "+10000000000",
      to: phone_number,
    });

    return res.json({ message: "Reset code sent via SMS" });
  } catch (err) {
    console.error("❌ Password reset SMS error:", err.stack || err);
    return res.status(400).json({ error: "Failed to send SMS reset code", details: err.message });
  }
};

// -------------------------------
// Final Reset Password
// -------------------------------
exports.resetPassword = async (req, res) => {
  console.log("📥 Final reset request:", req.body);

  try {
    const tokenOrCode = sanitizeText(req.body.tokenOrCode);
    const newPassword = req.body.newPassword;

    if (!tokenOrCode || !newPassword) {
      return res.status(400).json({ error: "Token/code and newPassword are required" });
    }

    const resetRes = await pool.query(
      `SELECT * FROM password_resets WHERE token = $1 OR code = $1`,
      [tokenOrCode]
    );

    if (resetRes.rowCount === 0) {
      console.warn("⚠️ Reset failed: token/code not found");
      return res.status(400).json({ error: "Invalid or expired reset request" });
    }

    const reset = resetRes.rows[0];
    if (new Date() > reset.expires_at) {
      console.warn("⚠️ Reset failed: token/code expired");
      return res.status(400).json({ error: "Invalid or expired reset request" });
    }

    const saltRounds = parseSaltRounds();
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(newPassword, salt);

    const principal = reset.email || reset.phone_number;
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2 OR phone_number = $2`,
      [hash, principal]
    );

    console.log("✅ Password reset successful for:", principal);
    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Final reset error:", err.stack || err);
    return res.status(400).json({ error: "Password reset failed", details: err.message });
  }
};
