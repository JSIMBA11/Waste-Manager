// backend/db.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Optional: simple test query at startup
pool.query("SELECT NOW()")
  .then(res => console.log("✅ PostgreSQL connected at", res.rows[0].now))
  .catch(err => console.error("❌ DB connection error:", err.message));

module.exports = pool;
