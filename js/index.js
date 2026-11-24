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

/* ── scroll progress ── */
const prog = document.getElementById('prog');
addEventListener('scroll', () => {
    const h = document.documentElement;
    prog.style.transform = 'scaleX(' + (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) + ')';
}, { passive: true });

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

/* ── mobile menu ── */
const burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mnav.classList.toggle('open');
});
mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); mnav.classList.remove('open');
}));

/* ── reveals ── */
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ── active nav link ── */
const secs = [...document.querySelectorAll('main section, #hero')];
const plinks = [...document.querySelectorAll('.plink')];
addEventListener('scroll', () => {
    let cur = '';
    secs.forEach(s => { if (scrollY >= s.offsetTop - 200) cur = s.id; });
    plinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
}, { passive: true });

/* ── word rotor ── */
const words = () => ['secure backends', 'AI-powered products', 'fast APIs', 'production systems'];
const rw = document.getElementById('rotorWord');
if (!RM) {
    let wi = 0;
    setInterval(() => {
        rw.classList.add('down');
        setTimeout(() => {
            wi = (wi + 1) % words().length;
            rw.textContent = words()[wi];
            rw.style.transition = 'none';
            rw.style.transform = 'translateY(-110%)';
            rw.style.opacity = '0';
            void rw.offsetHeight;
            rw.style.transition = '';
            rw.classList.remove('down');
            rw.style.transform = '';
            rw.style.opacity = '';
        }, 460);
    }, 3000);
}

/* ── 3D tilt + glare ── */
function bindTilt(card) {
    if (TOUCH || RM) return;
    const max = card.classList.contains('proj') ? 4 : 7;
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * max) + 'deg) rotateY(' + ((px - .5) * max) + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
}
document.querySelectorAll('.tilt').forEach(bindTilt);

/* ── magnetic buttons ── */
if (!TOUCH && !RM) document.querySelectorAll('.mag').forEach(b => {
    b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + x * .18 + 'px,' + y * .25 + 'px)';
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
});

// content.js builds sections from the database after load and wires the new elements with these
window.OT = {
    reveal: el => io.observe(el),
    tilt: bindTilt,
};

/* ── hero chip parallax ── */
if (!TOUCH && !RM) {
    addEventListener('mousemove', e => {
        const dx = (e.clientX / innerWidth - .5), dy = (e.clientY / innerHeight - .5);
        // looked up on each move: the chips are added from the database after load
        document.querySelectorAll('#heroChips .chip').forEach((c, i) => {
            const depth = 10 + (i % 3) * 8;
            c.style.marginLeft = (dx * depth) + 'px';
            c.style.marginTop = (dy * depth) + 'px';
        });
    }, { passive: true });
}

