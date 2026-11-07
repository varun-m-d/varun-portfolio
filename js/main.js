/* =============================================
   MAIN.JS — Varun M D Portfolio
   ============================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Dark mode was removed; clear any theme saved by the previous version */
try { localStorage.removeItem('theme'); } catch (e) { /* storage unavailable */ }

const header = document.getElementById('siteHeader');

/* ---- Mobile nav ---- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); navToggle.focus(); }
});
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});
window.matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* ---- Scroll reveal ---- */
const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ---- Stat counters ----
   The HTML already contains the final values (no-JS / reduced-motion fallback).
   With motion allowed, count up from 0 once the stats scroll into view. */
const statNums = document.querySelectorAll('.stat-num');

function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals);
  };
  requestAnimationFrame(tick);
}

if (!prefersReducedMotion && 'IntersectionObserver' in window && statNums.length) {
  const statsBox = statNums[0].closest('.stats');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach(animateCount);
        statObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  statObserver.observe(statsBox);
}

/* ---- Active nav link on scroll ---- */
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
if ('IntersectionObserver' in window) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinkEls.forEach(link => {
        const on = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', on);
        if (on) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(sec => activeObserver.observe(sec));
}

/* ---- Contact Form ---- */
const form = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');
const submitBtn = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate
    if (!name || !email || !message) {
      feedback.textContent = 'Please fill in all fields.';
      feedback.className = 'form-feedback error';
      return;
    }

    // Show loading
    btnText.style.display = 'none';
    btnLoader.style.display = '';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Success
      feedback.textContent = '✓ Message sent! I\'ll get back to you soon.';
      feedback.className = 'form-feedback success';

      form.reset();

      setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'form-feedback';
      }, 5000);

    } catch (error) {
      console.error('Contact form error:', error);

      feedback.textContent =
        '✕ Unable to send message. Please try again later.';
      feedback.className = 'form-feedback error';

    } finally {
      // Reset button
      btnText.style.display = '';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}
