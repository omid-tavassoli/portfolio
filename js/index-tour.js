/* ═══════════ GUIDED TOUR ═══════════
   States: idle → role → transition ⇄ stop → sheet → streaming → (stay | detour)
   Questions can only be asked in 'stop' / 'sheet' states — never mid-transition. */
(function () {
    const $ = s => document.querySelector(s);
    const API = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:8090/ask' : '/api/tour/ask';

    /* ── tour content: scripted narration (NOT streamed — only real AI output streams) ── */
    /* structural facts per stop (language-independent) */
    const META = {
        about: { el: '#about' }, skills: { el: '#skills' }, projects: { el: '#projects' },
        'p-fintrack': { el: '#p-fintrack' }, 'p-bookit': { el: '#p-bookit' },
        'p-uiagent': { el: '#p-uiagent' }, 'p-edufund': { el: '#p-edufund' },
        journey: { el: '#journey' }, contact: { el: '#contact' }
    };
    /* all tour language — scripted narration is written, never model-generated */
    const TT = {
    en: {
        roles: { backend: 'backend route', ai: 'AI / ML route', fullstack: 'fullstack route', curious: 'quick look' },
        detour: 'detour', stop: 'stop', cont: 'Continue →', back: 'Back to your tour →', fin: 'Finish ✕',
        ask: 'Ask ✦', next: 'next', hint: 'swipe up to continue',
        roleTitle: 'What are you hiring for?', roleSub: "I'll pick the route — you can ask questions at every stop.",
        roleChips: { backend: 'Backend', ai: 'AI / ML', fullstack: 'Fullstack', curious: 'Just looking' },
        sheetHead: "Ask about this — answered live from Omid's CV", ph: 'Or type your own question…',
        limit: 'Question limit for this visit reached — the human is cheaper anyway: omidtavassoli99@gmail.com',
        rate: 'Rate limit reached — just e-mail Omid instead: omidtavassoli99@gmail.com',
        err: 'Something went wrong.', hiccup: 'Connection hiccup — try again, or e-mail Omid.', empty: '(no answer)',
        stops: {
            about: { title: 'About Omid', text: {
                default: "Omid is a CS student at TU Darmstadt who ships production software, not just coursework — backend engineering, AI integration and IT security. He's currently open to Werkstudent roles.",
                curious: "CS student at TU Darmstadt, builds and deploys real products on his own infrastructure, currently open to Werkstudent roles. Scroll on for the proof." },
                chips: ["What is he looking for right now?", "Where is he based?"] },
            skills: { title: 'The stack', text: {
                default: "Spring Boot, Laravel and FastAPI on the backend, PostgreSQL and Redis underneath, React and Next.js in front, Docker and Nginx around everything — all of it used in the live projects on this tour, not just listed.",
                backend: "Three backend frameworks in production use: Spring Boot 3 (FinTrack), Laravel 11 (BookIT), FastAPI ([ui!] platform). PostgreSQL everywhere, Redis where it counts, Docker + Nginx on his own Hetzner VPS." },
                chips: ["Does he know Kubernetes?", "What's his strongest backend stack?"] },
            projects: { title: 'The work', text: {
                default: "Four projects — two of them live in production on Omid's own infrastructure, one built for a company during his Praktikum, one born in an AI-entrepreneurship course. Ask about any of them, or continue for the details." },
                chips: ["Which project is most advanced?", "What's actually deployed?"] },
            'p-fintrack': { title: 'FinTrack', text: {
                default: "FinTrack is the AI showcase: Gemini Vision reads bank-statement PDFs, a rules-first engine with an LLM fallback categorizes transactions, z-scores flag anomalies, and a natural-language query engine answers questions about your spending. Live in production.",
                backend: "Under FinTrack's AI features sits a Spring Boot 3 backend: PostgreSQL with Flyway migrations, JWT auth, Dockerized behind Nginx on a Hetzner VPS. The AI parts are useless without this layer being solid — and it is.",
                ai: "This is applied AI, not a demo: Gemini Vision for PDF extraction, deterministic rules first with Gemini as fallback (cheap + predictable before clever), z-score anomaly detection, and an NL query engine over real financial data. Live in production." },
                chips: ["How does the AI categorization work?", "Why Gemini instead of a local model?", "Is this really deployed?"] },
            'p-bookit': { title: 'BookIT', text: {
                default: "BookIT solves one hard problem properly: double-booking under concurrency. PostgreSQL advisory locks guarantee a slot can't be sold twice, Sanctum handles auth, Redis caches, queues send the e-mail. Deployed and running.",
                backend: "The interesting part is invisible: advisory locks at the database level, so no two concurrent requests can book the same slot — a correctness guarantee, not a UI trick. Laravel 11, Redis, queue-based mail, Docker + Nginx on Hetzner." },
                chips: ["How does it prevent double bookings?", "What handles the authentication?"] },
            'p-uiagent': { title: 'KI-Agent Platform', text: {
                default: "Built during a Praktikum for [ui!] Urban Mobility Innovations: a scalable platform for analysing urban mobility data, with strict service/database layer separation and JWT + RBAC access control. Real company, real requirements." },
                chips: ["What did he build for [ui!]?", "Why isn't this one live?"] },
            'p-edufund': { title: 'EduFund', text: {
                default: "EduFund came out of an AI-entrepreneurship course: one semester from problem to AI product to business model. It helps students in Germany find funding programmes — the deployed prototype ships the UI plus a working Gemini-powered advisor.",
                ai: "The point of EduFund isn't the prototype — it's the course behind it: how to take an idea, build it with AI, and make it a business. The deployed piece is honest about what it is: full UI, working Gemini advisor chat, prototype status." },
                chips: ["What was the course about?", "What actually works in the prototype?"] },
            journey: { title: 'The path', text: {
                default: "Studienkolleg in Kassel, then a CS degree at TU Darmstadt — while leading a service team at a Biergarten, which teaches more about coordination under pressure than most lectures do." },
                chips: ["What does the restaurant job add?", "What is a Studienkolleg?"] },
            contact: { title: "That's the tour", text: {
                default: "Two live products, a company project, and an AI venture prototype — built by a student who deploys what he writes. If that fits what you're hiring for, the inbox is open, and he answers fast." },
                chips: ["What's the best way to reach him?"] }
        }
    },
    de: {
        roles: { backend: 'Backend-Route', ai: 'KI/ML-Route', fullstack: 'Fullstack-Route', curious: 'Kurzbesuch' },
        detour: 'Abstecher', stop: 'Stopp', cont: 'Weiter →', back: 'Zurück zur Tour →', fin: 'Fertig ✕',
        ask: 'Fragen ✦', next: 'weiter', hint: 'nach oben wischen',
        roleTitle: 'Wofür stellen Sie ein?', roleSub: 'Ich wähle die Route — Fragen sind an jedem Stopp möglich.',
        roleChips: { backend: 'Backend', ai: 'KI / ML', fullstack: 'Fullstack', curious: 'Nur schauen' },
        sheetHead: 'Frag hier nach — live beantwortet aus Omids Lebenslauf', ph: 'Oder eigene Frage tippen…',
        limit: 'Fragenlimit für diesen Besuch erreicht — der Mensch ist ohnehin günstiger: omidtavassoli99@gmail.com',
        rate: 'Rate-Limit erreicht — schreiben Sie Omid einfach direkt: omidtavassoli99@gmail.com',
        err: 'Etwas ist schiefgelaufen.', hiccup: 'Verbindungsproblem — bitte noch einmal versuchen oder Omid direkt mailen.', empty: '(keine Antwort)',
        stops: {
            about: { title: 'Über Omid', text: {
                default: 'Omid ist Informatikstudent an der TU Darmstadt und liefert Produktivsoftware, nicht nur Übungsblätter — Backend-Engineering, KI-Integration und IT-Sicherheit. Aktuell offen für Werkstudent-Stellen.',
                curious: 'Informatikstudent an der TU Darmstadt, baut und deployt echte Produkte auf eigener Infrastruktur, aktuell offen für Werkstudent-Stellen. Weiter geht es mit den Beweisen.' },
                chips: ['Was sucht er gerade?', 'Wo ist er ansässig?'] },
            skills: { title: 'Der Stack', text: {
                default: 'Spring Boot, Laravel und FastAPI im Backend, PostgreSQL und Redis darunter, React und Next.js davor, Docker und Nginx drumherum — alles davon steckt in den Live-Projekten dieser Tour, nichts steht nur auf der Liste.',
                backend: 'Drei Backend-Frameworks produktiv im Einsatz: Spring Boot 3 (FinTrack), Laravel 11 (BookIT), FastAPI ([ui!]-Plattform). Überall PostgreSQL, Redis wo es zählt, Docker + Nginx auf dem eigenen Hetzner-VPS.' },
                chips: ['Kann er Kubernetes?', 'Was ist sein stärkster Backend-Stack?'] },
            projects: { title: 'Die Arbeit', text: {
                default: 'Vier Projekte — zwei davon live in Produktion auf Omids eigener Infrastruktur, eines im Praktikum für ein Unternehmen gebaut, eines in einem KI-Entrepreneurship-Kurs entstanden. Fragen Sie zu jedem, oder weiter zu den Details.' },
                chips: ['Welches Projekt ist am weitesten?', 'Was ist wirklich deployt?'] },
            'p-fintrack': { title: 'FinTrack', text: {
                default: 'FinTrack ist das KI-Aushängeschild: Gemini Vision liest Kontoauszug-PDFs, eine Regel-zuerst-Engine mit LLM-Fallback kategorisiert Transaktionen, Z-Scores markieren Anomalien, und eine natürlichsprachliche Abfrage-Engine beantwortet Fragen zu den Ausgaben. Live in Produktion.',
                backend: 'Unter FinTracks KI-Features sitzt ein Spring-Boot-3-Backend: PostgreSQL mit Flyway-Migrationen, JWT-Auth, dockerisiert hinter Nginx auf einem Hetzner-VPS. Ohne diese solide Schicht wäre die KI wertlos — und sie ist solide.',
                ai: 'Das ist angewandte KI, keine Demo: Gemini Vision für PDF-Extraktion, deterministische Regeln zuerst mit Gemini als Fallback (erst günstig und vorhersagbar, dann clever), Z-Score-Anomalieerkennung und eine NL-Abfrage-Engine über echte Finanzdaten. Live in Produktion.' },
                chips: ['Wie funktioniert die KI-Kategorisierung?', 'Warum Gemini statt eines lokalen Modells?', 'Ist das wirklich deployt?'] },
            'p-bookit': { title: 'BookIT', text: {
                default: 'BookIT löst ein hartes Problem richtig: Doppelbuchungen unter Parallelität. PostgreSQL Advisory Locks garantieren, dass ein Slot nicht zweimal vergeben wird, Sanctum übernimmt die Auth, Redis cacht, Queues verschicken die Mails. Deployt und im Betrieb.',
                backend: 'Das Interessante ist unsichtbar: Advisory Locks auf Datenbankebene — keine zwei parallelen Requests können denselben Slot buchen. Eine Korrektheitsgarantie, kein UI-Trick. Laravel 11, Redis, Queue-Mails, Docker + Nginx auf Hetzner.' },
                chips: ['Wie verhindert es Doppelbuchungen?', 'Wie läuft die Authentifizierung?'] },
            'p-uiagent': { title: 'KI-Agent-Plattform', text: {
                default: 'Im Praktikum für [ui!] Urban Mobility Innovations gebaut: eine skalierbare Plattform zur Analyse urbaner Mobilitätsdaten, mit strikter Trennung von Service- und Datenbankschicht sowie JWT-+-RBAC-Zugriffskontrolle. Echtes Unternehmen, echte Anforderungen.' },
                chips: ['Was hat er für [ui!] gebaut?', 'Warum ist dieses Projekt nicht live?'] },
            'p-edufund': { title: 'EduFund', text: {
                default: 'EduFund stammt aus einem KI-Entrepreneurship-Kurs: ein Semester vom Problem zum KI-Produkt zum Geschäftsmodell. Es hilft Studierenden in Deutschland, Förderprogramme zu finden — der deployte Prototyp umfasst das UI plus einen funktionierenden Gemini-Berater.',
                ai: 'Der Punkt bei EduFund ist nicht der Prototyp — sondern der Kurs dahinter: eine Idee nehmen, mit KI bauen, zum Geschäft machen. Das Deployte ist ehrlich, was es ist: komplettes UI, funktionierender Gemini-Berater-Chat, Prototyp-Status.' },
                chips: ['Worum ging es im Kurs?', 'Was funktioniert im Prototyp?'] },
            journey: { title: 'Der Weg', text: {
                default: 'Studienkolleg in Kassel, dann Informatikstudium an der TU Darmstadt — parallel dazu Leitung eines Serviceteams im Biergarten, was mehr über Koordination unter Druck lehrt als die meisten Vorlesungen.' },
                chips: ['Was bringt der Restaurantjob?', 'Was ist ein Studienkolleg?'] },
            contact: { title: 'Das war die Tour', text: {
                default: 'Zwei Live-Produkte, ein Unternehmensprojekt und ein KI-Venture-Prototyp — gebaut von einem Studenten, der deployt, was er schreibt. Wenn das zu Ihrer Stelle passt: Das Postfach ist offen, und er antwortet schnell.' },
                chips: ['Wie erreicht man ihn am besten?'] }
        }
    }
    };
    const L = () => (window.SITE_LANG || 'en').startsWith('de') ? 'de' : 'en';
    const tt = () => TT[L()];
    const ROUTES = {
        backend: ['p-bookit', 'p-fintrack', 'skills', 'journey', 'contact'],
        ai: ['p-fintrack', 'p-edufund', 'p-uiagent', 'journey', 'contact'],
        fullstack: ['about', 'p-fintrack', 'p-bookit', 'p-edufund', 'skills', 'contact'],
        curious: ['about', 'projects', 'journey', 'contact']
    };

    /* ── state ── */
    const T = { st: 'idle', role: null, route: [], i: 0, detour: null, back: null, q: 0, ctrl: null, hlEl: null };
    const MAXQ = 10;

    const dim = $('#tourdim'), roleM = $('#trole'), panel = $('#tpanel'), sheet = $('#tsheet'), hint = $('#thint');

    function setState(s) {
        T.st = s;
        const atStop = s === 'stop';
        $('#task').disabled = !atStop; $('#tnext').disabled = !atStop; $('#tprev').disabled = !atStop || (T.i === 0 && !T.detour);
        $('#tsend').disabled = s === 'streaming';
        document.querySelectorAll('#tschips .tchip').forEach(c => c.disabled = s === 'streaming');
    }

    function curStop() { return T.detour || T.route[T.i]; }
    function narration(id) {
        const s = tt().stops[id];
        return (s.text[T.role] || s.text.default);
    }

    /* ── rendering ── */
    function clearHl() { if (T.hlEl) { T.hlEl.classList.remove('tour-hl'); T.hlEl = null; } }

    function renderStop(id) {
        const s = tt().stops[id];
        setState('transition');
        dim.classList.remove('clear');   /* full dim while travelling between stops */
        clearHl();
        const el = document.querySelector(META[id].el);
        el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
        $('#tprole').textContent = T.detour ? tt().detour : tt().roles[T.role];
        $('#tptitle').textContent = T.detour ? s.title : (s.title + ' — ' + tt().stop + ' ' + (T.i + 1) + ' / ' + T.route.length);
        $('#tptext').textContent = narration(id);
        $('#tstep').innerHTML = TOUCH ? '' : '<kbd>↵</kbd> ' + tt().next;
        $('#tnext').textContent = T.detour ? tt().back : (T.i === T.route.length - 1 ? tt().fin : tt().cont);
        setTimeout(() => {
            el.classList.add('tour-hl'); T.hlEl = el;
            dim.classList.add('clear');  /* spotlight (element box-shadow) now owns the darkness */
            setState('stop');
        }, RM ? 0 : 650);
    }

    /* ── lifecycle ── */
    function startTour() {
        T.q = 0; T.detour = null; T.back = null;
        hintDone = false;
        document.body.classList.add('touring');
        dim.classList.add('on');
        dim.classList.remove('clear');
        roleM.classList.add('on');
        document.body.style.overflow = 'hidden';
        T.st = 'role';
    }
    // projects come from the database, so a stop's card may not exist (e.g. a project was deleted)
    const onPage = id => META[id] && document.querySelector(META[id].el);

    function pickRole(r) {
        T.role = r; T.route = ROUTES[r].filter(onPage); T.i = 0;
        roleM.classList.remove('on');
        panel.classList.add('on');
        document.body.style.overflow = '';
        if (TOUCH) showHint();
        renderStop(curStop());
    }
    function next() {
        if (T.st !== 'stop') return;
        hideHint();
        if (T.detour) { T.detour = null; renderStop(T.route[T.i]); return; }
        if (T.i >= T.route.length - 1) { endTour(); return; }
        T.i++; renderStop(curStop());
    }
    function prev() {
        if (T.st !== 'stop') return;
        hideHint();
        if (T.detour) { T.detour = null; renderStop(T.route[T.i]); return; }
        if (T.i > 0) { T.i--; renderStop(curStop()); }
    }
    function endTour() {
        closeSheet(true);
        clearHl();
        dim.classList.remove('on'); dim.classList.remove('clear');
        panel.classList.remove('on'); roleM.classList.remove('on');
        hint.classList.remove('on');
        document.body.classList.remove('touring');
        document.body.style.overflow = '';
        T.st = 'idle'; T.detour = null;
    }
    function detourTo(target) {
        T.detour = target;
        renderStop(target);
    }

    /* ── question sheet ── */
    function openSheet() {
        if (T.st !== 'stop') return;
        const s = tt().stops[curStop()];
        const box = $('#tschips'); box.innerHTML = '';
        (s.chips || []).forEach(c => {
            const b = document.createElement('button');
            b.className = 'tchip'; b.textContent = c;
            b.addEventListener('click', () => sendQ(c));
            box.appendChild(b);
        });
        const ans = $('#tsans'); ans.style.display = 'none'; ans.className = ''; ans.textContent = '';
        $('#tsinput').value = '';
        sheet.classList.add('on');
        T.st = 'sheet';
        if (!TOUCH) $('#tsinput').focus();
    }
    function closeSheet(silent) {
        if (T.ctrl) { T.ctrl.abort(); T.ctrl = null; }
        sheet.classList.remove('on');
        if (!silent && (T.st === 'sheet' || T.st === 'streaming')) setState('stop');
    }

    function showAns() { const a = $('#tsans'); a.className = ''; a.style.display = 'block'; a.innerHTML = '<span class="tcur"></span>'; }
    function setAns(t) { const a = $('#tsans'); a.textContent = t; const c = document.createElement('span'); c.className = 'tcur'; a.appendChild(c); a.scrollTop = a.scrollHeight; }
    function finishAns(t) { $('#tsans').textContent = t || tt().empty; }
    function ansErr(t) { const a = $('#tsans'); a.style.display = 'block'; a.className = 'err'; a.textContent = t; }

    async function sendQ(q) {
        q = (q || '').trim();
        if (!q || T.st !== 'sheet') return;
        if (T.q >= MAXQ) { ansErr(tt().limit); return; }
        T.q++;
        setState('streaming'); T.st = 'streaming';
        showAns();
        $('#tsinput').value = '';
        T.ctrl = new AbortController();
        let txt = '', act = null;
        try {
            const res = await fetch(API, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: q, stop: curStop(), role: T.role || '', lang: L() }),
                signal: T.ctrl.signal
            });
            if (res.status === 429) { ansErr(tt().rate); T.st = 'sheet'; setState('stop'); T.st = 'sheet'; return; }
            if (!res.ok) throw new Error('bad status');
            const rd = res.body.getReader(), dec = new TextDecoder();
            let buf = '';
            for (;;) {
                const { done, value } = await rd.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split('\n'); buf = lines.pop();
                for (const l of lines) {
                    if (!l.startsWith('data: ')) continue;
                    let o; try { o = JSON.parse(l.slice(6)); } catch (_) { continue; }
                    if (o.t === 'c') { txt += o.text; setAns(txt); }
                    else if (o.t === 'a') { act = o.action; }
                    else if (o.t === 'e') { ansErr(o.error || tt().err); T.st = 'sheet'; return; }
                }
            }
            finishAns(txt);
            T.st = 'sheet';
            if (act && act.type === 'jump_to' && onPage(act.target)) {
                setTimeout(() => { closeSheet(true); detourTo(act.target); }, 800);
            }
        } catch (e) {
            if (e.name !== 'AbortError') { ansErr(tt().hiccup); T.st = 'sheet'; }
        } finally {
            T.ctrl = null;
            if (T.st === 'streaming') T.st = 'sheet';
            $('#tsend').disabled = false;
            document.querySelectorAll('#tschips .tchip').forEach(c => c.disabled = false);
        }
    }

    /* ── keyboard / viewport (mobile keyboard handling) ── */
    if (window.visualViewport) {
        visualViewport.addEventListener('resize', () => {
            const card = document.querySelector('.tsh-card');
            if (!sheet.classList.contains('on')) { card.style.bottom = ''; return; }
            const off = innerHeight - visualViewport.height - visualViewport.offsetTop;
            card.style.bottom = Math.min(Math.max(0, off), innerHeight * .6) + 'px';
        });
    }

    /* ── tour statics follow the language ── */
    function applyTourStatics() {
        const d = tt();
        document.querySelector('.trole-card h3').textContent = d.roleTitle;
        document.querySelector('.trole-card p').textContent = d.roleSub;
        roleM.querySelectorAll('.tchip').forEach(b => { b.textContent = d.roleChips[b.dataset.role]; });
        document.querySelector('.tsh-top span:nth-child(2)').textContent = d.sheetHead;
        $('#tsinput').placeholder = d.ph;
        $('#task').textContent = d.ask;
        hint.firstChild.textContent = d.hint + ' ';
    }
    addEventListener('ot:lang', () => {
        applyTourStatics();
        if (T.st === 'stop' || T.st === 'transition') {
            const id = curStop(), sd = tt().stops[id];
            $('#tprole').textContent = T.detour ? tt().detour : tt().roles[T.role];
            $('#tptitle').textContent = T.detour ? sd.title : (sd.title + ' — ' + tt().stop + ' ' + (T.i + 1) + ' / ' + T.route.length);
            $('#tptext').textContent = narration(id);
            $('#tstep').innerHTML = TOUCH ? '' : '<kbd>↵</kbd> ' + tt().next;
            $('#tnext').textContent = T.detour ? tt().back : (T.i === T.route.length - 1 ? tt().fin : tt().cont);
        }
    });
    addEventListener('DOMContentLoaded', applyTourStatics);

    /* ── swipe navigation (mobile): dim layer is the gesture surface ── */
    let hintDone = false;
    function showHint() { if (!hintDone) hint.classList.add('on'); }
    function hideHint() { hintDone = true; hint.classList.remove('on'); }
    let ty0 = null;
    document.addEventListener('touchstart', e => {
        if (T.st === 'idle') return;
        if (e.target.closest('.tsh-card, .trole-card, #tpanel')) { ty0 = null; return; }
        ty0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchmove', e => {
        /* only touches that BEGAN on the swipe surface are blocked (ty0 set at touchstart);
           touches on panel / sheet / role modal stay fully native: scroll + crisp taps */
        if (T.st === 'idle' || ty0 === null) return;
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', e => {
        if (ty0 === null) return;
        const dy = ty0 - e.changedTouches[0].clientY; ty0 = null;
        if (T.st !== 'stop' || Math.abs(dy) < 60) return;
        if (dy > 0) next(); else prev();
    });

    /* ── wiring ── */
    $('#tourBtn').addEventListener('click', startTour);
    $('#tourBtn').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startTour(); } });
    roleM.querySelectorAll('.tchip').forEach(b => b.addEventListener('click', () => pickRole(b.dataset.role)));
    $('#tnext').addEventListener('click', next);
    $('#tprev').addEventListener('click', prev);
    $('#task').addEventListener('click', openSheet);
    $('#texit').addEventListener('click', endTour);
    $('#tsclose').addEventListener('click', () => closeSheet(false));
    $('#tshbg').addEventListener('click', () => closeSheet(false));
    $('#tsend').addEventListener('click', () => sendQ($('#tsinput').value));
    $('#tsinput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendQ($('#tsinput').value); } });
    addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (T.st === 'sheet' || T.st === 'streaming') closeSheet(false);
            else if (T.st !== 'idle') endTour();
            return;
        }
        if (e.target.matches && e.target.matches('button, input, textarea, a')) return;
        if ((e.key === 'Enter' || e.key === 'ArrowRight') && T.st === 'stop') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft' && T.st === 'stop') { e.preventDefault(); prev(); }
    });
    /* exit tour if the visitor clicks the dimmed page outside the panel (desktop) */
    dim.addEventListener('click', () => { if (T.st === 'role') endTour(); });
})();
