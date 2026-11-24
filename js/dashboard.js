const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('rm', RM);
const TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

/* ── preloader ── */
const pre = document.getElementById('pre');
function killPre() { pre.classList.add('off'); setTimeout(() => pre.remove(), 600); }
if (RM) killPre();
else {
    let loaded = false;
    addEventListener('load', () => { loaded = true; killPre(); });
    setTimeout(() => { if (!loaded) killPre(); }, 2200);
}

/* ── custom cursor ── */
if (!TOUCH && !RM) {
    const dot = document.getElementById('cdot'), ring = document.getElementById('cring');
    let tx = innerWidth / 2, ty = innerHeight / 2, rx = tx, ry = ty, seen = false;
    addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        if (!seen) { seen = true; dot.style.opacity = 1; ring.style.opacity = 1; rx = tx; ry = ty; }
        dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    });
    (function loop() {
        rx += (tx - rx) * .16; ry += (ty - ry) * .16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
        ring.classList.toggle('hov', !!e.target.closest('a,button,.tilt,input'));
    });
}

/* ── reveal ── */
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ══════════════ dashboard ══════════════ */
const $ = id => document.getElementById(id);

$('dashEmail').textContent = sessionStorage.getItem('adminEmail') || 'admin';

function toLogin() {
    sessionStorage.removeItem('adminEmail');
    location.href = 'admin.html';
}

// the server decides whether we're logged in: a 403 from any admin endpoint means the session is gone
async function api(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE}/${path}`, {
            credentials: 'include',
            ...options,
            // JSON bodies are strings; a FormData body (file upload) sets its own Content-Type
            headers: typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
        });
    } catch {
        // fetch only rejects when no response arrives: backend down, or the browser blocked it (CORS)
        throw new Error(`Could not reach the API at ${API_BASE}. Check that the backend is running and that ${location.origin} is listed in CORS_ORIGINS.`);
    }
    if (res.status === 403) {
        toLogin();
        throw new Error('Your session has expired, please log in again.');
    }
    let data = {};
    try { data = await res.json(); } catch { /* non-JSON body */ }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
    return data;
}

function showMsg(el, text, ok) {
    el.textContent = text;
    el.classList.remove('ok', 'err');
    el.classList.add('show', ok ? 'ok' : 'err');
}
function clearMsg(el) { el.classList.remove('show', 'ok', 'err'); el.textContent = ''; }

// renderHeading, renderParagraphs, make, isHttpUrl, techList, SKILL_STYLE and API_BASE come from shared.js

function autoGrow(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// MySQL returns TIMESTAMPs in the database server's time zone, which is UTC in the container
function formatDbTime(value) {
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return isNaN(date) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/* ── about box ── */
let aboutSaved = null;   // the row as GET about.php returned it
let aboutEditing = false;
let aboutMsgTimer;

function aboutChanges() {
    const changes = {};
    const title = $('aboutTitleInput').value.trim();
    const description = $('aboutTextInput').value.trim();
    if (title !== aboutSaved.title) changes.title = title;
    if (description !== aboutSaved.description) changes.description = description;
    return changes;
}

function renderAboutInto(titleEl, textEl, title, description) {
    renderHeading(titleEl, title);
    renderParagraphs(textEl, description);
    if (!description.trim()) {
        const empty = document.createElement('p');
        empty.className = 'dash-placeholder';
        empty.textContent = 'No description yet.';
        textEl.append(empty);
    }
}

function renderAbout() {
    renderAboutInto($('aboutTitle'), $('aboutText'), aboutSaved.title, aboutSaved.description);
    $('aboutMeta').textContent = `Last updated ${formatDbTime(aboutSaved.updated_at)}`;
}

function renderAboutPreview() {
    const title = $('aboutTitleInput').value.trim();
    renderAboutInto($('aboutPreviewTitle'), $('aboutPreviewText'), title || 'Untitled', $('aboutTextInput').value);
    const count = $('aboutTitleCount');
    count.textContent = `${title.length}/255`;
    count.classList.toggle('over', title.length > 255);
}

function updateAboutDirty() {
    const dirty = aboutEditing && Object.keys(aboutChanges()).length > 0;
    $('aboutDirty').hidden = !dirty;
    $('aboutSave').disabled = !dirty;
}

function setAboutEditing(on) {
    aboutEditing = on;
    $('boxAbout').classList.toggle('is-editing', on);
    $('aboutView').hidden = on;
    $('aboutEditor').hidden = !on;
    $('aboutEdit').hidden = on;
    $('aboutCancel').hidden = !on;
    $('aboutSave').hidden = !on;
    if (on) {
        $('aboutTitleInput').value = aboutSaved.title;
        $('aboutTextInput').value = aboutSaved.description;
        renderAboutPreview();
        autoGrow($('aboutTextInput'));
        $('aboutTitleInput').focus();
    }
    updateAboutDirty();
}

async function loadAbout() {
    try {
        const { data } = await api('about.php');
        if (!data || !data.title) {
            $('aboutMeta').textContent = 'No row in the database';
            $('aboutView').hidden = true;
            showMsg($('aboutMsg'), 'The about row does not exist in the database yet, so there is nothing to show or edit.', false);
            return;
        }
        aboutSaved = data;
        renderAbout();
        $('aboutEdit').disabled = false;
    } catch (err) {
        $('aboutMeta').textContent = 'Could not load';
        $('aboutView').hidden = true;
        showMsg($('aboutMsg'), err.message, false);
    }
}

$('aboutEdit').addEventListener('click', () => {
    clearMsg($('aboutMsg'));
    setAboutEditing(true);
});

$('aboutCancel').addEventListener('click', () => {
    clearMsg($('aboutMsg'));
    setAboutEditing(false);
});

$('aboutTitleInput').addEventListener('input', () => {
    renderAboutPreview();
    updateAboutDirty();
});
$('aboutTextInput').addEventListener('input', e => {
    autoGrow(e.target);
    renderAboutPreview();
    updateAboutDirty();
});

$('aboutSave').addEventListener('click', async () => {
    const changes = aboutChanges();
    if (!Object.keys(changes).length) return;
    if ('title' in changes && !changes.title) { showMsg($('aboutMsg'), 'The title cannot be empty.', false); return; }
    if ('description' in changes && !changes.description) { showMsg($('aboutMsg'), 'The description cannot be empty.', false); return; }

    clearTimeout(aboutMsgTimer);
    clearMsg($('aboutMsg'));
    $('aboutSave').disabled = true;
    $('aboutCancel').disabled = true;
    $('aboutSave').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';

    try {
        const { data } = await api('about.php', { method: 'PATCH', body: JSON.stringify(changes) });
        aboutSaved = data;
        renderAbout();
        setAboutEditing(false);
        showMsg($('aboutMsg'), 'Changes saved.', true);
        aboutMsgTimer = setTimeout(() => clearMsg($('aboutMsg')), 3000);
    } catch (err) {
        showMsg($('aboutMsg'), err.message, false);
    } finally {
        $('aboutSave').innerHTML = '<i class="bi bi-check2"></i> Save changes';
        $('aboutCancel').disabled = false;
        updateAboutDirty();
    }
});

/* ── currently box ── the card next to about; one row, edited like about */
const CURRENTLY_TEXT = ['status', 'location', 'degree', 'focus'];
const currentlyInput = name => document.querySelector(`#currentlyEditor [data-currently="${name}"]`);

