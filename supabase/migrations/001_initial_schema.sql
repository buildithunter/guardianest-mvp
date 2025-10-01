-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'child');
CREATE TYPE user_tier AS ENUM ('free', 'premium', 'family');
CREATE TYPE subscription_plan AS ENUM ('free', 'premium', 'family');
CREATE TYPE subscription_source AS ENUM ('stripe', 'apple', 'google');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'parent',
    dob DATE,
    tier user_tier NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'base64'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
    daily_turn_cap INTEGER NOT NULL DEFAULT 10 CHECK (daily_turn_cap > 0),
    bedtime_start TIME NOT NULL DEFAULT '20:00',
    bedtime_end TIME NOT NULL DEFAULT '07:00',
    subjects TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    turns INTEGER NOT NULL DEFAULT 0 CHECK (turns >= 0),
    stories INTEGER NOT NULL DEFAULT 0 CHECK (stories >= 0),
    seconds_tts INTEGER NOT NULL DEFAULT 0 CHECK (seconds_tts >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, date)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'free',
    source subscription_source NOT NULL DEFAULT 'stripe',
    status subscription_status NOT NULL DEFAULT 'active',
    external_id TEXT, -- Stripe subscription ID, App Store transaction ID, etc.
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_settings_child_id ON settings(child_id);
CREATE INDEX idx_usage_child_id_date ON usage(child_id, date);
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children" ON children
    FOR SELECT USING (
        auth.uid() = parent_id OR 
        auth.uid() IN (
            SELECT p.id FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'child'
            AND EXISTS (
                SELECT 1 FROM children c 
                WHERE c.id = children.id AND c.invite_code IS NOT NULL
            )
        )
    );

CREATE POLICY "Parents can insert children" ON children
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children" ON children
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children" ON children
    FOR DELETE USING (auth.uid() = parent_id);

-- RLS Policies for settings
CREATE POLICY "Parents can manage child settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM children c 
            WHERE c.id = child_id AND c.parent_id = auth.uid()
        )
    );

-- RLS Policies for usage
CREATE POLICY "Parents and children can view usage" ON usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM children c 
            WHERE c.id = child_id 
            AND (c.parent_id = auth.uid() OR auth.uid() IN (
                SELECT p.id FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'child'
            ))
        )
    );

CREATE POLICY "System can insert usage" ON usage
    FOR INSERT WITH CHECK (true); -- Will be restricted by app logic

CREATE POLICY "System can update usage" ON usage
    FOR UPDATE USING (true); -- Will be restricted by app logic

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = profile_id);
