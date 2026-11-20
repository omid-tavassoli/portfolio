-- Rename the skill groups to the six groups on the CV and add the spoken languages back.
-- Run once after 001 on databases created before this change (new ones get this ENUM from schema.sql).
-- MySQL commits ALTER TABLE immediately, so the column is widened to VARCHAR while the rows are renamed.

SET NAMES utf8mb4;

ALTER TABLE skills MODIFY header VARCHAR(255) NOT NULL;

UPDATE skills SET header = 'Programming Languages' WHERE header = 'Languages';
UPDATE skills SET header = 'Frontend & Data'       WHERE header IN ('Frontend', 'Databases');
UPDATE skills SET header = 'Machine Learning'      WHERE header = 'AI';
UPDATE skills SET header = 'DevOps & Tools'        WHERE header = 'DevOps';

INSERT INTO skills (header, skill) VALUES
    ('Languages', 'German C1 (business fluent)'),
    ('Languages', 'English C1 (business fluent)'),
    ('Languages', 'Persian (native)');

-- fails if any header is outside the list, so nothing is silently changed
ALTER TABLE skills
    MODIFY header ENUM('Programming Languages', 'Backend & Security', 'Frontend & Data', 'Machine Learning', 'DevOps & Tools', 'Languages') NOT NULL;
