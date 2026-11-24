-- The "// currently" card next to About: one row (id = 1), like the about table.
-- Run once on databases created before this change (new ones get it from schema.sql + seed.sql).
-- Email and phone are not stored here; the card takes them from the contact table.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS currently (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(255) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    location VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    focus VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- the values the card showed when it was still hardcoded in index.html
INSERT IGNORE INTO currently (id, status, available, location, degree, focus) VALUES
    (1, 'open to Werkstudent roles', TRUE, 'Darmstadt, Germany', 'B.Sc. CS @ TU Darmstadt', 'backend · AI · security');
