/* shared.js — used by both index.html (content.js) and dashboard.html (dashboard.js),
   so the site and the dashboard render database content with exactly the same rules */

// the PHP backend; change this when deploying
const API_BASE = 'http://127.0.0.1:8091/api';

function make(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
}

const isHttpUrl = value => /^https?:\/\/\S+$/i.test(value || '');
const techList = text => String(text || '').split(',').map(t => t.trim()).filter(Boolean);

function gradSpan(text) {
    return make('span', 'grad-text', text);
}

/* text rules: headings end in a gradient word, paragraphs are separated by an empty line,
   **word** becomes a highlighted <em>. Data is only ever inserted as text, never as HTML. */

// **word** in a heading picks the gradient words; without markers the last word gets it
function renderHeading(el, text) {
    el.textContent = '';
    const parts = text.split(/\*\*(.+?)\*\*/s);
    if (parts.length > 1) {
        parts.forEach((part, i) => {
            if (part) el.append(i % 2 ? gradSpan(part) : part);
        });
        return;
    }
    const cut = text.lastIndexOf(' ');
    el.append(text.slice(0, cut + 1), gradSpan(text.slice(cut + 1)));
}

function renderParagraphs(el, text) {
    el.textContent = '';
    for (const para of text.split(/\n\s*\n/)) {
        if (!para.trim()) continue;
        const p = document.createElement('p');
        para.trim().split(/\*\*(.+?)\*\*/s).forEach((part, i) => {
            if (!part) return;
            if (i % 2) p.append(make('em', null, part));
            else p.append(part);
        });
        el.append(p);
    }
}

// icon and colour per skill group (the groups are the ENUM on skills.header)
const SKILL_STYLE = {
    'Programming Languages': { icon: 'bi-code-slash' },
    'Backend & Security':    { icon: 'bi-shield-lock', bg: 'linear-gradient(135deg,var(--violet),var(--pink))' },
    'Frontend & Data':       { icon: 'bi-window-sidebar', bg: 'linear-gradient(135deg,var(--cyan),var(--violet))' },
    'Machine Learning':      { icon: 'bi-stars', bg: 'linear-gradient(135deg,var(--violet),var(--cyan))' },
    'AI':                    { icon: 'bi-robot', bg: 'linear-gradient(135deg,var(--cyan),var(--pink))' },
    'DevOps & Tools':        { icon: 'bi-box-seam' },
    'Tools':                 { icon: 'bi-tools', bg: 'linear-gradient(135deg,var(--pink),var(--violet))' },
    'Languages':             { icon: 'bi-translate', bg: 'linear-gradient(135deg,var(--pink),var(--cyan))' },
};

function skillIcon(header) {
    const style = SKILL_STYLE[header] || {};
    const ic = make('div', 'skill-ic');
    if (style.bg) ic.style.background = style.bg;
    ic.append(make('i', `bi ${style.icon || 'bi-tag'}`));
    return ic;
}
