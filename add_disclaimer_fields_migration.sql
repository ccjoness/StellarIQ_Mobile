-- Migration to add disclaimer agreement fields to users table
-- Run this SQL script on your database to add the new fields

-- Add disclaimer agreement fields to users table
ALTER TABLE users 
ADD COLUMN agreed_to_disclaimer BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN disclaimer_agreed_at TIMESTAMP WITH TIME ZONE;

-- Update existing users to have agreed to disclaimer (for backward compatibility)
-- You may want to handle this differently based on your requirements
UPDATE users 
SET agreed_to_disclaimer = TRUE, 
    disclaimer_agreed_at = created_at 
WHERE agreed_to_disclaimer = FALSE;

-- Add comment to document the fields
COMMENT ON COLUMN users.agreed_to_disclaimer IS 'Whether user has agreed to educational disclaimer';
COMMENT ON COLUMN users.disclaimer_agreed_at IS 'Timestamp when user agreed to educational disclaimer';
