-- ================================
-- Usafi-Mtaani Database Schema
-- ================================

-- Drop tables if they already exist (for clean setup)
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS users;

-- -------------------------------
-- Users table
-- -------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    location VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------
-- Password resets table
-- -------------------------------
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150),
    phone_number VARCHAR(20),
    token VARCHAR(255),
    code VARCHAR(10),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_password_resets_phone ON password_resets(phone_number);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_code ON password_resets(code);
