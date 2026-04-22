-- Migration: Create Testimonials Table and Settings for Testimonial Limit

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  occupation VARCHAR(255) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- Memastikan satu user hanya punya satu testimoni
);

-- Update settings table to include testimonial limit if it exists, 
-- or you can use a general settings approach. 
-- Assuming you have a settings table with a 'key' and 'value' structure or similar.
-- If not, we will create/update the landing_page settings.

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_public ON testimonials (is_public);
