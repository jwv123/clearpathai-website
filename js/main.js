/* ========================================
   ClearPath AI — Main JavaScript
   Navigation, Scroll Animations, Form UI
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAudioToggle();
  initLoader();
});

/* --- Asset Preloader --- */
function initLoader() {
  const assets = [
    'assets/hero-video.mp4',
    'assets/intro-image.png',
    'assets/about-image.png',
    'assets/products-image.png',
    'assets/shareshift.jpg',
    'assets/logo.jpg'
  ];

  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderLabel = document.getElementById('loader-label');
  const loader = document.getElementById('loader');
  const site = document.getElementById('site');

  const labels = [
    'INITIALIZING',
    'LOADING ASSETS',
    'BUFFERING MEDIA',
    'CALIBRATING SYSTEMS',
    'ALMOST READY',
    'ONLINE'
  ];

  let totalLoaded = 0;
  let totalBytes = 0;

  function updateProgress() {
    const pct = totalBytes > 0
      ? Math.min(Math.round((totalLoaded / totalBytes) * 100), 100)
      : 0;
    loaderBar.style.width = pct + '%';
    loaderPercent.textContent = pct;
    const labelIndex = Math.min(Math.floor(pct / 20), labels.length - 1);
    loaderLabel.textContent = labels[labelIndex];
  }

  // First pass: HEAD requests to get file sizes
  Promise.all(assets.map(src =>
    fetch(src, { method: 'HEAD' })
      .then(r => {
        const size = parseInt(r.headers.get('Content-Length') || '0', 10);
        totalBytes += size;
        return size;
      })
      .catch(() => 0)
  )).then(() => {
    updateProgress();

    // Second pass: actually download every byte
    let completed = 0;
    const total = assets.length;

    const downloads = assets.map(src => {
      return fetch(src)
        .then(response => {
          if (!response.body) {
            // No streaming — just mark done
            completed++;
            totalLoaded = totalBytes;
            updateProgress();
            return;
          }
          const reader = response.body.getReader();
          let received = 0;

          function read() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                completed++;
                updateProgress();
                if (completed === total) finishLoading();
                return;
              }
              received += value.length;
              totalLoaded += value.length;
              updateProgress();
              return read();
            });
          }
          return read();
        })
        .catch(() => {
          completed++;
          updateProgress();
          if (completed === total) finishLoading();
        });
    });

    // If all fetches resolve without streaming, ensure we still finish
    Promise.all(downloads).then(() => {
      if (completed === total) finishLoading();
    });
  });

  function finishLoading() {
    totalLoaded = totalBytes;
    loaderBar.style.width = '100%';
    loaderPercent.textContent = '100';
    loaderLabel.textContent = labels[labels.length - 1];
    setTimeout(() => {
      loader.classList.add('fade-out');
      site.classList.remove('site-hidden');
      site.classList.add('site-visible');
      initSmoothScroll();
      initNavbarScroll();
      initActiveSection();
      initScrollReveal();
      initMobileMenu();
      initContactForm();
      initVideoFallback();
    }, 600);
  }
}

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

  function updateActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
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
const WEBHOOK_URL = 'https://ef0ps4gk.rcsrv.net/webhook/d2b01cc4-9dc6-4abd-80e8-6e09b1dc3687';

function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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

    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (!res.ok) throw new Error(res.statusText);

      showToast('Thank you! Your message has been sent.');
      form.reset();
    } catch {
      showToast('Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
    }
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

/* --- Audio First-Play Tracking --- */
let firstSoundPlayDone = false;

function updateAudioIcons(muted) {
  const iconMuted = document.getElementById('audio-icon-muted');
  const iconUnmuted = document.getElementById('audio-icon-unmuted');
  iconMuted.style.display = muted ? '' : 'none';
  iconUnmuted.style.display = muted ? 'none' : '';
}

/* --- Video Autoplay Fallback --- */
function initVideoFallback() {
  const video = document.getElementById('hero-video');

  // Ensure video is playing (handles blocked autoplay)
  if (video.paused) {
    video.play().catch(() => {
      const playOnInteraction = () => { video.play(); };
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
    });
  }

  // Unmute on first real user interaction (browsers require gesture for sound)
  const unmuteOnInteraction = (e) => {
    if (!e.isTrusted) return; // Ignore simulated clicks
    if (!firstSoundPlayDone && video.muted) {
      video.muted = false;
      updateAudioIcons(false);
    }
    document.removeEventListener('click', unmuteOnInteraction);
    document.removeEventListener('touchstart', unmuteOnInteraction);
  };
  document.addEventListener('click', unmuteOnInteraction);
  document.addEventListener('touchstart', unmuteOnInteraction);

  // Auto-mute after first playthrough with sound
  video.addEventListener('timeupdate', () => {
    if (!firstSoundPlayDone && !video.muted && video.duration > 0 && video.currentTime >= video.duration - 0.5) {
      firstSoundPlayDone = true;
      video.muted = true;
      updateAudioIcons(true);
      document.removeEventListener('click', unmuteOnInteraction);
      document.removeEventListener('touchstart', unmuteOnInteraction);
    }
  });
}

/* --- Audio Toggle --- */
function initAudioToggle() {
  const video = document.getElementById('hero-video');
  const btn = document.getElementById('audio-toggle');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (video.muted) {
      video.muted = false;
      updateAudioIcons(false);
      video.play().catch(() => {
        video.muted = true;
        updateAudioIcons(true);
      });
    } else {
      video.muted = true;
      updateAudioIcons(true);
    }
  });
}