let currentlySaved = null; // the row as GET currently.php returned it
let currentlyEditing = false;
let currentlyMsgTimer;

function currentlyValues() {
    const v = Object.fromEntries(CURRENTLY_TEXT.map(f => [f, currentlyInput(f).value.trim()]));
    v.available = $('currentlyAvailable').checked;
    return v;
}

function currentlyChanges() {
    const v = currentlyValues();
    return Object.fromEntries(Object.keys(v).filter(f => v[f] !== currentlySaved[f]).map(f => [f, v[f]]));
}

// email + phone rows come from the contact row once the contact box has loaded it
function renderCurrently() {
    $('currentlyCard').replaceChildren(...nowCardRows(currentlySaved, contactSaved));
    $('currentlyMeta').textContent = `Last updated ${formatDbTime(currentlySaved.updated_at)}`;
}

function renderCurrentlyPreview() {
    $('currentlyPreview').replaceChildren(...nowCardRows(currentlyValues(), contactSaved));
}

function updateCurrentlyDirty() {
    const dirty = currentlyEditing && Object.keys(currentlyChanges()).length > 0;
    $('currentlyDirty').hidden = !dirty;
    $('currentlySave').disabled = !dirty;
}

function setCurrentlyEditing(on) {
    currentlyEditing = on;
    $('boxCurrently').classList.toggle('is-editing', on);
    $('currentlyView').hidden = on;
    $('currentlyEditor').hidden = !on;
    $('currentlyEdit').hidden = on;
    $('currentlyCancel').hidden = !on;
    $('currentlySave').hidden = !on;
    if (on) {
        for (const f of CURRENTLY_TEXT) currentlyInput(f).value = currentlySaved[f];
        $('currentlyAvailable').checked = currentlySaved.available;
        renderCurrentlyPreview();
        currentlyInput('status').focus();
    }
    updateCurrentlyDirty();
}

async function loadCurrently() {
    try {
        const { data } = await api('currently.php');
        if (!data || !data.status) {
            $('currentlyMeta').textContent = 'No row in the database';
            $('currentlyView').hidden = true;
            showMsg($('currentlyMsg'), 'The currently row does not exist in the database yet, so there is nothing to show or edit.', false);
            return;
        }
        currentlySaved = data;
        renderCurrently();
        $('currentlyEdit').disabled = false;
    } catch (err) {
        $('currentlyMeta').textContent = 'Could not load';
        $('currentlyView').hidden = true;
        showMsg($('currentlyMsg'), err.message, false);
    }
}

$('currentlyEdit').addEventListener('click', () => {
    clearMsg($('currentlyMsg'));
    setCurrentlyEditing(true);
});

$('currentlyCancel').addEventListener('click', () => {
    clearMsg($('currentlyMsg'));
    setCurrentlyEditing(false);
});

$('currentlyEditor').addEventListener('input', () => {
    renderCurrentlyPreview();
    updateCurrentlyDirty();
});

$('currentlySave').addEventListener('click', async () => {
    const changes = currentlyChanges();
    if (!Object.keys(changes).length) return;
    const empty = CURRENTLY_TEXT.find(f => f in changes && !changes[f]);
    if (empty) {
        showMsg($('currentlyMsg'), `${empty[0].toUpperCase() + empty.slice(1)} cannot be empty.`, false);
        return;
    }

    clearTimeout(currentlyMsgTimer);
    clearMsg($('currentlyMsg'));
    $('currentlySave').disabled = true;
    $('currentlyCancel').disabled = true;
    $('currentlySave').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';

    try {
        const { data } = await api('currently.php', { method: 'PATCH', body: JSON.stringify(changes) });
        currentlySaved = data;
        renderCurrently();
        setCurrentlyEditing(false);
        showMsg($('currentlyMsg'), 'Changes saved.', true);
        currentlyMsgTimer = setTimeout(() => clearMsg($('currentlyMsg')), 3000);
    } catch (err) {
        showMsg($('currentlyMsg'), err.message, false);
    } finally {
        $('currentlySave').innerHTML = '<i class="bi bi-check2"></i> Save changes';
        $('currentlyCancel').disabled = false;
        updateCurrentlyDirty();
    }
});

/* ── skills box ── */
let skillsSaved = [];             // rows as GET skills.php returned them
let skillHeaders = [];            // the allowed groups, sent by the API
let skillsEditing = false;
const skillsToDelete = new Set(); // ids of saved skills marked for removal
let skillsToAdd = [];             // [{ header, skill }] not saved yet
let skillsMsgTimer;

// the database compares text case-insensitively, so "react" and "React" count as the same skill
const sameText = (a, b) => a.toLocaleLowerCase() === b.toLocaleLowerCase();
const skillsDirty = () => skillsToDelete.size > 0 || skillsToAdd.length > 0;

function skillPill(text, cls, onClick, label, icon) {
    const span = document.createElement('span');
    span.className = 'npill' + (cls ? ' ' + cls : '');
    span.append(text);
    if (onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dash-pill-x';
        btn.title = label;
        btn.setAttribute('aria-label', `${label} ${text}`);
        btn.innerHTML = `<i class="bi ${icon}"></i>`;
        btn.addEventListener('click', onClick);
        span.append(btn);
    }
    return span;
}

