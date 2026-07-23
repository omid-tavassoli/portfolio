/* ── Typed text ── */
const phrases = ['Backend Systems.', 'Full-Stack Apps.', 'AI Solutions.', 'Secure APIs.'];
let pi = 0, ci = 0, deleting = false;
const el = document.getElementById('typed');

function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting
        ? phrase.slice(0, ci - 1)
        : phrase.slice(0, ci + 1);
    deleting ? ci-- : ci++;

    let delay = deleting ? 45 : 90;
    if (!deleting && ci === phrase.length) { delay = 2200; deleting = true; }
    else if (deleting && ci === 0)         { deleting = false; pi = (pi + 1) % phrases.length; delay = 400; }
    setTimeout(tick, delay);
}
tick();

/* ── Scroll reveal ── */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ── Navbar active link + shadow ── */
const navbar   = document.getElementById('navbar');
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) current = s.id; });
    navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
}, { passive: true });

/* ── Smooth close mobile menu on nav click ── */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.querySelector('.navbar-collapse');
        if (menu.classList.contains('show')) bootstrap.Collapse.getInstance(menu)?.hide();
    });
});
