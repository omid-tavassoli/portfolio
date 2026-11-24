CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    access_key VARCHAR(255)
);
CREATE TABLE about (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- the "// currently" card next to about; one row (id = 1); email/phone come from contact
CREATE TABLE currently (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(255) NOT NULL,              -- row with the pulse dot
    available BOOLEAN NOT NULL DEFAULT TRUE,   -- pulse dot green + animated, or grey
    location VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    focus VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- hero chips: up to 5, each on one of the 5 fixed positions around the name (c1…c5)
CREATE TABLE chips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot TINYINT NOT NULL UNIQUE,              -- position 1–5
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(64) NOT NULL,                 -- Bootstrap icon class, e.g. bi-box-seam
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (slot BETWEEN 1 AND 5)
);
-- marquee words in normal spelling (shown in capitals), in creation order
CREATE TABLE marquee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(40) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- the order here is the display order (ORDER BY on an ENUM sorts by position)
    header ENUM('Programming Languages', 'Backend & Security', 'Frontend & Data', 'Machine Learning', 'AI', 'DevOps & Tools', 'Tools', 'Languages') NOT NULL,
    skill VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) ,
    github_url VARCHAR(255) ,
    live_url VARCHAR(255) ,
    technologies TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE journey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('education', 'experience','internship','work','volunteer','other') NOT NULL,
    timeline VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_time (email, attempted_at),
    INDEX idx_ip_time (ip, attempted_at),
    INDEX idx_time (attempted_at)
);
CREATE TABLE contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    github_url VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);