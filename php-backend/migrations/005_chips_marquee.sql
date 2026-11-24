-- Hero chips and the marquee strip, editable from the dashboard.
-- Run once on databases created before this change (new ones get them from schema.sql + seed.sql).

SET NAMES utf8mb4;

-- up to 5 chips, each on one of the 5 fixed positions around the name (c1…c5 in index.css)
CREATE TABLE IF NOT EXISTS chips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot TINYINT NOT NULL UNIQUE,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (slot BETWEEN 1 AND 5)
);

-- marquee words in normal spelling (the page shows them in capitals), shown in creation order
CREATE TABLE IF NOT EXISTS marquee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(40) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- the values the page showed when they were still hardcoded in index.html
INSERT IGNORE INTO chips (slot, label, icon) VALUES
    (1, 'Spring Boot', 'bi-lightning-charge-fill'),
    (2, 'Next.js', 'bi-braces'),
    (3, 'PostgreSQL', 'bi-database-fill'),
    (4, 'Docker', 'bi-box-seam'),
    (5, 'Gemini API', 'bi-stars');

INSERT IGNORE INTO marquee (label) VALUES
    ('Spring Boot'), ('FastAPI'), ('Laravel'), ('Next.js'), ('React'), ('PostgreSQL'), ('Redis'),
    ('Docker'), ('Gemini API'), ('Python'), ('JWT'), ('RBAC'), ('Linux');
