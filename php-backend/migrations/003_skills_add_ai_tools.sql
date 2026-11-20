-- Add the skill groups 'AI' and 'Tools'. Run once after 002 on databases created before this change.
-- Existing rows keep their group: MySQL maps ENUM values by name when the list changes.
-- The order is the display order (ORDER BY on an ENUM sorts by position).

ALTER TABLE skills
    MODIFY header ENUM('Programming Languages', 'Backend & Security', 'Frontend & Data', 'Machine Learning', 'AI', 'DevOps & Tools', 'Tools', 'Languages') NOT NULL;
