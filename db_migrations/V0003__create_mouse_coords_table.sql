-- Create mouse_coords table for WebSocket tracking
CREATE TABLE IF NOT EXISTS mouse_coords (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mouse_coords_session ON mouse_coords(session_id);
CREATE INDEX IF NOT EXISTS idx_mouse_coords_created_at ON mouse_coords(created_at DESC);