function renderSkills() {
    const grid = $('skillsGrid');
    grid.textContent = '';
    for (const header of skillHeaders) {
        const rows = skillsSaved.filter(r => r.header === header);
        const adds = skillsToAdd.filter(a => a.header === header);
        if (!skillsEditing && !rows.length) continue; // empty groups are not shown on the site

        const card = document.createElement('div');
        card.className = 'glass skill-card';
        const ic = skillIcon(header);
        const title = document.createElement('h5');
        title.textContent = header;
        card.append(ic, title);

        for (const row of rows) {
            if (!skillsEditing) {
                card.append(skillPill(row.skill));
                continue;
            }
            const removed = skillsToDelete.has(row.id);
            card.append(skillPill(row.skill, removed ? 'is-removed' : '', () => {
                if (removed) skillsToDelete.delete(row.id);
                else skillsToDelete.add(row.id);
                skillsChanged();
            }, removed ? 'Keep' : 'Delete', removed ? 'bi-arrow-counterclockwise' : 'bi-x-lg'));
        }
        for (const add of adds) {
            card.append(skillPill(add.skill, 'is-new', () => {
                skillsToAdd = skillsToAdd.filter(a => a !== add);
                skillsChanged();
            }, 'Remove', 'bi-x-lg'));
        }
        if (!rows.length && !adds.length) {
            const empty = document.createElement('p');
            empty.className = 'dash-placeholder';
            empty.textContent = 'No skills yet, so this group is hidden on the site.';
            card.append(empty);
        }
        grid.append(card);
    }
    const groups = new Set(skillsSaved.map(r => r.header)).size;
    $('skillsMeta').textContent = `${skillsSaved.length} skills in ${groups} groups`;
}

function skillsChanged() {
    $('skillsDirty').hidden = !skillsDirty();
    $('skillsSave').disabled = !skillsDirty();
    renderSkills();
}

function setSkillsEditing(on) {
    skillsEditing = on;
    skillsToDelete.clear();
    skillsToAdd = [];
    $('boxSkills').classList.toggle('is-editing', on);
    $('skillsAddForm').hidden = !on;
    $('skillsEdit').hidden = on;
    $('skillsCancel').hidden = !on;
    $('skillsSave').hidden = !on;
    $('skillNameInput').value = '';
    skillsChanged();
}

async function loadSkills() {
    try {
        const res = await api('skills.php');
        skillsSaved = res.data;
        skillHeaders = res.headers;
        if (!$('skillHeaderSelect').options.length) {
            $('skillHeaderSelect').append(...skillHeaders.map(h => new Option(h, h)));
        }
        renderSkills();
        $('skillsEdit').disabled = false;
    } catch (err) {
        $('skillsMeta').textContent = 'Could not load';
        showMsg($('skillsMsg'), err.message, false);
    }
}

$('skillsEdit').addEventListener('click', () => {
    clearMsg($('skillsMsg'));
    setSkillsEditing(true);
    $('skillNameInput').focus();
});

$('skillsCancel').addEventListener('click', () => {
    clearMsg($('skillsMsg'));
    setSkillsEditing(false);
});

$('skillsAddForm').addEventListener('submit', e => {
    e.preventDefault();
    clearMsg($('skillsMsg'));
    const header = $('skillHeaderSelect').value;
    const skill = $('skillNameInput').value.trim();
    if (!skill) {
        showMsg($('skillsMsg'), 'Type a skill name first.', false);
        return;
    }

    const existing = skillsSaved.find(r => r.header === header && sameText(r.skill, skill));
    if (existing && skillsToDelete.has(existing.id)) {
        skillsToDelete.delete(existing.id); // adding back a skill marked for removal just keeps it
    } else if (existing || skillsToAdd.some(a => a.header === header && sameText(a.skill, skill))) {
        showMsg($('skillsMsg'), `"${skill}" is already in ${header}.`, false);
        return;
    } else {
        skillsToAdd.push({ header, skill });
    }

    $('skillNameInput').value = '';
    $('skillNameInput').focus();
    skillsChanged();
});

$('skillsSave').addEventListener('click', async () => {
    if (!skillsDirty()) return;
    clearTimeout(skillsMsgTimer);
    clearMsg($('skillsMsg'));
    $('skillsSave').disabled = true;
    $('skillsCancel').disabled = true;
    $('skillsSave').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';

    // one request per change; whatever fails stays pending so it can be retried
    const failed = [];
    let removed = 0, added = 0;
    for (const row of skillsSaved.filter(r => skillsToDelete.has(r.id))) {
        try {
            await api('skills.php', { method: 'DELETE', body: JSON.stringify({ header: row.header, skill: row.skill }) });
            skillsToDelete.delete(row.id);
            removed++;
        } catch (err) {
            failed.push(`Could not delete "${row.skill}": ${err.message}`);
        }
    }
    for (const add of [...skillsToAdd]) {
        try {
            await api('skills.php', { method: 'POST', body: JSON.stringify(add) });
            skillsToAdd = skillsToAdd.filter(a => a !== add);
            added++;
        } catch (err) {
            failed.push(`Could not add "${add.skill}": ${err.message}`);
        }
    }

    try {
        skillsSaved = (await api('skills.php')).data;
    } catch { /* keep the old list; the error below still explains what happened */ }

    $('skillsSave').innerHTML = '<i class="bi bi-check2"></i> Save changes';
    $('skillsCancel').disabled = false;

    if (failed.length) {
        skillsChanged();
        showMsg($('skillsMsg'), failed.join(' '), false);
        return;
    }
    setSkillsEditing(false);
    const parts = [added && `${added} added`, removed && `${removed} deleted`].filter(Boolean);
    showMsg($('skillsMsg'), `Changes saved: ${parts.join(', ')}.`, true);
    skillsMsgTimer = setTimeout(() => clearMsg($('skillsMsg')), 3000);
});

/* ── projects box ── each project is edited and saved on its own */
const PROJECT_FIELDS = ['title', 'description', 'technologies', 'live_url', 'github_url', 'image_url'];
const PROJECT_URLS = { live_url: 'Live URL', github_url: 'GitHub URL', image_url: 'Image URL' };

let projectsSaved = [];   // rows as GET projects.php returned them
let projectEditing = null; // the one open editor: { id (null = new project), el, isDirty }
let projectsMsgTimer;

function makeButton(cls, html, onClick) {
    const btn = make('button', cls);
    btn.type = 'button';
    btn.innerHTML = html; // only static icon markup, never data
    btn.addEventListener('click', onClick);
    return btn;
}

function flashProjectsMsg(text) {
    clearTimeout(projectsMsgTimer);
    showMsg($('projectsMsg'), text, true);
    projectsMsgTimer = setTimeout(() => clearMsg($('projectsMsg')), 3000);
}

