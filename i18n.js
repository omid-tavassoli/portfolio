/* i18n.js — shared EN/DE dictionary + language engine for all themes.
   Usage: <span data-i18n="key">, <p data-i18n-html="key">, <input data-i18n-ph="key">
   API: window.SITE_LANG, window.t(key), window.setLang('de'|'en')
   Event: 'ot:lang' fires on every language change (tour script listens). */
(function () {
    const D = {
        en: {
            'nav.about': 'About', 'nav.skills': 'Skills', 'nav.projects': 'Projects',
            'nav.journey': 'Journey', 'nav.experience': 'Experience', 'nav.education': 'Education', 'nav.contact': 'Contact',
            'hero.craft': 'I craft ', 'hero.as': 'as a CS student @ TU Darmstadt',
            'hero.tour': 'Take the guided tour ✦', 'hero.touch': 'Get in touch',
            'rotor.words': ['secure backends', 'AI-powered products', 'fast APIs', 'production systems'],
            'rotor.aurora': ['backend systems.', 'secure APIs.', 'AI solutions.', 'full-stack apps.'],
            'hero.tag': '// hi, my name is', 'hero.engineer': 'I engineer ',
            'hero.bio': 'Computer Science student at TU Darmstadt and aspiring software developer. Focused on backend systems, AI integration, and IT security — building secure, scalable solutions that make a difference.',
            'cta.view': ' view projects ', 'cta.touch': 'get in touch ',
            'eb.about': 'about', 'eb.arsenal': 'arsenal', 'eb.work': 'selected work', 'eb.path': 'the path', 'eb.next': "what's next?",
            'about.title': 'Behind the <span class="grad-text">code</span>', 'about.me': 'About Me',
            'about.p1': 'I\'m a <em>Computer Science student at TU Darmstadt</em> with a passion for crafting efficient, secure, and scalable software. My work sits at the intersection of <em>backend engineering</em>, <em>AI integration</em>, and <em>IT security</em>.',
            'about.p2': 'I ship end-to-end: <em>FinTrack</em>, an AI-powered finance tracker, and <em>BookIT</em>, a race-condition-safe booking platform, both run <em>live in production</em> on my own Hetzner infrastructure — alongside an <em>AI agent platform</em> built for [ui!] Urban Mobility Innovations during my Praktikum.',
            'about.p3': 'Outside of engineering, I lead a service team at a restaurant — sharpening <em>coordination under pressure</em> and <em>team responsibility</em>.',
            'now.head': '// currently', 'now.open': 'open to Werkstudent roles', 'now.degree': 'B.Sc. CS @ TU Darmstadt', 'now.focus': 'backend · AI · security',
            'stats.live': 'apps live in production', 'stats.shipped': 'projects shipped', 'stats.tech': 'technologies',
            'skills.title': 'Technical <span class="grad-text">skills</span>', 'skills.aurora': 'Technical Skills',
            'sk.lang': 'Languages', 'sk.backend': 'Backend &amp; Security', 'sk.frontend': 'Frontend', 'sk.db': 'Databases', 'sk.devops': 'DevOps &amp; AI',
            'proj.title': 'Things I\'ve <span class="grad-text">built</span>', 'proj.aurora': 'Projects',
            'badge.live': '● live', 'badge.proto': 'prototype', 'badge.code': 'code',
            'p.fin.desc': 'AI-powered personal finance tracker. Upload a bank-statement PDF and Gemini Vision extracts the transactions; a two-stage engine — deterministic rules first, Gemini fallback second — categorizes them. Z-score anomaly detection flags unusual spending, and a natural-language query engine answers questions like "how much did I spend on groceries in May?".',
            'p.book.desc': 'Booking platform engineered against race conditions: PostgreSQL advisory locks make double-booking impossible under concurrent requests. Laravel 11 API with Sanctum auth, Redis caching and queue-based e-mail — deployed with Docker and Nginx on a Hetzner VPS.',
            'p.ui.desc': 'Built during my Praktikum for [ui!] Urban Mobility Innovations: a scalable platform for analysing urban mobility data. Strict service/database layer separation and secure JWT + RBAC auth flows for complex user access control.',
            'p.edu.desc': 'Built in an AI-entrepreneurship course: one semester to go from problem to AI product to business model. EduFund helps students in Germany discover funding programmes (Förderungen) — the deployed prototype ships the full UI plus a working Gemini-powered advisor chat.',
            'link.live': 'live demo', 'link.code': 'code', 'link.proto': 'live prototype', 'link.more': 'more on github',
            'journey.title': 'My <span class="grad-text">journey</span>',
            'badge.work': 'work', 'badge.edu': 'education',
            'j1.role': 'Service Lead &amp; Staff',
            'j1.desc': 'Coordinating team workflows under time pressure, structured task delegation, and leadership responsibility in a fast-paced environment.',
            'j2.role': 'B.Sc. Computer Science',
            'j2.desc': 'Software engineering, system architecture, AI integration, parallel programming, and IT security.',
            'j3.role': 'Studienkolleg — Computertechnik',
            'j3.desc': 'University preparatory programme focused on computer technology and engineering fundamentals.',
            'exp.j2.role': 'Software Projects — University &amp; Industry',
            'exp.j2.l1': 'FinTrack &amp; BookIT shipped to production on my own infrastructure',
            'exp.j2.l2': 'AI agent platform for [ui!] Urban Mobility Innovations (Praktikum)',
            'contact.title': "Let's build something", 'contact.aurora': 'Get In Touch',
            'contact.sub': "I'm open to new opportunities, collaborations, and interesting conversations. Whether you have a project idea or just want to say hello — my inbox is always open.",
            'contact.cta': 'Say Hello ✦', 'cta.hello': ' say hello ',
            'footer.by': 'Designed &amp; built by <b>Omid Tavassoli</b> — © 2026',
            'footer.aurora': 'Designed &amp; Built by <span>Omid Tavassoli</span>'
        },
        de: {
            'nav.about': 'Über mich', 'nav.skills': 'Skills', 'nav.projects': 'Projekte',
            'nav.journey': 'Werdegang', 'nav.experience': 'Erfahrung', 'nav.education': 'Ausbildung', 'nav.contact': 'Kontakt',
            'hero.craft': 'Ich baue ', 'hero.as': 'als Informatikstudent @ TU Darmstadt',
            'hero.tour': 'Zur geführten Tour ✦', 'hero.touch': 'Kontakt aufnehmen',
            'rotor.words': ['sichere Backends', 'KI-Produkte', 'schnelle APIs', 'Produktivsysteme'],
            'rotor.aurora': ['Backend-Systeme.', 'sichere APIs.', 'KI-Lösungen.', 'Full-Stack-Apps.'],
            'hero.tag': '// hi, mein Name ist', 'hero.engineer': 'Ich entwickle ',
            'hero.bio': 'Informatikstudent an der TU Darmstadt und angehender Softwareentwickler. Fokus auf Backend-Systeme, KI-Integration und IT-Sicherheit — ich baue sichere, skalierbare Lösungen, die etwas bewirken.',
            'cta.view': ' Projekte ansehen ', 'cta.touch': 'Kontakt aufnehmen ',
            'eb.about': 'über mich', 'eb.arsenal': 'Werkzeugkasten', 'eb.work': 'ausgewählte Arbeiten', 'eb.path': 'der Weg', 'eb.next': 'wie weiter?',
            'about.title': 'Hinter dem <span class="grad-text">Code</span>', 'about.me': 'Über mich',
            'about.p1': 'Ich bin <em>Informatikstudent an der TU Darmstadt</em> mit einer Leidenschaft für effiziente, sichere und skalierbare Software. Meine Arbeit liegt an der Schnittstelle von <em>Backend-Engineering</em>, <em>KI-Integration</em> und <em>IT-Sicherheit</em>.',
            'about.p2': 'Ich liefere Ende-zu-Ende: <em>FinTrack</em>, ein KI-gestützter Finanztracker, und <em>BookIT</em>, eine Buchungsplattform ohne Race Conditions, laufen beide <em>live in Produktion</em> auf meiner eigenen Hetzner-Infrastruktur — daneben eine <em>KI-Agenten-Plattform</em>, die ich im Praktikum für [ui!] Urban Mobility Innovations gebaut habe.',
            'about.p3': 'Neben dem Engineering leite ich ein Serviceteam in einem Restaurant — das schärft <em>Koordination unter Druck</em> und <em>Verantwortung im Team</em>.',
            'now.head': '// aktuell', 'now.open': 'offen für Werkstudent-Stellen', 'now.degree': 'B.Sc. Informatik @ TU Darmstadt', 'now.focus': 'Backend · KI · Security',
            'stats.live': 'Apps live in Produktion', 'stats.shipped': 'Projekte umgesetzt', 'stats.tech': 'Technologien',
            'skills.title': 'Technische <span class="grad-text">Skills</span>', 'skills.aurora': 'Technische Skills',
            'sk.lang': 'Sprachen', 'sk.backend': 'Backend &amp; Security', 'sk.frontend': 'Frontend', 'sk.db': 'Datenbanken', 'sk.devops': 'DevOps &amp; KI',
            'proj.title': 'Was ich <span class="grad-text">gebaut</span> habe', 'proj.aurora': 'Projekte',
            'badge.live': '● live', 'badge.proto': 'Prototyp', 'badge.code': 'Code',
            'p.fin.desc': 'KI-gestützter persönlicher Finanztracker. Kontoauszug als PDF hochladen — Gemini Vision extrahiert die Transaktionen; eine zweistufige Engine (erst deterministische Regeln, dann Gemini als Fallback) kategorisiert sie. Z-Score-Anomalieerkennung markiert ungewöhnliche Ausgaben, und eine natürlichsprachliche Abfrage-Engine beantwortet Fragen wie „Wie viel habe ich im Mai für Lebensmittel ausgegeben?".',
            'p.book.desc': 'Buchungsplattform, konstruiert gegen Race Conditions: PostgreSQL Advisory Locks machen Doppelbuchungen unter parallelen Anfragen unmöglich. Laravel-11-API mit Sanctum-Auth, Redis-Caching und Queue-basiertem E-Mail-Versand — deployt mit Docker und Nginx auf einem Hetzner-VPS.',
            'p.ui.desc': 'Im Praktikum für [ui!] Urban Mobility Innovations gebaut: eine skalierbare Plattform zur Analyse urbaner Mobilitätsdaten. Strikte Trennung von Service- und Datenbankschicht sowie sichere JWT-+-RBAC-Auth-Flows für komplexe Zugriffsrechte.',
            'p.edu.desc': 'Entstanden in einem KI-Entrepreneurship-Kurs: in einem Semester vom Problem zum KI-Produkt zum Geschäftsmodell. EduFund hilft Studierenden in Deutschland, Förderprogramme zu finden — der deployte Prototyp umfasst das komplette UI plus einen funktionierenden Gemini-Berater-Chat.',
            'link.live': 'Live-Demo', 'link.code': 'Code', 'link.proto': 'Live-Prototyp', 'link.more': 'mehr auf GitHub',
            'journey.title': 'Mein <span class="grad-text">Werdegang</span>',
            'badge.work': 'Job', 'badge.edu': 'Ausbildung',
            'j1.role': 'Service Lead &amp; Staff',
            'j1.desc': 'Koordination von Teamabläufen unter Zeitdruck, strukturierte Aufgabenverteilung und Führungsverantwortung in einem schnellen Umfeld.',
            'j2.role': 'B.Sc. Informatik',
            'j2.desc': 'Software-Engineering, Systemarchitektur, KI-Integration, parallele Programmierung und IT-Sicherheit.',
            'j3.role': 'Studienkolleg — Computertechnik',
            'j3.desc': 'Studienvorbereitung mit Schwerpunkt Computertechnik und ingenieurwissenschaftliche Grundlagen.',
            'exp.j2.role': 'Softwareprojekte — Uni &amp; Industrie',
            'exp.j2.l1': 'FinTrack &amp; BookIT live in Produktion auf eigener Infrastruktur',
            'exp.j2.l2': 'KI-Agenten-Plattform für [ui!] Urban Mobility Innovations (Praktikum)',
            'contact.title': 'Lass uns etwas bauen', 'contact.aurora': 'Melde dich',
            'contact.sub': 'Ich bin offen für neue Chancen, Kooperationen und spannende Gespräche. Ob Projektidee oder einfach nur ein Hallo — mein Postfach ist immer offen.',
            'contact.cta': 'Sag Hallo ✦', 'cta.hello': ' sag Hallo ',
            'footer.by': 'Entworfen &amp; gebaut von <b>Omid Tavassoli</b> — © 2026',
            'footer.aurora': 'Entworfen &amp; gebaut von <span>Omid Tavassoli</span>'
        }
    };

    function detect() {
        try {
            const saved = localStorage.getItem('ot-lang');
            if (saved === 'de' || saved === 'en') return saved;
        } catch (e) { }
        return (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
    }

    window.SITE_LANG = detect();
    window.t = function (key) {
        return (D[window.SITE_LANG] && D[window.SITE_LANG][key]) ?? D.en[key] ?? key;
    };

    function apply() {
        document.documentElement.lang = window.SITE_LANG;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = window.t(el.dataset.i18n);
            if (typeof v === 'string') el.textContent = v.replace(/&amp;/g, '&');
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const v = window.t(el.dataset.i18nHtml);
            if (typeof v === 'string') el.innerHTML = v;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const v = window.t(el.dataset.i18nPh);
            if (typeof v === 'string') el.placeholder = v;
        });
        document.querySelectorAll('[data-setlang]').forEach(b =>
            b.classList.toggle('active', b.dataset.setlang === window.SITE_LANG));
    }

    window.setLang = function (l) {
        if (l !== 'de' && l !== 'en') return;
        window.SITE_LANG = l;
        try { localStorage.setItem('ot-lang', l); } catch (e) { }
        apply();
        dispatchEvent(new CustomEvent('ot:lang', { detail: l }));
    };

    addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-setlang]').forEach(b =>
            b.addEventListener('click', () => window.setLang(b.dataset.setlang)));
        apply();
        dispatchEvent(new CustomEvent('ot:lang', { detail: window.SITE_LANG }));
    });
})();
