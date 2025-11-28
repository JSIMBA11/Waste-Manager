// backend/routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validate");
const {
  register,
  login,
  requestPasswordResetEmail,
  requestPasswordResetSMS,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// -------------------------------
// Registration route
// -------------------------------
router.post(
  "/register",
  [
    body("full_name")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Full name must be at least 2 characters long"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone_number")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 6 })
      .withMessage("Phone number must be at least 6 characters"),
    body("location").optional().isString().trim(),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  validateRequest,
  register
);

// -------------------------------
// Login route
// -------------------------------
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

// -------------------------------
// Request password reset (Email)
// -------------------------------
router.post(
  "/reset/email",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  requestPasswordResetEmail
);

// -------------------------------
// Request password reset (SMS)
// -------------------------------
router.post(
  "/reset/sms",
  [
    body("phone_number")
      .isString()
      .trim()
      .isLength({ min: 6 })
      .withMessage("Valid phone number is required"),
  ],
  validateRequest,
  requestPasswordResetSMS
);

// -------------------------------
// Final reset password
// -------------------------------
router.post(
  "/reset/confirm",
  [
    body("tokenOrCode")
      .isString()
      .notEmpty()
      .withMessage("Reset token or code is required"),
    body("newPassword")
      .isString()
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