// same markup as a project card in index.html; every second card has the visual on the left
function buildProjectCard(p, index) {
    const info = make('div', 'proj-info');
    const title = make('h4', 'disp', p.title || 'Untitled');
    if (isHttpUrl(p.live_url)) title.append(' ', make('span', 'pbadge live', '● live'));
    else if (isHttpUrl(p.github_url)) title.append(' ', make('span', 'pbadge code', 'code'));
    const desc = make('div');
    renderParagraphs(desc, p.description || '');
    info.append(make('span', 'proj-num', `/ ${String(index + 1).padStart(2, '0')}`), title, ...desc.childNodes);
    for (const tech of techList(p.technologies)) info.append(make('span', 'npill', tech));

    const links = make('div', 'proj-links');
    for (const [field, label, icon] of [['live_url', 'live demo', 'bi-arrow-up-right'], ['github_url', 'code', 'bi-github']]) {
        if (!isHttpUrl(p[field])) continue;
        const a = make('a', 'proj-link', label + ' ');
        a.href = p[field];
        a.target = '_blank';
        a.rel = 'noopener';
        a.append(make('i', `bi ${icon}`));
        links.append(a);
    }
    if (links.childNodes.length) info.append(links);

    const vis = make('div', 'proj-vis');
    if (isHttpUrl(p.image_url)) {
        const img = make('img');
        img.src = p.image_url;
        img.alt = `${p.title || 'Project'} screenshot`;
        img.loading = 'lazy';
        const shot = make('span', 'proj-shot');
        shot.append(img);
        vis.classList.add('has-img');
        vis.append(shot);
    } else {
        vis.append(make('i', 'bi bi-kanban'));
    }

    const card = make('div', 'glass proj');
    card.append(...(index % 2 ? [vis, info] : [info, vis]));
    return card;
}

function renderProjects() {
    const list = $('projectsList');
    list.textContent = '';
    if (projectEditing && projectEditing.id === null) list.append(projectEditing.el); // a new project is edited at the top

    projectsSaved.forEach((project, i) => {
        if (projectEditing && projectEditing.id === project.id) {
            list.append(projectEditing.el);
            return;
        }
        const wrap = make('div', 'dash-proj');
        const bar = make('div', 'dash-proj-bar');
        const actions = make('div', 'dash-actions');
        const edit = makeButton('btn btn-ghost dash-btn', '<i class="bi bi-pencil"></i> Edit', () => openProjectEditor(project));
        const del = makeButton('btn btn-ghost dash-btn is-danger', '<i class="bi bi-trash3"></i> Delete', () => deleteProject(project, del));
        edit.disabled = del.disabled = projectEditing !== null; // one project at a time
        actions.append(edit, del);
        bar.append(make('span', 'dash-proj-label', `Project ${i + 1}`), actions);
        wrap.append(bar, buildProjectCard(project, i));
        list.append(wrap);
    });

    if (!projectsSaved.length && !projectEditing) {
        list.append(make('p', 'dash-placeholder', 'No projects yet. Use "Add project" to create the first one.'));
    }
    $('projectAdd').disabled = projectEditing !== null;
    $('projectsMeta').textContent = `${projectsSaved.length} project${projectsSaved.length === 1 ? '' : 's'}`;
}

function projectProblem(v) {
    if (!v.title) return 'The title cannot be empty.';
    if (v.title.length > 255) return 'The title is too long (max 255 characters).';
    if (!v.description) return 'The description cannot be empty.';
    if (!techList(v.technologies).length) return 'Add at least one technology.';
    for (const [field, label] of Object.entries(PROJECT_URLS)) {
        if (v[field] && !isHttpUrl(v[field])) return `${label} must start with http:// or https://`;
    }
    return null;
}

// project = a saved row to edit, or null to create a new one
function openProjectEditor(project) {
    clearMsg($('projectsMsg'));
    const node = $('projectEditorTpl').content.firstElementChild.cloneNode(true);
    const field = name => node.querySelector(`[data-field="${name}"]`);
    const role = name => node.querySelector(`[data-role="${name}"]`);

    const saved = Object.fromEntries(PROJECT_FIELDS.map(f => [f, project ? String(project[f] ?? '') : '']));
    for (const f of PROJECT_FIELDS) field(f).value = saved[f];
    node.querySelector('.dash-proj-label').textContent = project ? `Editing: ${project.title}` : 'New project';
    const index = project ? projectsSaved.indexOf(project) : projectsSaved.length; // a new project is added at the end

    const values = () => Object.fromEntries(PROJECT_FIELDS.map(f => [f, field(f).value.trim()]));
    const changes = () => {
        const v = values();
        return Object.fromEntries(PROJECT_FIELDS.filter(f => v[f] !== saved[f].trim()).map(f => [f, v[f]]));
    };
    const isDirty = () => Object.keys(changes()).length > 0;

    const refresh = () => {
        const v = values();
        role('dirty').hidden = !isDirty();
        role('save').disabled = !isDirty();
        role('count').textContent = `${v.title.length}/255`;
        role('preview').replaceChildren(buildProjectCard(v, index));
    };

    const setBusy = busy => {
        role('save').disabled = busy || !isDirty();
        role('cancel').disabled = busy;
        role('save').innerHTML = busy ? '<i class="bi bi-hourglass-split"></i> Saving…' : '<i class="bi bi-check2"></i> Save changes';
    };

    node.addEventListener('input', refresh);

    role('cancel').addEventListener('click', () => {
        projectEditing = null;
        renderProjects();
    });

    role('save').addEventListener('click', async () => {
        clearMsg(role('msg'));
        const v = values();
        const problem = projectProblem(v);
        if (problem) {
            showMsg(role('msg'), problem, false);
            return;
        }
        // a new project sends everything; an edit sends only what changed
        const body = project ? { id: project.id, ...changes() } : v;
        if ('technologies' in body) body.technologies = techList(body.technologies).join(', '); // "PHP , , MySQL" -> "PHP, MySQL"
        for (const f of Object.keys(PROJECT_URLS)) {
            if (body[f] === '') body[f] = null; // an emptied URL field removes the link
        }
        setBusy(true);
        try {
            const { data } = await api('projects.php', { method: project ? 'PATCH' : 'POST', body: JSON.stringify(body) });
            if (project) projectsSaved[projectsSaved.findIndex(p => p.id === data.id)] = data;
            else projectsSaved.push(data);
            projectEditing = null;
            renderProjects();
            flashProjectsMsg(project ? `"${data.title}" saved.` : `"${data.title}" added.`);
        } catch (err) {
            showMsg(role('msg'), err.message, false);
            setBusy(false);
        }
    });

    role('upload').addEventListener('click', () => role('file').click());
    role('file').addEventListener('change', async () => {
        const file = role('file').files[0];
        role('file').value = '';
        if (!file) return;
        clearMsg(role('msg'));
        if (file.size > 5 * 1024 * 1024) {
            showMsg(role('msg'), 'The image must be under 5 MB.', false);
            return;
        }
        const btn = role('upload');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Uploading…';
        try {
            const form = new FormData();
            form.append('image', file);
            const res = await api('upload-image.php', { method: 'POST', body: form });
            field('image_url').value = res.image_url;
            refresh();
        } catch (err) {
            showMsg(role('msg'), err.message, false);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-upload"></i> Upload image';
        }
    });

    projectEditing = { id: project ? project.id : null, el: node, isDirty };
    renderProjects();
    refresh();
    field('title').focus();
}

