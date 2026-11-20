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

/* ══════════════ auth form ══════════════ */
const $ = s => document.querySelector(s);
const API_BASE = 'http://127.0.0.1:8091/api';

const loginForm = $('#loginForm'), signupForm = $('#signupForm');
const loginMsg = $('#loginMsg'), signupMsg = $('#signupMsg');
const tabs = [...document.querySelectorAll('.auth-tab')];
const forms = { login: loginForm, signup: signupForm };

function showMsg(el, text, ok) {
    el.textContent = text;
    el.classList.remove('ok', 'err');
    el.classList.add('show', ok ? 'ok' : 'err');
}
function clearMsg(el) { el.classList.remove('show', 'ok', 'err'); el.textContent = ''; }

function showTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    Object.entries(forms).forEach(([key, form]) => form.classList.toggle('active', key === name));
    clearMsg(loginMsg); clearMsg(signupMsg);
}
tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('[data-tab-link]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    showTab(a.dataset.tabLink);
}));

/* ── login ── */
loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearMsg(loginMsg);

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    if (!email || !password) { showMsg(loginMsg, 'Please fill in both fields.', false); return; }

    const submitBtn = loginForm.querySelector('.auth-submit');
    submitBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { showMsg(loginMsg, data.error || 'Login failed.', false); submitBtn.disabled = false; return; }

        sessionStorage.setItem('adminEmail', email);
        location.href = 'dashboard.html';
    } catch (err) {
        showMsg(loginMsg, 'Could not reach the server. Please try again.', false);
        submitBtn.disabled = false;
    }
});

/* ── signup ── */
signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearMsg(signupMsg);

    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;
    const confirmPassword = signupForm.confirmPassword.value;

    if (!name || !email || !password || !confirmPassword) { showMsg(signupMsg, 'Please fill in all fields.', false); return; }
    if (password.length < 8) { showMsg(signupMsg, 'Password must be at least 8 characters.', false); return; }
    if (password !== confirmPassword) { showMsg(signupMsg, 'Passwords do not match.', false); return; }

    const submitBtn = signupForm.querySelector('.auth-submit');
    submitBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/signup.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: name, email, password })
        });
        const data = await res.json();
        if (!res.ok) { showMsg(signupMsg, data.error || 'Sign up failed.', false); return; }

        showMsg(signupMsg, 'Account created — you can log in now.', true);
        signupForm.reset();
        setTimeout(() => showTab('login'), 1400);
    } catch (err) {
        showMsg(signupMsg, 'Could not reach the server. Please try again.', false);
    } finally {
        submitBtn.disabled = false;
    }
});
