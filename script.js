// Birthday Wish Website JavaScript Interactivity

document.addEventListener('DOMContentLoaded', () => {
  setupBackgroundObserver();
  setupPolaroidParallax();
  setupFloatingCanvas();
  setupQuoteSharing();
  setupAudioPlayer();
  setupCakeCountdown();
});

// -------------------------------------------------------------
// 1. Dynamic Background Cross-Fade & Dot Navigation (UPDATED)
// -------------------------------------------------------------
function setupBackgroundObserver() {
  const sections = document.querySelectorAll('section');
  const slides = document.querySelectorAll('[id^="bg-slide-"]');
  const dots = document.querySelectorAll('.scroll-dot');
  const wishContainer = document.getElementById('wishOverlayContainer');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.01 // Trigger earlier for responsive fluid scrolling
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const bgIndex = parseInt(entry.target.getAttribute('data-bg-index'), 10);
      
      if (entry.isIntersecting) {
        // 1. Fade background slides
        slides.forEach((slide, idx) => {
          if (idx === bgIndex) {
            slide.style.opacity = '1';
          } else {
            slide.style.opacity = '0';
          }
        });

        // 2. Update navigation dots
        dots.forEach((dot, idx) => {
          if (idx === bgIndex) {
            dot.classList.add('bg-rose-400', 'scale-125', 'active-dot');
            dot.classList.remove('bg-white/30', 'scale-100');
          } else {
            dot.classList.remove('bg-rose-400', 'scale-125', 'active-dot');
            dot.classList.add('bg-white/30', 'scale-100');
          }
        });

       // REPLACE IT WITH THIS SMALL SAFEGUARD:
       if (bgIndex !== 7) {
        if (wishContainer) wishContainer.style.setProperty('display', 'none', 'important');
       }


        // 3. ENTRANCE ANIMATION: Slow float up & fade in
        entry.target.querySelectorAll('.glass-panel, .polaroid-card').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0px) scale(1)';
          el.style.transition = 'transform 2500ms cubic-bezier(0.1, 1, 0.1, 1), opacity 2500ms ease-out';
        });

      } else {
        // 4. EXIT ANIMATION: Slow continuous dissolve upwards
        entry.target.querySelectorAll('.glass-panel, .polaroid-card').forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(-50px) scale(0.95)';
          el.style.transition = 'transform 2000ms cubic-bezier(0.1, 1, 0.1, 1), opacity 2000ms ease-in-out';
        });
      }

    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Sync scroll on click of dots
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      const targetSection = document.getElementById(`section-${targetIndex + 1}`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}