async function deleteProject(project, btn) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    clearMsg($('projectsMsg'));
    btn.disabled = true;
    try {
        await api('projects.php', { method: 'DELETE', body: JSON.stringify({ id: project.id }) });
        projectsSaved = projectsSaved.filter(p => p.id !== project.id);
        renderProjects();
        flashProjectsMsg(`"${project.title}" deleted.`);
    } catch (err) {
        showMsg($('projectsMsg'), err.message, false);
        loadProjects(); // show what the database really has now
    }
}

async function loadProjects() {
    try {
        projectsSaved = (await api('projects.php')).data;
        renderProjects();
    } catch (err) {
        $('projectsMeta').textContent = 'Could not load';
        showMsg($('projectsMsg'), err.message, false);
    }
}

$('projectAdd').addEventListener('click', () => openProjectEditor(null));

/* ── journey box ── each entry is edited and saved on its own, like projects */
const JOURNEY_FIELDS = ['type', 'timeline', 'title', 'institution', 'description'];

let journeySaved = [];     // rows as GET journey.php returned them
let journeyTypes = [];     // allowed types, sent by the API
let journeyEditing = null; // the one open editor: { id (null = new entry), el, isDirty }
let journeyMsgTimer;

function flashJourneyMsg(text) {
    clearTimeout(journeyMsgTimer);
    showMsg($('journeyMsg'), text, true);
    journeyMsgTimer = setTimeout(() => clearMsg($('journeyMsg')), 3000);
}

function buildJourneyCard(entry) {
    const top = make('div', 'dash-jcard-top');
    top.append(make('span', `tbadge t-${entry.type}`, entry.type), make('span', 'tdate', entry.timeline));
    const desc = make('div');
    renderParagraphs(desc, entry.description || '');
    const card = make('div', 'glass tcard dash-jcard');
    card.append(top, make('h5', null, entry.title || 'Untitled'), make('div', 'torg', entry.institution), ...desc.childNodes);
    return card;
}

function renderJourney() {
    const list = $('journeyList');
    list.textContent = '';
    if (journeyEditing && journeyEditing.id === null) list.append(journeyEditing.el); // a new entry is edited at the top

    journeySaved.forEach((entry, i) => {
        if (journeyEditing && journeyEditing.id === entry.id) {
            list.append(journeyEditing.el);
            return;
        }
        const wrap = make('div', 'dash-proj');
        const bar = make('div', 'dash-proj-bar');
        const actions = make('div', 'dash-actions');
        const edit = makeButton('btn btn-ghost dash-btn', '<i class="bi bi-pencil"></i> Edit', () => openJourneyEditor(entry));
        const del = makeButton('btn btn-ghost dash-btn is-danger', '<i class="bi bi-trash3"></i> Delete', () => deleteJourney(entry, del));
        edit.disabled = del.disabled = journeyEditing !== null; // one entry at a time
        actions.append(edit, del);
        bar.append(make('span', 'dash-proj-label', `Entry ${i + 1}`), actions);
        wrap.append(bar, buildJourneyCard(entry));
        list.append(wrap);
    });

    if (!journeySaved.length && !journeyEditing) {
        list.append(make('p', 'dash-placeholder', 'No journey entries yet. Use "Add entry" to create the first one.'));
    }
    $('journeyAdd').disabled = journeyEditing !== null;
    $('journeyMeta').textContent = `${journeySaved.length} entr${journeySaved.length === 1 ? 'y' : 'ies'}`;
}

function journeyProblem(v) {
    if (!journeyTypes.includes(v.type)) return 'Choose a type.';
    if (!v.timeline) return 'The timeline cannot be empty.';
    if (!v.title) return 'The title cannot be empty.';
    if (!v.institution) return 'The institution cannot be empty.';
    if (!v.description) return 'The description cannot be empty.';
    return null;
}

// entry = a saved row to edit, or null to create a new one
function openJourneyEditor(entry) {
    clearMsg($('journeyMsg'));
    const node = $('journeyEditorTpl').content.firstElementChild.cloneNode(true);
    const field = name => node.querySelector(`[data-field="${name}"]`);
    const role = name => node.querySelector(`[data-role="${name}"]`);

    field('type').append(...journeyTypes.map(t => new Option(t, t)));
    const saved = Object.fromEntries(JOURNEY_FIELDS.map(f => [f, entry ? String(entry[f] ?? '') : '']));
    if (!entry) saved.type = journeyTypes[0];
    for (const f of JOURNEY_FIELDS) field(f).value = saved[f];
    node.querySelector('.dash-proj-label').textContent = entry ? `Editing: ${entry.title}` : 'New entry';

    const values = () => Object.fromEntries(JOURNEY_FIELDS.map(f => [f, field(f).value.trim()]));
    const changes = () => {
        const v = values();
        return Object.fromEntries(JOURNEY_FIELDS.filter(f => v[f] !== saved[f].trim()).map(f => [f, v[f]]));
    };
    const isDirty = () => Object.keys(changes()).length > 0;

    const refresh = () => {
        const v = values();
        role('dirty').hidden = !isDirty();
        role('save').disabled = !isDirty();
        role('count').textContent = `${v.title.length}/255`;
        role('preview').replaceChildren(buildJourneyCard(v));
    };

    const setBusy = busy => {
        role('save').disabled = busy || !isDirty();
        role('cancel').disabled = busy;
        role('save').innerHTML = busy ? '<i class="bi bi-hourglass-split"></i> Saving…' : '<i class="bi bi-check2"></i> Save changes';
    };

    node.addEventListener('input', refresh);
    node.addEventListener('change', refresh); // the type dropdown

    role('cancel').addEventListener('click', () => {
        journeyEditing = null;
        renderJourney();
    });

    role('save').addEventListener('click', async () => {
        clearMsg(role('msg'));
        const v = values();
        const problem = journeyProblem(v);
        if (problem) {
            showMsg(role('msg'), problem, false);
            return;
        }
        // a new entry sends everything; an edit sends only what changed
        const body = entry ? { id: entry.id, ...changes() } : v;
        setBusy(true);
        try {
            const { data } = await api('journey.php', { method: entry ? 'PATCH' : 'POST', body: JSON.stringify(body) });
            if (entry) journeySaved[journeySaved.findIndex(j => j.id === data.id)] = data;
            else journeySaved.push(data);
            journeyEditing = null;
            renderJourney();
            flashJourneyMsg(entry ? `"${data.title}" saved.` : `"${data.title}" added.`);
        } catch (err) {
            showMsg(role('msg'), err.message, false);
            setBusy(false);
        }
    });

    journeyEditing = { id: entry ? entry.id : null, el: node, isDirty };
    renderJourney();
    refresh();
    field('title').focus();
}

