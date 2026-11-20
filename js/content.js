/* content.js — fills about, skills, projects, journey and contact on index.html from GET getContent.php.
   The text rules (gradient headings, paragraphs, **highlights**) come from shared.js, the same code the
   dashboard uses, so the site always looks like the dashboard preview. */
(function () {
    const $ = id => document.getElementById(id);

    // database content is English; these labels are translated when the page is in German
    const DE = {
        'Programming Languages': 'Programmiersprachen', 'Frontend & Data': 'Frontend & Daten', 'Languages': 'Sprachen', 'AI': 'KI',
        education: 'Ausbildung', work: 'Job', internship: 'Praktikum', experience: 'Erfahrung', volunteer: 'Ehrenamt', other: 'Sonstiges',
    };
    const label = text => (window.SITE_LANG === 'de' && DE[text]) || text;
    const tr = key => (window.t ? window.t(key) : key);

    const BADGE_CLASS = { education: 'edu', work: 'work' }; // the classes index.css already had
    let data = null;
    let firstRender = true;

    // new cards fade in like the rest of the page; after a language switch they are shown right away
    function wire(el) {
        if (el.classList.contains('tilt')) window.OT.tilt(el);
        if (!el.classList.contains('rv')) return;
        if (firstRender) window.OT.reveal(el);
        else el.classList.add('on');
    }

    function setCount(el, n) {
        if (+el.dataset.count === n) return;
        el.dataset.count = n;
        window.OT.count(el);
    }

    function slug(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
    }

    function renderAbout(about, contact) {
        if (about && about.title) {
            renderHeading($('aboutTitle'), about.title);
            renderParagraphs($('aboutText'), about.description || '');
        }
        if (contact && contact.email) {
            $('nowEmail').textContent = contact.email;
            $('nowEmail').href = `mailto:${contact.email}`;
            $('nowPhone').textContent = contact.phone;
            $('nowPhone').href = `tel:${contact.phone.replace(/[^\d+]/g, '')}`;
        }
    }

    function renderStats(projects, skills) {
        setCount($('statLive'), projects.filter(p => isHttpUrl(p.live_url)).length);
        setCount($('statProjects'), projects.length);
        setCount($('statTech'), skills.filter(s => s.header !== 'Languages').length); // spoken languages are not technologies
    }

    function renderSkills(skills) {
        const groups = [];
        for (const s of skills) { // already in display order (ENUM order) from the API
            if (!groups.length || groups[groups.length - 1].header !== s.header) groups.push({ header: s.header, skills: [] });
            groups[groups.length - 1].skills.push(s.skill);
        }
        const cards = groups.map((g, i) => {
            const card = make('div', 'glass skill-card tilt rv');
            card.style.setProperty('--d', `${(i * 0.08).toFixed(2)}s`);
            card.append(skillIcon(g.header), make('h5', null, label(g.header)), ...g.skills.map(s => make('span', 'npill', s)));
            return card;
        });
        $('skillGrid').replaceChildren(...cards);
        cards.forEach(wire);
    }

    function projectCard(p, index, id) {
        const info = make('div', 'proj-info');
        const title = make('h4', 'disp', p.title);
        if (isHttpUrl(p.live_url)) title.append(' ', make('span', 'pbadge live', tr('badge.live')));
        else if (isHttpUrl(p.github_url)) title.append(' ', make('span', 'pbadge code', tr('badge.code')));
        const desc = make('div');
        renderParagraphs(desc, p.description || '');
        info.append(make('span', 'proj-num', `/ ${String(index + 1).padStart(2, '0')}`), title, ...desc.childNodes);
        for (const tech of techList(p.technologies)) info.append(make('span', 'npill', tech));

        const links = make('div', 'proj-links');
        for (const [field, key, icon] of [['live_url', 'link.live', 'bi-arrow-up-right'], ['github_url', 'link.code', 'bi-github']]) {
            if (!isHttpUrl(p[field])) continue;
            const a = make('a', 'proj-link');
            a.href = p[field];
            a.target = '_blank';
            a.rel = 'noopener';
            a.append(make('span', null, tr(key)), ' ', make('i', `bi ${icon}`));
            links.append(a);
        }
        if (links.childNodes.length) info.append(links);

        const vis = make('div', 'proj-vis');
        if (isHttpUrl(p.image_url)) {
            const img = make('img');
            img.src = p.image_url;
            img.alt = `${p.title} screenshot`;
            img.loading = 'lazy';
            const shot = make('span', 'proj-shot');
            shot.append(img);
            vis.classList.add('has-img');
            vis.append(shot);
        } else {
            vis.append(make('i', 'bi bi-kanban'));
        }

        const card = make('div', 'glass proj tilt rv');
        card.id = id; // the guided tour finds projects by these ids (p-fintrack, p-bookit, …)
        card.append(...(index % 2 ? [vis, info] : [info, vis]));
        return card;
    }

    function renderProjects(projects) {
        const used = new Set();
        const cards = projects.map((p, i) => {
            let id = `p-${slug(p.title)}`;
            if (used.has(id)) id += `-${p.id}`;
            used.add(id);
            return projectCard(p, i, id);
        });
        $('projectList').replaceChildren(...cards);
        cards.forEach(wire);
    }

    function renderJourney(entries) {
        const items = entries.map((e, i) => {
            const card = make('div', 'glass tcard');
            const desc = make('div');
            renderParagraphs(desc, e.description || '');
            card.append(
                make('span', `tbadge ${BADGE_CLASS[e.type] || e.type}`, label(e.type)),
                make('div', 'tdate', e.timeline),
                make('h5', null, e.title),
                make('div', 'torg', e.institution),
                ...desc.childNodes,
            );
            const item = make('div', `titem rv ${i % 2 ? 'rv-r' : 'rv-l'}`);
            item.append(card);
            return item;
        });
        $('journeyLine').replaceChildren(...items);
        items.forEach(wire);
    }

    function renderContact(c) {
        if (!c || !c.email) return;
        $('contactTitle').textContent = c.header;
        renderParagraphs($('contactSub'), c.description || '');
        $('contactSub').querySelectorAll('p').forEach(p => p.classList.add('contact-sub'));
        $('contactCta').href = `mailto:${c.email}`;

        const links = [
            [isHttpUrl(c.github_url) && c.github_url, 'bi-github', 'GitHub', true],
            [isHttpUrl(c.linkedin_url) && c.linkedin_url, 'bi-linkedin', 'LinkedIn', true],
            [`mailto:${c.email}`, 'bi-envelope-fill', 'Email', false],
            [c.phone && `tel:${c.phone.replace(/[^\d+]/g, '')}`, 'bi-telephone-fill', 'Phone', false],
        ];
        $('contactSocials').replaceChildren(...links.filter(([href]) => href).map(([href, icon, title, external]) => {
            const a = make('a', 'scircle');
            a.href = href;
            a.title = title;
            if (external) { a.target = '_blank'; a.rel = 'noopener'; }
            a.append(make('i', `bi ${icon}`));
            return a;
        }));
    }

    function render() {
        renderAbout(data.about, data.contact);
        renderStats(data.projects, data.skills);
        renderSkills(data.skills);
        renderProjects(data.projects);
        renderJourney(data.journey);
        renderContact(data.contact);
        firstRender = false;
    }

    function showError() {
        const text = window.SITE_LANG === 'de'
            ? 'Dieser Bereich konnte gerade nicht geladen werden.'
            : "This section couldn't be loaded right now.";
        for (const id of ['aboutText', 'skillGrid', 'projectList', 'journeyLine', 'contactSub']) {
            $(id).replaceChildren(make('p', 'load-err', text));
        }
    }

    async function load() {
        try {
            const res = await fetch(`${API_BASE}/getContent.php`);
            if (!res.ok) throw new Error(`getContent.php answered ${res.status}`);
            data = (await res.json()).data;
            render();
        } catch (err) {
            console.error('content.js:', err);
            showError();
        }
    }

    // labels like "live demo" or "Ausbildung" follow the language switch
    addEventListener('ot:lang', () => { if (data) render(); });

    load();
})();
