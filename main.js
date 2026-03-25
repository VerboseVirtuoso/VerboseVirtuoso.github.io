document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initCursor();
    initStarCanvas();
    initGSAPAnimations();
    initProjectCardAnimations();
    initContactForm();
    initAchievementObserver();
});

/* ═══════════════════════════════════════════════════════
   1. MAGNETIC CURSOR
════════════════════════════════════════════════════════ */
function initCursor() {
    const cursor = document.getElementById('cursor-orb');
    if (!cursor) return;

    let mouseX = 0, mouseY = 0;
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    (function loop() {
        cx += (mouseX - cx) * 0.1;
        cy += (mouseY - cy) * 0.1;
        cursor.style.left = cx + 'px';
        cursor.style.top  = cy + 'px';
        requestAnimationFrame(loop);
    })();

    // Holographic angle + magnetic pull on interactive cards/buttons
    document.querySelectorAll('.glass-card, .terminal-btn, .github-link, .cv-btn').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const angle = Math.atan2(
                e.clientY - r.top  - r.height / 2,
                e.clientX - r.left - r.width  / 2
            ) * (180 / Math.PI);
            el.style.setProperty('--angle', angle + 'deg');
            cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%,-50%) scale(1)';
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' });
        });
    });

    // Subtle magnetic pull on buttons
    document.querySelectorAll('.terminal-btn, .cv-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, {
                x: (e.clientX - (r.left + r.width  / 2)) * 0.25,
                y: (e.clientY - (r.top  + r.height / 2)) * 0.25,
                duration: 0.3, ease: 'power2.out'
            });
        });
    });
}

/* ═══════════════════════════════════════════════════════
   2. STAR FIELD CANVAS
════════════════════════════════════════════════════════ */
function initStarCanvas() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
        createStars();
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < 220; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.6,
                opacity: Math.random() * 0.65 + 0.1,
                speed: Math.random() * 0.05 + 0.008
            });
        }
    }

    (function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#E8EFFF';
        stars.forEach(s => {
            ctx.globalAlpha = s.opacity;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            s.y -= s.speed;
            if (s.y < 0) s.y = h;
        });
        requestAnimationFrame(draw);
    })();

    window.addEventListener('resize', resize);
    resize();
}