async function deleteJourney(entry, btn) {
    if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    clearMsg($('journeyMsg'));
    btn.disabled = true;
    try {
        await api('journey.php', { method: 'DELETE', body: JSON.stringify({ id: entry.id }) });
        journeySaved = journeySaved.filter(j => j.id !== entry.id);
        renderJourney();
        flashJourneyMsg(`"${entry.title}" deleted.`);
    } catch (err) {
        showMsg($('journeyMsg'), err.message, false);
        loadJourney(); // show what the database really has now
    }
}

async function loadJourney() {
    try {
        const res = await api('journey.php');
        journeySaved = res.data;
        journeyTypes = res.types;
        renderJourney();
    } catch (err) {
        $('journeyMeta').textContent = 'Could not load';
        showMsg($('journeyMsg'), err.message, false);
    }
}

$('journeyAdd').addEventListener('click', () => openJourneyEditor(null));

/* ── contact box ── one row, edited like about */
const CONTACT_FIELDS = ['header', 'email', 'phone', 'github_url', 'linkedin_url', 'description'];
const contactInput = name => document.querySelector(`#contactEditor [data-contact="${name}"]`);

let contactSaved = null; // the row as GET contact.php returned it
let contactEditing = false;
let contactMsgTimer;

// same markup as the contact section in index.html
function buildContactSection(c) {
    const eyebrow = make('p', 'sec-eyebrow');
    eyebrow.append(make('b', null, '05'), " — what's next?");

    const sub = make('div');
    renderParagraphs(sub, c.description || '');
    sub.querySelectorAll('p').forEach(p => p.classList.add('contact-sub'));

    const cta = make('a', 'btn btn-glow', 'Say Hello ✦');
    if (c.email) cta.href = `mailto:${c.email}`;

    const socials = make('div', 'socials');
    const links = [
        [isHttpUrl(c.github_url) && c.github_url, 'bi-github', 'GitHub', true],
        [isHttpUrl(c.linkedin_url) && c.linkedin_url, 'bi-linkedin', 'LinkedIn', true],
        [c.email && `mailto:${c.email}`, 'bi-envelope-fill', 'Email', false],
        [c.phone && `tel:${c.phone.replace(/[^\d+]/g, '')}`, 'bi-telephone-fill', 'Phone', false],
    ];
    for (const [href, icon, title, external] of links) {
        if (!href) continue;
        const a = make('a', 'scircle');
        a.href = href;
        a.title = title;
        if (external) { a.target = '_blank'; a.rel = 'noopener'; }
        a.append(make('i', `bi ${icon}`));
        socials.append(a);
    }

    const section = make('div', 'dash-contact');
    section.append(eyebrow, make('h3', 'contact-h disp', c.header || 'Untitled'), ...sub.childNodes, cta, socials);
    return section;
}

function renderContact() {
    $('contactSection').replaceChildren(buildContactSection(contactSaved));
    if (currentlySaved) renderCurrently(); // the currently card shows the contact email + phone
    const details = [
        ['bi-envelope-fill', contactSaved.email],
        ['bi-telephone-fill', contactSaved.phone],
        ['bi-github', contactSaved.github_url],
        ['bi-linkedin', contactSaved.linkedin_url],
    ].map(([icon, value]) => {
        const row = make('div');
        row.append(make('i', `bi ${icon}`), make('span', null, value || '—'));
        row.title = value || '';
        return row;
    });
    $('contactDetails').replaceChildren(...details);
    $('contactMeta').textContent = `Last updated ${formatDbTime(contactSaved.updated_at)}`;
}

function contactValues() {
    return Object.fromEntries(CONTACT_FIELDS.map(f => [f, contactInput(f).value.trim()]));
}

function contactChanges() {
    const v = contactValues();
    return Object.fromEntries(CONTACT_FIELDS.filter(f => v[f] !== String(contactSaved[f] ?? '')).map(f => [f, v[f]]));
}

