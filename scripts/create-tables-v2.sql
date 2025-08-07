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
    day VARCHAR(20),
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

-- Insert sample data
INSERT INTO users (email, name, password_hash, profile_image_url) VALUES 
('john.doe@example.com', 'John Doe', '$2b$10$example_hash_here', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('sarah.wilson@example.com', 'Sarah Wilson', '$2b$10$example_hash_here2', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('mike.johnson@example.com', 'Mike Johnson', '$2b$10$example_hash_here3', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('emily.davis@example.com', 'Emily Davis', '$2b$10$example_hash_here4', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face');

-- Insert sample readings
INSERT INTO sugar_readings (user_id, reading_type, sugar_level, reading_date, reading_time, notes) VALUES
(1, 'fasting', 95, '2025-01-10', '07:30:00', 'Morning reading after 8 hours of fasting'),
(1, 'random', 142, '2025-01-10', '14:15:00', 'Post-lunch reading, had pasta'),
(1, 'fasting', 89, '2025-01-09', '07:45:00', 'Good morning reading, felt energetic'),
(1, 'random', 168, '2025-01-09', '18:30:00', 'After dinner, had dessert - higher than usual'),
(2, 'fasting', 78, '2025-01-10', '06:45:00', 'Early morning reading, excellent control'),
(2, 'random', 125, '2025-01-10', '13:30:00', 'After healthy salad lunch'),
(3, 'fasting', 105, '2025-01-10', '08:00:00', 'Slightly elevated, need to watch diet'),
(4, 'fasting', 88, '2025-01-10', '07:20:00', 'Perfect morning reading');

-- Insert sample reminders
INSERT INTO reminders (user_id, reminder_type, reminder_time, is_active, days_of_week) VALUES
(1, 'fasting', '07:00:00', true, '{1,2,3,4,5,6,7}'),
(1, 'random', '14:00:00', true, '{1,2,3,4,5}'),
(2, 'fasting', '06:45:00', true, '{1,2,3,4,5,6,7}'),
(3, 'fasting', '08:00:00', true, '{1,2,3,4,5,6,7}');

-- Insert sample shared reports
INSERT INTO shared_reports (user_id, share_token, report_type, date_range_start, date_range_end, is_active, expires_at) VALUES
(1, 'abc123xyz789', 'full', '2025-01-01', '2025-01-31', true, '2025-02-10 23:59:59'),
(2, 'def456uvw012', 'summary', '2025-01-01', '2025-01-15', true, '2025-02-15 23:59:59');
