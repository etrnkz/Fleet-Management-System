-- Add profileImage column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profileImage'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN "profileImage" text;
    END IF;
END $$;