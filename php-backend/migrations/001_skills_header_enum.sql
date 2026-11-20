-- Restrict skills.header to the six groups shown on the site.
-- Run once on databases created before this change (new ones get the ENUM from schema.sql).
-- The ENUM order is also the display order, because ORDER BY on an ENUM sorts by position.

SET NAMES utf8mb4;
START TRANSACTION;

UPDATE skills SET header = 'Languages' WHERE header = 'Programming Languages';
UPDATE skills SET header = 'DevOps'    WHERE header = 'DevOps & Tools';
UPDATE skills SET header = 'AI'        WHERE header = 'Machine Learning';

-- spoken languages have no matching group (Languages is the programming-languages card)
DELETE FROM skills WHERE header = 'Spoken Languages';

COMMIT;

-- fails if any header is still outside the list, so nothing is silently changed
ALTER TABLE skills
    MODIFY header ENUM('Languages', 'Backend & Security', 'Frontend', 'Databases', 'DevOps', 'AI') NOT NULL;
