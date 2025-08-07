-- Insert sample user (password would be hashed in real application)
INSERT INTO users (email, name, password_hash) VALUES 
('john.doe@example.com', 'John Doe', '$2b$10$example_hash_here')
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for sample data
DO $$
DECLARE
    sample_user_id INTEGER;
BEGIN
    SELECT id INTO sample_user_id FROM users WHERE email = 'john.doe@example.com';
    
    -- Insert sample sugar readings for the past 30 days
    INSERT INTO sugar_readings (user_id, reading_type, sugar_level, reading_date, reading_time, notes) VALUES
    (sample_user_id, 'fasting', 89, CURRENT_DATE, '07:30:00', 'Morning reading before breakfast'),
    (sample_user_id, 'random', 145, CURRENT_DATE - INTERVAL '1 day', '14:15:00', 'After lunch'),
    (sample_user_id, 'fasting', 92, CURRENT_DATE - INTERVAL '1 day', '07:45:00', 'Morning reading'),
    (sample_user_id, 'random', 168, CURRENT_DATE - INTERVAL '2 days', '18:30:00', 'After dinner - felt a bit high'),
    (sample_user_id, 'fasting', 87, CURRENT_DATE - INTERVAL '2 days', '07:20:00', 'Good morning reading'),
    (sample_user_id, 'random', 142, CURRENT_DATE - INTERVAL '3 days', '15:45:00', 'Afternoon snack'),
    (sample_user_id, 'fasting', 95, CURRENT_DATE - INTERVAL '3 days', '07:15:00', 'Morning reading'),
    (sample_user_id, 'random', 138, CURRENT_DATE - INTERVAL '4 days', '13:20:00', 'Post lunch'),
    (sample_user_id, 'fasting', 88, CURRENT_DATE - INTERVAL '4 days', '07:40:00', 'Morning reading'),
    (sample_user_id, 'random', 155, CURRENT_DATE - INTERVAL '5 days', '16:10:00', 'Late afternoon'),
    (sample_user_id, 'fasting', 91, CURRENT_DATE - INTERVAL '5 days', '07:25:00', 'Morning reading'),
    (sample_user_id, 'random', 133, CURRENT_DATE - INTERVAL '6 days', '12:45:00', 'Before lunch'),
    (sample_user_id, 'fasting', 86, CURRENT_DATE - INTERVAL '6 days', '07:35:00', 'Good morning reading'),
    (sample_user_id, 'random', 149, CURRENT_DATE - INTERVAL '7 days', '19:15:00', 'After dinner');
    
    -- Insert sample reminders
    INSERT INTO reminders (user_id, reminder_type, reminder_time, days_of_week) VALUES
    (sample_user_id, 'fasting', '07:00:00', '{1,2,3,4,5,6,7}'),
    (sample_user_id, 'random', '14:00:00', '{1,2,3,4,5}'),
    (sample_user_id, 'random', '19:00:00', '{1,2,3,4,5,6,7}');
    
END $$;
