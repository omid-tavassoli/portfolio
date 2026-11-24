-- Portfolio content from lebenslauf-omid-tavassoli.pdf.
-- Intended for an empty database (runs after schema.sql); running it twice duplicates skills, projects and journey rows.

SET NAMES utf8mb4;
START TRANSACTION;

-- about: single row, the models read and write id = 1
INSERT INTO about (id, title, description) VALUES (
    1,
    'Fullstack Developer — Java, PHP, Python',
    'Computer Science student (B.Sc.) at TU Darmstadt, expected to graduate in autumn 2027, followed by a Master''s with a focus on AI. Backend developer focused on Java/Spring Boot and PHP/Laravel: I designed, built and operate two production web applications entirely on my own — from the data model and REST API through JWT/RBAC authentication to Docker deployment on my own Linux server. Plus one year of hands-on experience with AI systems (LangChain agents, PyTorch) from two project internships with Fraunhofer SIT and [ui!]. Available immediately, 20 hours per week.'
);

-- currently: single row, id = 1 (the "// currently" card next to about)
INSERT INTO currently (id, status, available, location, degree, focus) VALUES
    (1, 'open to Werkstudent roles', TRUE, 'Darmstadt, Germany', 'B.Sc. CS @ TU Darmstadt', 'backend · AI · security');

-- hero chips (slot = one of the 5 positions around the name)
INSERT INTO chips (slot, label, icon) VALUES
    (1, 'Spring Boot', 'bi-lightning-charge-fill'),
    (2, 'Next.js', 'bi-braces'),
    (3, 'PostgreSQL', 'bi-database-fill'),
    (4, 'Docker', 'bi-box-seam'),
    (5, 'Gemini API', 'bi-stars');

-- marquee words
INSERT INTO marquee (label) VALUES
    ('Spring Boot'), ('FastAPI'), ('Laravel'), ('Next.js'), ('React'), ('PostgreSQL'), ('Redis'),
    ('Docker'), ('Gemini API'), ('Python'), ('JWT'), ('RBAC'), ('Linux');

-- contact: single row, id = 1
INSERT INTO contact (id, header, email, phone, github_url, linkedin_url, description) VALUES (
    1,
    'Let''s build something',
    'omidtavassoli99@gmail.com',
    '+49 178 7565660',
    'https://github.com/omid-tavassoli',
    'https://linkedin.com/in/omid-tavassoli',
    'Available immediately for 20 hours per week. Whether you have a project idea or just want to say hello — my inbox is always open.'
);

-- skills: one row per skill
INSERT INTO skills (header, skill) VALUES
    ('Programming Languages', 'Java'),
    ('Programming Languages', 'PHP'),
    ('Programming Languages', 'Python'),
    ('Programming Languages', 'JavaScript'),
    ('Programming Languages', 'SQL'),
    ('Programming Languages', 'C++'),
    ('Backend & Security', 'Spring Boot 3'),
    ('Backend & Security', 'Laravel 11'),
    ('Backend & Security', 'FastAPI'),
    ('Backend & Security', 'Node.js'),
    ('Backend & Security', 'REST APIs'),
    ('Backend & Security', 'JWT'),
    ('Backend & Security', 'RBAC'),
    ('Backend & Security', 'OAuth2'),
    ('Backend & Security', 'Sanctum'),
    ('Frontend & Data', 'React'),
    ('Frontend & Data', 'Next.js 14'),
    ('Frontend & Data', 'HTML5'),
    ('Frontend & Data', 'CSS3'),
    ('Frontend & Data', 'PostgreSQL'),
    ('Frontend & Data', 'MySQL'),
    ('Frontend & Data', 'Redis'),
    ('Frontend & Data', 'SQLite'),
    ('Frontend & Data', 'SQLAlchemy'),
    ('Frontend & Data', 'Flyway'),
    ('Machine Learning', 'PyTorch'),
    ('Machine Learning', 'LangChain'),
    ('Machine Learning', 'LangGraph'),
    ('DevOps & Tools', 'Docker'),
    ('DevOps & Tools', 'Nginx'),
    ('DevOps & Tools', 'Linux'),
    ('DevOps & Tools', 'Git'),
    ('DevOps & Tools', 'Shell Scripting'),
    ('Languages', 'German C1 (business fluent)'),
    ('Languages', 'English C1 (business fluent)'),
    ('Languages', 'Persian (native)');

-- projects
INSERT INTO projects (title, description, image_url, github_url, live_url, technologies) VALUES
    (
        'FinTrack',
        'Finance tracker with AI-powered analysis. Automatically turns uploaded bank statements into an analysable transaction history. Gemini Vision extracts the transactions from PDFs and images; a two-stage engine categorises them rule-based first and only falls back to the model when it is uncertain. Anomaly detection via z-scores and natural-language queries.',
        NULL,
        'https://github.com/omid-tavassoli/fintrack',
        'https://fintrack.omidtavassoli.dev',
        'Spring Boot 3, PostgreSQL, Flyway, Next.js 14, Gemini 2.5, Docker, JWT'
    ),
    (
        'BookIT',
        'Booking platform for service appointments. The core problem is concurrency: PostgreSQL advisory locks ensure the same appointment is only booked once, even under simultaneous requests. REST API with Sanctum authentication, Redis caching and asynchronous e-mail sending via a queue.',
        NULL,
        'https://github.com/omid-tavassoli/bookit',
        'https://bookit.omidtavassoli.dev',
        'Laravel 11, PostgreSQL, Redis, Next.js 14, Sanctum, Docker'
    );

-- journey: shown in id order, so newest first
INSERT INTO journey (type, timeline, title, institution, description) VALUES
    (
        'internship',
        '04/2026 – 09/2026',
        'AI Internship — Explainable AI (DeCNeC project)',
        'Fraunhofer SIT / ATHENE in cooperation with TU Darmstadt',
        'Trained my own machine-learning models from scratch in PyTorch for face-based age estimation with a focus on explainability; built the training and evaluation pipeline and ran an ablation study on UTKFace (Sapiens, SAM, MiVOLO).'
    ),
    (
        'internship',
        '10/2025 – 03/2026',
        'Project Internship — AI Agent Platform',
        '[ui!] Urban Mobility Innovations in cooperation with TU Darmstadt',
        'Platform for analysing urban mobility data with an AI agent and chatbot interface: ReAct agent (LangChain, LangGraph) with custom tools for data querying and analysis, token streaming via SSE. Responsible for the FastAPI layer, Redis caching and JWT/RBAC access control.'
    ),
    (
        'work',
        '2023 – present',
        'Service Lead',
        'Herrn Gartencafe by Bantschow, Darmstadt',
        'Organising and coordinating the service area, leading and onboarding staff. Reference letter (Arbeitszeugnis) with the top grade available.'
    ),
    (
        'education',
        'Oct 2023 – expected 2027',
        'B.Sc. Computer Science',
        'Technische Universität Darmstadt',
        'Expected to graduate in autumn 2027, followed by a Master''s with a focus on AI.'
    ),
    (
        'education',
        'Oct 2022 – Jul 2023',
        'Studienkolleg — Computer Engineering',
        'Universität Kassel',
        'University preparatory programme with a focus on computer engineering.'
    );

COMMIT;
