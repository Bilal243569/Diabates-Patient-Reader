-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sugar_readings table
CREATE TABLE IF NOT EXISTS sugar_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reading_type VARCHAR(50) NOT NULL CHECK (reading_type IN ('fasting', 'random', 'before-meal', 'after-meal')),
    sugar_level INTEGER NOT NULL CHECK (sugar_level >= 50 AND sugar_level <= 500),
    reading_date DATE NOT NULL,
    reading_time TIME NOT NULL,
    day VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    reminder_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_reports table for doctor sharing
CREATE TABLE IF NOT EXISTS shared_reports (
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
CREATE INDEX IF NOT EXISTS idx_sugar_readings_user_date ON sugar_readings(user_id, reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_sugar_readings_type ON sugar_readings(reading_type);
CREATE INDEX IF NOT EXISTS idx_shared_reports_token ON shared_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON reminders(user_id, is_active);

-- Insert real sample data
INSERT INTO users (email, name, password_hash, profile_image_url) VALUES 
('john.doe@example.com', 'John Doe', '$2b$10$example_hash_here', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('sarah.wilson@example.com', 'Sarah Wilson', '$2b$10$example_hash_here2', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('mike.johnson@example.com', 'Mike Johnson', '$2b$10$example_hash_here3', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('emily.davis@example.com', 'Emily Davis', '$2b$10$example_hash_here4', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (email) DO NOTHING;

-- Insert real sugar readings data
INSERT INTO sugar_readings (user_id, reading_type, sugar_level, reading_date, reading_time, notes) VALUES
-- John Doe's readings (user_id: 1)
(1, 'fasting', 95, '2025-01-10', '07:30:00', 'Morning reading after 8 hours of fasting'),
(1, 'random', 142, '2025-01-10', '14:15:00', 'Post-lunch reading, had pasta'),
(1, 'fasting', 89, '2025-01-09', '07:45:00', 'Good morning reading, felt energetic'),
(1, 'random', 168, '2025-01-09', '18:30:00', 'After dinner, had dessert - higher than usual'),
(1, 'before-meal', 87, '2025-01-08', '12:20:00', 'Before lunch, feeling good'),
(1, 'after-meal', 155, '2025-01-08', '13:45:00', 'Post-lunch reading'),
(1, 'fasting', 92, '2025-01-07', '07:15:00', 'Weekend morning reading'),
(1, 'random', 138, '2025-01-07', '16:20:00', 'Afternoon snack time'),

-- Sarah Wilson's readings (user_id: 2)
(2, 'fasting', 78, '2025-01-10', '06:45:00', 'Early morning reading, excellent control'),
(2, 'random', 125, '2025-01-10', '13:30:00', 'After healthy salad lunch'),
(2, 'fasting', 82, '2025-01-09', '07:00:00', 'Consistent morning reading'),
(2, 'after-meal', 145, '2025-01-09', '19:45:00', 'Post-dinner, grilled chicken'),
(2, 'before-meal', 85, '2025-01-08', '18:00:00', 'Before dinner preparation'),
(2, 'fasting', 79, '2025-01-07', '06:50:00', 'Great fasting glucose'),

-- Mike Johnson's readings (user_id: 3)
(3, 'fasting', 105, '2025-01-10', '08:00:00', 'Slightly elevated, need to watch diet'),
(3, 'random', 175, '2025-01-10', '15:00:00', 'High reading after stress at work'),
(3, 'fasting', 98, '2025-01-09', '08:15:00', 'Better than yesterday'),
(3, 'random', 160, '2025-01-09', '20:00:00', 'Evening reading, had pizza'),
(3, 'before-meal', 110, '2025-01-08', '12:00:00', 'Pre-lunch, feeling tired'),

-- Emily Davis's readings (user_id: 4)
(4, 'fasting', 88, '2025-01-10', '07:20:00', 'Perfect morning reading'),
(4, 'random', 132, '2025-01-10', '14:45:00', 'Post-lunch, quinoa bowl'),
(4, 'fasting', 91, '2025-01-09', '07:30:00', 'Consistent good control'),
(4, 'after-meal', 148, '2025-01-09', '13:15:00', 'After Mediterranean lunch');

-- Insert reminders
INSERT INTO reminders (user_id, reminder_type, reminder_time, is_active, days_of_week) VALUES
(1, 'fasting', '07:00:00', true, '{1,2,3,4,5,6,7}'),
(1, 'random', '14:00:00', true, '{1,2,3,4,5}'),
(1, 'random', '19:00:00', true, '{1,2,3,4,5,6,7}'),
(2, 'fasting', '06:45:00', true, '{1,2,3,4,5,6,7}'),
(2, 'after-meal', '13:30:00', true, '{1,2,3,4,5}'),
(3, 'fasting', '08:00:00', true, '{1,2,3,4,5,6,7}'),
(4, 'fasting', '07:15:00', true, '{1,2,3,4,5,6,7}');

-- Insert shared reports
INSERT INTO shared_reports (user_id, share_token, report_type, date_range_start, date_range_end, is_active, expires_at) VALUES
(1, 'abc123xyz789', 'full', '2025-01-01', '2025-01-31', true, '2025-02-10 23:59:59'),
(2, 'def456uvw012', 'summary', '2025-01-01', '2025-01-15', true, '2025-02-15 23:59:59'),
(3, 'ghi789rst345', 'full', '2024-12-01', '2025-01-31', false, '2025-01-31 23:59:59'),
(4, 'jkl012mno678', 'summary', '2025-01-01', '2025-01-31', true, '2025-03-01 23:59:59');
