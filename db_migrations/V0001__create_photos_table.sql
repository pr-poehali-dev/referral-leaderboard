-- Create photos table for storing uploaded images
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    data BYTEA NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);