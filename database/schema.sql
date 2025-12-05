-- NameMemory Database Schema
-- PostgreSQL version

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Groups table (using double quotes because 'groups' is a reserved keyword)
CREATE TABLE IF NOT EXISTS "groups" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_groups_owner ON "groups"(owner_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for groups updated_at
DROP TRIGGER IF EXISTS update_groups_updated_at ON "groups";
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON "groups"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- People table
CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES "groups"(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    suffix VARCHAR(20) DEFAULT NULL,
    nickname VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    photo_url VARCHAR(500) DEFAULT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_people_group ON people(group_id);

-- Trigger for people updated_at
DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Permission type for group shares
DO $$ BEGIN
    CREATE TYPE permission_type AS ENUM ('view', 'edit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Group shares table
CREATE TABLE IF NOT EXISTS group_shares (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES "groups"(id) ON DELETE CASCADE,
    shared_with_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission permission_type NOT NULL DEFAULT 'view',
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_shares_shared_with ON group_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shares_group ON group_shares(group_id);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_resets_email ON password_resets(email);
