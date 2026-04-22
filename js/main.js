/* ========================================
   ClearPath AI — Main JavaScript
   Navigation, Scroll Animations, Form UI
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavbarScroll();
  initActiveSection();
  initScrollReveal();
  initMobileMenu();
  initContactForm();
  initVideoFallback();
});

/* --- Smooth Scroll Navigation --- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });
}

/* --- Navbar Scroll Effect --- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --- Active Section Highlighting --- */
function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* --- Scroll-Triggered Section Reveals --- */
function initScrollReveal() {
  const sections = document.querySelectorAll('.section-content');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  sections.forEach(section => observer.observe(section));

  // Staggered card reveal
  const cards = document.querySelectorAll('.product-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay based on card position
        const card = entry.target;
        const allCards = Array.from(cards);
        const cardIndex = allCards.indexOf(card);
        card.style.transitionDelay = `${cardIndex * 0.1}s`;
        card.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  cards.forEach(card => cardObserver.observe(card));
}

/* --- Mobile Hamburger Menu --- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* --- Contact Form UI --- */
function initContactForm() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    // Success — show toast and reset form
    showToast('Thank you! Your message has been sent.');
    form.reset();
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* --- Video Autoplay Fallback --- */
function initVideoFallback() {
  const video = document.getElementById('hero-video');

  video.addEventListener('canplay', () => {
    video.play().catch(() => {
      // Autoplay blocked — play on first user interaction
      const playOnInteraction = () => {
        video.play();
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
    });
  });
}