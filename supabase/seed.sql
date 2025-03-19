-- -- Seed data for development and testing
-- -- This file is referenced in config.toml and will be used during db:reset

-- -- Sample users (passwords would be managed by auth.users in a real setup)
-- INSERT INTO users (id, email, first_name, last_name, phone, role, created_at)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'pro@example.com', 'Pro', 'User', '+33612345678', 'pro', NOW()),
--   ('00000000-0000-0000-0000-000000000002', 'client@example.com', 'Client', 'User', '+33687654321', 'client', NOW());

-- -- Sample professional
-- INSERT INTO professionals (id, user_id, business_name, description, address, city, zipcode, phone, website, created_at)
-- VALUES 
--   ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Pro Beauty Salon', 
--    'A professional beauty salon offering various services', '123 Main Street', 'Paris', '75001', 
--    '+33612345678', 'https://example.com', NOW());

-- -- Sample services
-- INSERT INTO services (id, pro_id, name, description, price, duration, category, created_at)
-- VALUES 
--   ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Haircut', 
--    'Professional haircut service', 35.00, 30, 'hair', NOW()),
--   ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Manicure', 
--    'Professional manicure service', 25.00, 45, 'nails', NOW()),
--   ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Facial', 
--    'Relaxing facial treatment', 50.00, 60, 'skin', NOW());

-- -- Sample opening hours
-- INSERT INTO opening_hours (pro_id, day_of_week, open, start_time, end_time, break_start_time, break_end_time)
-- VALUES 
--   ('10000000-0000-0000-0000-000000000001', 'monday', true, '09:00', '18:00', '12:00', '13:00'),
--   ('10000000-0000-0000-0000-000000000001', 'tuesday', true, '09:00', '18:00', '12:00', '13:00'),
--   ('10000000-0000-0000-0000-000000000001', 'wednesday', true, '09:00', '18:00', '12:00', '13:00'),
--   ('10000000-0000-0000-0000-000000000001', 'thursday', true, '09:00', '18:00', '12:00', '13:00'),
--   ('10000000-0000-0000-0000-000000000001', 'friday', true, '09:00', '18:00', '12:00', '13:00'),
--   ('10000000-0000-0000-0000-000000000001', 'saturday', true, '10:00', '16:00', NULL, NULL),
--   ('10000000-0000-0000-0000-000000000001', 'sunday', false, NULL, NULL, NULL, NULL);

-- -- Sample photos
-- INSERT INTO photos (pro_id, url, alt, featured)
-- VALUES 
--   ('10000000-0000-0000-0000-000000000001', 'https://example.com/photos/salon1.jpg', 'Salon interior', true),
--   ('10000000-0000-0000-0000-000000000001', 'https://example.com/photos/salon2.jpg', 'Salon services', false);

-- -- Sample appointment
-- INSERT INTO appointments (
--   pro_id, client_id, client_email, client_name, client_phone, 
--   start_time, end_time, service_id, status, notes, created_at
-- )
-- VALUES (
--   '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 
--   'client@example.com', 'Client User', '+33687654321',
--   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', 
--   '20000000-0000-0000-0000-000000000001', 'confirmed', 'First time client', NOW()
-- );
