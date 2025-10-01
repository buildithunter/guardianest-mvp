-- Insert sample profiles (note: these IDs should match actual auth.users IDs in practice)
-- For development, you'll need to create these users via Supabase auth first

-- Sample parent profile
INSERT INTO profiles (id, role, dob, tier) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'parent', '1985-06-15', 'premium');

-- Sample child profile (will be created when parent adds child via invite code)
INSERT INTO profiles (id, role, dob, tier) VALUES
  ('00000000-0000-0000-0000-000000000002'::uuid, 'child', '2010-03-20', 'free');

-- Sample children
INSERT INTO children (id, parent_id, name, age, invite_code) VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Emma Johnson', 8, 'EMMA01'),
  ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Alex Johnson', 12, 'ALEX01');

-- Sample settings for children
INSERT INTO settings (child_id, daily_turn_cap, bedtime_start, bedtime_end, subjects) VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 15, '19:30', '07:00', '{"math", "reading", "science"}'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 20, '21:00', '06:30', '{"math", "history", "english", "science"}');

-- Sample usage data
INSERT INTO usage (child_id, date, turns, stories, seconds_tts) VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '1 day', 8, 2, 480),
  ('10000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 5, 1, 240),
  ('10000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '1 day', 12, 0, 720),
  ('10000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 8, 1, 360);

-- Sample subscription
INSERT INTO subscriptions (profile_id, plan, source, status, external_id) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'premium', 'stripe', 'active', 'sub_1234567890abcdef');
