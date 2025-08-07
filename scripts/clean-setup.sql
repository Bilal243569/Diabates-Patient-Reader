-- Clean setup script - removes dummy data and creates fresh tables

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS shared_reports CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS sugar_readings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sugar_readings table
CREATE TABLE sugar_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reading_type VARCHAR(50) NOT NULL CHECK (reading_type IN ('fasting', 'random', 'before-meal', 'after-meal')),
    sugar_level INTEGER NOT NULL CHECK (sugar_level >= 50 AND sugar_level <= 500),
    reading_date DATE NOT NULL,
    reading_time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    reminder_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_reports table
CREATE TABLE shared_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    report_type VARCHAR(50) NOT NULL DEFAULT 'full',
    date_range_start DATE,
    date_range_end DATE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_sugar_readings_user_date ON sugar_readings(user_id, reading_date DESC);
CREATE INDEX idx_sugar_readings_type ON sugar_readings(reading_type);
CREATE INDEX idx_shared_reports_token ON shared_reports(share_token);
CREATE INDEX idx_reminders_user_active ON reminders(user_id, is_active);

-- No dummy data - clean database ready for real users