function contactProblem(v) {
    const labels = { header: 'The heading', email: 'The email', phone: 'The phone number', github_url: 'The GitHub URL', linkedin_url: 'The LinkedIn URL', description: 'The description' };
    for (const f of CONTACT_FIELDS) if (!v[f]) return `${labels[f]} cannot be empty.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'The email address is not valid.';
    if (!isHttpUrl(v.github_url)) return 'The GitHub URL must start with http:// or https://';
    if (!isHttpUrl(v.linkedin_url)) return 'The LinkedIn URL must start with http:// or https://';
    return null;
}

function renderContactPreview() {
    const v = contactValues();
    $('contactPreview').replaceChildren(buildContactSection(v));
    $('contactHeaderCount').textContent = `${v.header.length}/255`;
}

function updateContactDirty() {
    const dirty = contactEditing && Object.keys(contactChanges()).length > 0;
    $('contactDirty').hidden = !dirty;
    $('contactSave').disabled = !dirty;
}

function setContactEditing(on) {
    contactEditing = on;
    $('boxContact').classList.toggle('is-editing', on);
    $('contactView').hidden = on;
    $('contactEditor').hidden = !on;
    $('contactEdit').hidden = on;
    $('contactCancel').hidden = !on;
    $('contactSave').hidden = !on;
    if (on) {
        for (const f of CONTACT_FIELDS) contactInput(f).value = contactSaved[f] ?? '';
        renderContactPreview();
        contactInput('header').focus();
    }
    updateContactDirty();
}

async function loadContact() {
    try {
        const { data } = await api('contact.php');
        if (!data || !data.email) {
            $('contactMeta').textContent = 'No row in the database';
            $('contactView').hidden = true;
            showMsg($('contactMsg'), 'The contact row does not exist in the database yet, so there is nothing to show or edit.', false);
            return;
        }
        contactSaved = data;
        renderContact();
        $('contactEdit').disabled = false;
    } catch (err) {
        $('contactMeta').textContent = 'Could not load';
        $('contactView').hidden = true;
        showMsg($('contactMsg'), err.message, false);
    }
}

$('contactEdit').addEventListener('click', () => {
    clearMsg($('contactMsg'));
    setContactEditing(true);
});

$('contactCancel').addEventListener('click', () => {
    clearMsg($('contactMsg'));
    setContactEditing(false);
});

$('contactEditor').addEventListener('input', () => {
    renderContactPreview();
    updateContactDirty();
});

$('contactSave').addEventListener('click', async () => {
    const changes = contactChanges();
    if (!Object.keys(changes).length) return;
    const problem = contactProblem(contactValues());
    if (problem) {
        showMsg($('contactMsg'), problem, false);
        return;
    }

    clearTimeout(contactMsgTimer);
    clearMsg($('contactMsg'));
    $('contactSave').disabled = true;
    $('contactCancel').disabled = true;
    $('contactSave').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';

    try {
        const { data } = await api('contact.php', { method: 'PATCH', body: JSON.stringify(changes) });
        contactSaved = data;
        renderContact();
        setContactEditing(false);
        showMsg($('contactMsg'), 'Changes saved.', true);
        contactMsgTimer = setTimeout(() => clearMsg($('contactMsg')), 3000);
    } catch (err) {
        showMsg($('contactMsg'), err.message, false);
    } finally {
        $('contactSave').innerHTML = '<i class="bi bi-check2"></i> Save changes';
        $('contactCancel').disabled = false;
        updateContactDirty();
    }
});

/* ── hero chips box ── one card per position; each chip is edited and saved on its own, like projects */
let chipsSaved = [];      // rows as GET chips.php returned them
let chipSlots = [];       // the positions (1–5), sent by the API
let chipEditing = null;   // the one open editor: { slot, el, isDirty }
let chipsMsgTimer;

function flashChipsMsg(text) {
    clearTimeout(chipsMsgTimer);
    showMsg($('chipsMsg'), text, true);
    chipsMsgTimer = setTimeout(() => clearMsg($('chipsMsg')), 3000);
}

function renderChipsBox() {
    const grid = $('chipsGrid');
    grid.textContent = '';
    for (const slot of chipSlots) {
        if (chipEditing && chipEditing.slot === slot) {
            grid.append(chipEditing.el);
            continue;
        }
        const chip = chipsSaved.find(c => +c.slot === slot);
        const card = make('div', 'dash-chip-slot');
        const bar = make('div', 'dash-proj-bar');
        const actions = make('div', 'dash-actions');
        if (chip) {
            const edit = makeButton('btn btn-ghost dash-btn', '<i class="bi bi-pencil"></i> Edit', () => openChipEditor(slot, chip));
            const del = makeButton('btn btn-ghost dash-btn is-danger', '<i class="bi bi-trash3"></i>', () => deleteChip(chip, del));
            del.setAttribute('aria-label', `Delete chip ${chip.label}`);
            edit.disabled = del.disabled = chipEditing !== null; // one chip at a time
            actions.append(edit, del);
        } else {
            const add = makeButton('btn btn-ghost dash-btn', '<i class="bi bi-plus-lg"></i> Add chip', () => openChipEditor(slot, null));
            add.disabled = chipEditing !== null;
            actions.append(add);
        }
        bar.append(make('span', 'dash-proj-label', `Position ${slot}`), actions);
        card.append(bar, chip ? heroChip(chip, false) : make('p', 'dash-placeholder', 'Empty, no chip at this position.'));
        grid.append(card);
    }
    $('chipsMeta').textContent = `${chipsSaved.length} of ${chipSlots.length} positions used`;
}

// chip = the saved chip at this slot, or null to add one
function openChipEditor(slot, chip) {
    clearMsg($('chipsMsg'));
    const node = $('chipEditorTpl').content.firstElementChild.cloneNode(true);
    const field = name => node.querySelector(`[data-field="${name}"]`);
    const role = name => node.querySelector(`[data-role="${name}"]`);

    const icons = [...CHIP_ICONS];
    if (chip && !icons.some(([cls]) => cls === chip.icon)) icons.unshift([chip.icon, chip.icon]); // keep an icon set outside the list
    field('icon').append(...icons.map(([cls, name]) => new Option(name, cls)));
    const saved = { label: chip ? chip.label : '', icon: chip ? chip.icon : icons[0][0] };
    field('label').value = saved.label;
    field('icon').value = saved.icon;
    node.querySelector('.dash-proj-label').textContent = chip ? `Position ${slot}: editing` : `Position ${slot}: new chip`;

    const values = () => ({ label: field('label').value.trim(), icon: field('icon').value });
    const changes = () => {
        const v = values();
        return Object.fromEntries(Object.keys(v).filter(k => v[k] !== saved[k]).map(k => [k, v[k]]));
    };
    const isDirty = () => Object.keys(changes()).length > 0;
    const refresh = () => {
        const v = values();
        role('save').disabled = !isDirty();
        role('count').textContent = `${v.label.length}/40`;
        role('preview').replaceChildren(heroChip({ ...v, label: v.label || 'Label', slot }, false));
    };
    node.addEventListener('input', refresh);
    node.addEventListener('change', refresh);

    role('cancel').addEventListener('click', () => {
        chipEditing = null;
        renderChipsBox();
    });

    role('save').addEventListener('click', async () => {
        clearMsg(role('msg'));
        const v = values();
        if (!v.label) {
            showMsg(role('msg'), 'The label cannot be empty.', false);
            return;
        }
        // a new chip sends everything; an edit sends only what changed
        const body = chip ? { id: chip.id, ...changes() } : { slot, ...v };
        role('save').disabled = role('cancel').disabled = true;
        role('save').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';
        try {
            const { data } = await api('chips.php', { method: chip ? 'PATCH' : 'POST', body: JSON.stringify(body) });
            chipsSaved = [...chipsSaved.filter(c => c.id !== data.id), data].sort((a, b) => a.slot - b.slot);
            chipEditing = null;
            renderChipsBox();
            flashChipsMsg(chip ? `"${data.label}" saved.` : `"${data.label}" added at position ${slot}.`);
        } catch (err) {
            showMsg(role('msg'), err.message, false);
            role('cancel').disabled = false;
            role('save').innerHTML = '<i class="bi bi-check2"></i> Save changes';
            refresh();
        }
    });

    chipEditing = { slot, el: node, isDirty };
    renderChipsBox();
    refresh();
    field('label').focus();
}

async function deleteChip(chip, btn) {
    if (!confirm(`Delete the chip "${chip.label}"? Its position will stay empty.`)) return;
    clearMsg($('chipsMsg'));
    btn.disabled = true;
    try {
        await api('chips.php', { method: 'DELETE', body: JSON.stringify({ id: chip.id }) });
        chipsSaved = chipsSaved.filter(c => c.id !== chip.id);
        renderChipsBox();
        flashChipsMsg(`"${chip.label}" deleted.`);
    } catch (err) {
        showMsg($('chipsMsg'), err.message, false);
        loadChips(); // show what the database really has now
    }
}

async function loadChips() {
    try {
        const res = await api('chips.php');
        chipsSaved = res.data;
        chipSlots = res.slots;
        renderChipsBox();
    } catch (err) {
        $('chipsMeta').textContent = 'Could not load';
        showMsg($('chipsMsg'), err.message, false);
    }
}

/* ── marquee box ── words are added and deleted, like skills */
let marqueeSaved = [];              // rows as GET marquee.php returned them
let marqueeEditing = false;
const marqueeToDelete = new Set();  // ids of saved words marked for removal
let marqueeToAdd = [];              // labels not saved yet
let marqueeMsgTimer;

const marqueeDirty = () => marqueeToDelete.size > 0 || marqueeToAdd.length > 0;

function renderMarqueeBox() {
    const list = $('marqueeList');
    list.textContent = '';
    if (!marqueeEditing) {
        list.append(...marqueeSaved.map(w => marqueeItem(w.label))); // as on the site, without scrolling
    } else {
        for (const w of marqueeSaved) {
            const removed = marqueeToDelete.has(w.id);
            list.append(skillPill(w.label, removed ? 'is-removed' : '', () => {
                if (removed) marqueeToDelete.delete(w.id);
                else marqueeToDelete.add(w.id);
                marqueeChanged();
            }, removed ? 'Keep' : 'Delete', removed ? 'bi-arrow-counterclockwise' : 'bi-x-lg'));
        }
        for (const label of marqueeToAdd) {
            list.append(skillPill(label, 'is-new', () => {
                marqueeToAdd = marqueeToAdd.filter(l => l !== label);
                marqueeChanged();
            }, 'Remove', 'bi-x-lg'));
        }
    }
    if (!marqueeSaved.length && !marqueeToAdd.length) {
        list.append(make('p', 'dash-placeholder', 'No words yet, so the strip is hidden on the site.'));
    }
    $('marqueeMeta').textContent = `${marqueeSaved.length} word${marqueeSaved.length === 1 ? '' : 's'}`;
}

function marqueeChanged() {
    $('marqueeDirty').hidden = !marqueeDirty();
    $('marqueeSave').disabled = !marqueeDirty();
    renderMarqueeBox();
}

function setMarqueeEditing(on) {
    marqueeEditing = on;
    marqueeToDelete.clear();
    marqueeToAdd = [];
    $('boxMarquee').classList.toggle('is-editing', on);
    $('marqueeAddForm').hidden = !on;
    $('marqueeEdit').hidden = on;
    $('marqueeCancel').hidden = !on;
    $('marqueeSave').hidden = !on;
    $('marqueeInput').value = '';
    marqueeChanged();
}

async function loadMarquee() {
    try {
        marqueeSaved = (await api('marquee.php')).data;
        renderMarqueeBox();
        $('marqueeEdit').disabled = false;
    } catch (err) {
        $('marqueeMeta').textContent = 'Could not load';
        showMsg($('marqueeMsg'), err.message, false);
    }
}

$('marqueeEdit').addEventListener('click', () => {
    clearMsg($('marqueeMsg'));
    setMarqueeEditing(true);
    $('marqueeInput').focus();
});

$('marqueeCancel').addEventListener('click', () => {
    clearMsg($('marqueeMsg'));
    setMarqueeEditing(false);
});

$('marqueeAddForm').addEventListener('submit', e => {
    e.preventDefault();
    clearMsg($('marqueeMsg'));
    const label = $('marqueeInput').value.trim();
    if (!label) {
        showMsg($('marqueeMsg'), 'Type a word first.', false);
        return;
    }
    const existing = marqueeSaved.find(w => sameText(w.label, label));
    if (existing && marqueeToDelete.has(existing.id)) {
        marqueeToDelete.delete(existing.id); // adding back a word marked for removal just keeps it
    } else if (existing || marqueeToAdd.some(l => sameText(l, label))) {
        showMsg($('marqueeMsg'), `"${label}" is already in the marquee.`, false);
        return;
    } else {
        marqueeToAdd.push(label);
    }
    $('marqueeInput').value = '';
    $('marqueeInput').focus();
    marqueeChanged();
});

$('marqueeSave').addEventListener('click', async () => {
    if (!marqueeDirty()) return;
    clearTimeout(marqueeMsgTimer);
    clearMsg($('marqueeMsg'));
    $('marqueeSave').disabled = true;
    $('marqueeCancel').disabled = true;
    $('marqueeSave').innerHTML = '<i class="bi bi-hourglass-split"></i> Saving…';

    // one request per change; whatever fails stays pending so it can be retried
    const failed = [];
    let removed = 0, added = 0;
    for (const w of marqueeSaved.filter(w => marqueeToDelete.has(w.id))) {
        try {
            await api('marquee.php', { method: 'DELETE', body: JSON.stringify({ id: w.id }) });
            marqueeToDelete.delete(w.id);
            removed++;
        } catch (err) {
            failed.push(`Could not delete "${w.label}": ${err.message}`);
        }
    }
    for (const label of [...marqueeToAdd]) {
        try {
            await api('marquee.php', { method: 'POST', body: JSON.stringify({ label }) });
            marqueeToAdd = marqueeToAdd.filter(l => l !== label);
            added++;
        } catch (err) {
            failed.push(`Could not add "${label}": ${err.message}`);
        }
    }

    try {
        marqueeSaved = (await api('marquee.php')).data;
    } catch { /* keep the old list; the error below still explains what happened */ }

    $('marqueeSave').innerHTML = '<i class="bi bi-check2"></i> Save changes';
    $('marqueeCancel').disabled = false;

    if (failed.length) {
        marqueeChanged();
        showMsg($('marqueeMsg'), failed.join(' '), false);
        return;
    }
    setMarqueeEditing(false);
    const parts = [added && `${added} added`, removed && `${removed} deleted`].filter(Boolean);
    showMsg($('marqueeMsg'), `Changes saved: ${parts.join(', ')}.`, true);
    marqueeMsgTimer = setTimeout(() => clearMsg($('marqueeMsg')), 3000);
});

// warn before leaving the page with unsaved edits
addEventListener('beforeunload', e => {
    const aboutDirty = aboutEditing && aboutSaved && Object.keys(aboutChanges()).length;
    const projectDirty = projectEditing && projectEditing.isDirty();
    const journeyDirty = journeyEditing && journeyEditing.isDirty();
    const contactDirty = contactEditing && contactSaved && Object.keys(contactChanges()).length;
    const currentlyDirty = currentlyEditing && currentlySaved && Object.keys(currentlyChanges()).length;
    const chipDirty = chipEditing && chipEditing.isDirty();
    if (aboutDirty || currentlyDirty || (skillsEditing && skillsDirty()) || projectDirty || journeyDirty || contactDirty
        || chipDirty || (marqueeEditing && marqueeDirty())) e.preventDefault();
});

loadChips();
loadMarquee();
loadAbout();
loadCurrently();
loadSkills();
loadProjects();
loadJourney();
loadContact();

$('logoutBtn').addEventListener('click', async () => {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.disabled = true;

    try {
        await fetch(`${API_BASE}/logout.php`, { method: 'POST', credentials: 'include' });
    } catch (err) {
        // ignore — still clear local state and send them back to the login screen
    } finally {
        sessionStorage.removeItem('adminEmail');
        location.href = 'admin.html';
    }
});