// -------------------------------------------------------------
// 2. Polaroid Parallax Hover-Tilt
// -------------------------------------------------------------
function setupPolaroidParallax() {
  const cards = document.querySelectorAll('.polaroid-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles based on mouse offset from center
      // Max tilt: 12 degrees
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateY(-5px)`;
      card.style.zIndex = '40';
    });

    card.addEventListener('mouseleave', () => {
      // Reset position smoothly
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.zIndex = '';
    });
  });
}

// -------------------------------------------------------------
// 3. Floating Heart & Sparkle Canvas Layer
// -------------------------------------------------------------
function setupFloatingCanvas() {
  const canvas = document.getElementById('floatingCanvas');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const particleCount = 45;

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Particle Class
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initiallyOnScreen = false) {
      this.x = Math.random() * canvas.width;
      this.y = initiallyOnScreen ? Math.random() * canvas.height : canvas.height + 20;
      this.size = Math.random() * 8 + 4; // size in radius/scale
      this.speedY = Math.random() * 1.2 + 0.5; // slow drift upwards
      this.speedX = Math.random() * 0.4 - 0.2;
      this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
      this.opacity = Math.random() * 0.5 + 0.25;
      this.swingSpeed = Math.random() * 0.02 + 0.005;
      this.swingRange = Math.random() * 15 + 5;
      this.swingStep = Math.random() * 100;
    }

    update() {
      this.y -= this.speedY;
      this.swingStep += this.swingSpeed;
      this.x += Math.sin(this.swingStep) * 0.3 + this.speedX;
      
      // Fade out as it goes high up
      if (this.y < canvas.height * 0.3) {
        this.opacity -= 0.002;
      }

      if (this.y < -30 || this.opacity <= 0) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      if (this.type === 'heart') {
        // Draw Heart
        ctx.fillStyle = 'rgba(244, 63, 94, 0.7)'; // soft rose-500 red/pink
        ctx.beginPath();
        const topY = this.y - this.size;
        
        ctx.moveTo(this.x, this.y);
        // Left side curve
        ctx.bezierCurveTo(
          this.x - this.size * 1.5, this.y - this.size * 0.5,
          this.x - this.size * 1.5, topY,
          this.x, topY + this.size * 0.3
        );
        // Right side curve
        ctx.bezierCurveTo(
          this.x + this.size * 1.5, topY,
          this.x + this.size * 1.5, this.y - this.size * 0.5,
          this.x, this.y
        );
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw Sparkle (4 pointed star)
        ctx.fillStyle = 'rgba(253, 164, 175, 0.8)'; // light rose-300 cream/pink
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
        ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // Create initial particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

// -------------------------------------------------------------
// 4. Interactive Quotes Copy & Heart Click Bursts
// -------------------------------------------------------------
function setupQuoteSharing() {
  const shareButtons = document.querySelectorAll('.share-quote-btn');
  const toast = document.getElementById('toast');
  let toastTimeout;

  shareButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // 1. Copy text to clipboard
      const panel = btn.closest('.glass-panel');
      const title = panel.querySelector('h1, h2').innerText;
      const quote = panel.querySelector('p').innerText;
      const fullShareText = `"${quote}" - Happy Birthday! 💖`;
      
      navigator.clipboard.writeText(fullShareText).then(() => {
        // Show custom toast notice
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });

      // 2. Trigger heart burst particles at click location
      createHeartBurst(e.clientX, e.clientY);
    });
  });
}

function createHeartBurst(clickX, clickY) {
  const emojis = ['❤️', '💖', '✨', '🌸', '💝', '💗', '💕'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'burst-particle text-xl md:text-2xl';
    span.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    // Calculate dispersion angle & distance
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 120 + 60; // disperse 60-180px
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40; // bias upwards
    const scale = Math.random() * 0.7 + 0.7;

    // Apply inline style custom properties for keyframes
    span.style.setProperty('--tx', `${tx}px`);
    span.style.setProperty('--ty', `${ty}px`);
    span.style.setProperty('--scale', scale);

    // Initial position relative to page
    span.style.left = `${clickX}px`;
    span.style.top = `${clickY}px`;

    document.body.appendChild(span);

    // Remove from DOM after animation completes
    setTimeout(() => {
      span.remove();
    }, 850);
  }
}

// -------------------------------------------------------------
// 5. Audio Player Setup (Autoplay policies friendly)
// -------------------------------------------------------------
function setupAudioPlayer() {
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const bgMusic = document.getElementById('bgMusic');

  // Set lower volume for background ambient effect
  bgMusic.volume = 0.35;

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicIcon.className = 'fa-solid fa-volume-high text-rose-400';
    } else {
      bgMusic.pause();
      musicIcon.className = 'fa-solid fa-volume-xmark text-rose-300';
    }
  });

  // Optional: Auto-play music on the first user interaction if blocked initially
  const playOnFirstTouch = () => {
    bgMusic.play().then(() => {
      musicIcon.className = 'fa-solid fa-volume-high text-rose-400';
      window.removeEventListener('click', playOnFirstTouch);
      window.removeEventListener('scroll', playOnFirstTouch);
    }).catch(() => {
      // browser blocks auto-play, wait for user explicit click
    });
  };

  window.addEventListener('click', playOnFirstTouch);
  window.addEventListener('scroll', playOnFirstTouch);
}
// -------------------------------------------------------------
// 6. Cake & Candle Countdown Celebration Logic (FULLY FIXED)
// -------------------------------------------------------------
function setupCakeCountdown() {
  const directToCakeBtn = document.getElementById('directToCakeBtn');
  const section8 = document.getElementById('section-8');
  const countdownNumber = document.getElementById('countdownNumber');
  const countdownLabel = document.getElementById('countdownLabel');
  const candleFlame = document.getElementById('candleFlame');
  const flameGlow = document.getElementById('flameGlow');
  const candleSmoke = document.getElementById('candleSmoke');
  const birthdayRevealMessage = document.getElementById('birthdayRevealMessage');
  
  // Target the new floating button elements
  const newWishBtn = document.getElementById('newWishBtn');
  const wishOverlayContainer = document.getElementById('wishOverlayContainer');

  let countdownInterval = null;
  let isCountingDown = false;
  let hasCompleted = false;

  // Direct Button Navigation from Section 7
  if (directToCakeBtn) {
    directToCakeBtn.addEventListener('click', () => {
      section8.scrollIntoView({ behavior: 'smooth' });
      startCountdown();
    });
  }

  // Auto start countdown when Section 8 comes into view
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCompleted && !isCountingDown) {
        setTimeout(() => {
          if (!hasCompleted && !isCountingDown) {
            startCountdown();
          }
        }, 800);
      }
    });
  }, { threshold: 0.4 });

  if (section8) {
    sectionObserver.observe(section8);
  }

  function resetState() {
    // 1. Instantly hide the button container when a restart begins
    if (wishOverlayContainer) {
      wishOverlayContainer.style.setProperty('display', 'none', 'important');
    }

    // Cancel any running countdown
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    isCountingDown = false;
    hasCompleted = false;

    // Restore countdown UI
    const countdownContainer = document.getElementById('countdownContainer');
    if (countdownContainer) countdownContainer.classList.remove('hide-countdown');
    countdownLabel.innerText = "Make a wish... candle blowing out in";
    countdownNumber.innerText = "3";

    // Restore cake/candle visuals
    if(candleFlame) candleFlame.classList.remove('extinguished');
    if(flameGlow) flameGlow.classList.remove('extinguished');
    if(candleSmoke) {
      candleSmoke.classList.remove('opacity-100');
      candleSmoke.classList.add('opacity-0');
    }

    const cakeWrapper = document.querySelector('.cake-wrapper');
    if (cakeWrapper) cakeWrapper.classList.remove('scale-75', 'md:scale-90');

    // Hide the reveal message cleanly
    if (birthdayRevealMessage) birthdayRevealMessage.classList.remove('show-reveal');
  }

  function startCountdown() {
    if (isCountingDown || hasCompleted) return;
    isCountingDown = true;

    // Keep floating button hidden while counting down
    if (wishOverlayContainer) {
      wishOverlayContainer.style.setProperty('display', 'none', 'important');
    }

    let count = 3;
    countdownNumber.innerText = count;
    countdownLabel.innerText = "Make a wish... candle blowing out in";

    countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.innerText = count;
        countdownNumber.classList.add('scale-125');
        setTimeout(() => countdownNumber.classList.remove('scale-125'), 200);
      } else if (count === 0) {
        countdownNumber.innerText = "0";
        countdownNumber.classList.add('scale-125');
        setTimeout(() => countdownNumber.classList.remove('scale-125'), 200);

        clearInterval(countdownInterval);
        countdownInterval = null;
        extinguishCandle();
      }
    }, 1000);
  }

  function extinguishCandle() {
    isCountingDown = false;
    hasCompleted = true;

    // 1. Extinguish flame & ambient glow
    if(candleFlame) candleFlame.classList.add('extinguished');
    if(flameGlow) flameGlow.classList.add('extinguished');

    // 2. Trigger rising smoke effect
    if(candleSmoke) {
      candleSmoke.classList.remove('opacity-0');
      candleSmoke.classList.add('opacity-100');
    }

    // 3. Heart & Sparkle burst celebration cannons around cake
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 50;

    if (typeof createHeartBurst === "function") {
      createHeartBurst(centerX, centerY);
      setTimeout(() => createHeartBurst(centerX - 120, centerY + 40), 200);
      setTimeout(() => createHeartBurst(centerX + 120, centerY + 40), 400);
    }

    // 4. Update Countdown badge to completion message
    setTimeout(() => {
      countdownLabel.innerText = "Wish Granted! ✨";
      countdownNumber.innerText = "🎉";
      countdownNumber.classList.remove('animate-pulse');
    }, 600);

    // 5. Grand reveal of message box & slow fade-in of the interactive "Make Another Wish" button
    setTimeout(() => {
      if (birthdayRevealMessage) birthdayRevealMessage.classList.add('show-reveal');
      const countdownContainer = document.getElementById('countdownContainer');
      if (countdownContainer) countdownContainer.classList.add('hide-countdown');
      const cakeWrapper = document.querySelector('.cake-wrapper');
      if (cakeWrapper) cakeWrapper.classList.add('scale-75', 'md:scale-90');

      // REVEAL BUTTON OVERLAY HERE: Exactly when the countdown finishes and messages show!
      if (wishOverlayContainer) {
        wishOverlayContainer.style.setProperty('display', 'flex', 'important');
      }
    }, 1900);
  }

  // Hook the new floating button listener inside the state system
  if (newWishBtn) {
    newWishBtn.addEventListener('click', () => {
      resetState();
      setTimeout(() => startCountdown(), 600);
    });
  }
}