/* ═══════════════════════════════════════════════════════
   3. GSAP ANIMATIONS & SCROLL TRIGGER
════════════════════════════════════════════════════════ */
function initGSAPAnimations() {

    // ── About: Horizontal Scroll ──────────────────────
    const aboutSection = document.querySelector('.about-section');
    const hContainer   = document.querySelector('.horizontal-container');

    if (aboutSection && hContainer && window.innerWidth > 768) {
        gsap.to(hContainer, {
            x: () => -(hContainer.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: aboutSection,
                pin: true,
                scrub: 1,
                end: () => '+=' + hContainer.scrollWidth,
                invalidateOnRefresh: true
            }
        });
    }

    // ── Char-reveal headings ──────────────────────────
    document.querySelectorAll('.char-reveal').forEach(heading => {
        const text = heading.innerText;
        heading.innerHTML = text.split('').map(c =>
            `<span style="display:inline-block;opacity:0;transform:rotateX(90deg)">${c === ' ' ? '&nbsp;' : c}</span>`
        ).join('');

        gsap.to(heading.querySelectorAll('span'), {
            opacity: 1, rotateX: 0,
            stagger: 0.025, duration: 0.45,
            scrollTrigger: { trigger: heading, start: 'top 82%' }
        });
    });

    // ── Animated heading underlines ───────────────────
    document.querySelectorAll('.heading-underline').forEach(line => {
        ScrollTrigger.create({
            trigger: line,
            start: 'top 85%',
            onEnter: () => line.classList.add('animated')
        });
    });

    // ── Scroll-progress orb ───────────────────────────
    const orb = document.getElementById('scroll-orb');
    if (orb) {
        gsap.to(orb, {
            scale: 2.5,
            backgroundColor: 'var(--plasma)',
            boxShadow: '0 0 40px var(--plasma)',
            scrollTrigger: {
                scrub: true, start: 'top top', end: 'bottom bottom',
                onUpdate(self) {
                    if (self.progress > 0.99 && !orb.dataset.exploded) {
                        explodeOrb(orb);
                        orb.dataset.exploded = '1';
                    } else if (self.progress < 0.9) {
                        orb.dataset.exploded = '';
                    }
                }
            }
        });
    }

    function explodeOrb(el) {
        const { left, top, width, height } = el.getBoundingClientRect();
        const cx = left + width / 2, cy = top + height / 2;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'fixed', left: cx + 'px', top: cy + 'px',
                width: '4px', height: '4px',
                background: 'var(--aurora)', borderRadius: '50%',
                pointerEvents: 'none', zIndex: 2000
            });
            document.body.appendChild(p);
            gsap.to(p, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                opacity: 0, duration: 1,
                onComplete: () => p.remove()
            });
        }
        gsap.to(el, { scale: 4, opacity: 0, duration: 0.2, yoyo: true, repeat: 1 });
    }

    // ── Nav-dot active state ──────────────────────────
    const sections = document.querySelectorAll('main section');
    const navDots  = document.querySelectorAll('.nav-dot');

    sections.forEach((sec, i) => {
        ScrollTrigger.create({
            trigger: sec,
            start: 'top center',
            end:   'bottom center',
            onEnter:     () => setActiveNav(i),
            onEnterBack: () => setActiveNav(i)
        });
    });

    function setActiveNav(i) {
        navDots.forEach(d => d.classList.remove('active'));
        if (navDots[i]) navDots[i].classList.add('active');
    }

    // ── Education node entrance ───────────────────────
    document.querySelectorAll('.edu-node').forEach((node, i) => {
        gsap.fromTo(node,
            { opacity: 0, x: -40 },
            {
                opacity: 1, x: 0, duration: 0.75,
                delay: i * 0.1,
                scrollTrigger: { trigger: node, start: 'top 85%' }
            }
        );
    });

    // ── GSAP generic fade-up elements ─────────────────
    document.querySelectorAll('.gsap-fade-up').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%'
            },
            delay: (i % 4) * 0.08  // stagger within groups of 4
        });
    });
}

/* ═══════════════════════════════════════════════════════
   4. PROJECT CARD HOVER RIPPLE
════════════════════════════════════════════════════════ */
function initProjectCardAnimations() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cards.forEach(sib => {
                if (sib !== card) gsap.to(sib, { scale: 0.97, opacity: 0.7, duration: 0.35 });
            });
        });
        card.addEventListener('mouseleave', () => {
            cards.forEach(sib => gsap.to(sib, { scale: 1, opacity: 1, duration: 0.35 }));
        });
    });
}

/* ═══════════════════════════════════════════════════════
   5. CONTACT FORM + TERMINAL TYPEWRITER
════════════════════════════════════════════════════════ */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('.terminal-btn');
        btn.textContent = 'TRANSMITTING...';
        setTimeout(() => {
            btn.textContent = 'SUCCESS: MESSAGE SENT';
            btn.style.background = 'var(--aurora)';
            btn.style.color = '#000';
            form.reset();
            setTimeout(() => {
                btn.textContent = 'EXECUTE SEND --FORCE';
                btn.style.background = '';
                btn.style.color = '';
            }, 3000);
        }, 1500);
    });

    // Typewriter placeholders on scroll-into-view
    form.querySelectorAll('.terminal-input').forEach(input => {
        const ph = input.placeholder;
        input.placeholder = '';
        let i = 0, done = false;
        ScrollTrigger.create({
            trigger: input,
            start: 'top 90%',
            onEnter() {
                if (done) return;
                done = true;
                const iv = setInterval(() => {
                    input.placeholder += ph[i++];
                    if (i >= ph.length) clearInterval(iv);
                }, 46);
            }
        });
    });
}

/* ═══════════════════════════════════════════════════════
   6. ACHIEVEMENT CARD STAGGERED ENTRANCE
════════════════════════════════════════════════════════ */
function initAchievementObserver() {
    const cards = document.querySelectorAll('.achievement-card');
    if (!cards.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('in-view'), idx * 120);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(c => io.observe(c));
}
