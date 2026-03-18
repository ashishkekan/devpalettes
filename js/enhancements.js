/**
 * Visual Enhancement Scripts
 * Devpaletteshub.com
 * Common animations: Visualizer, Particles, Scroll Animations, Parallax
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Hero Canvas Visualizer (Waves)
   */
  function initHeroVisualizer() {
    const canvas = document.getElementById('hero-visualizer');
    if (!canvas || prefersReducedMotion) return;
    
    const ctx = canvas.getContext('2d');
    let time = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const waves = [
      { y: 0.3, amplitude: 50, frequency: 0.01, speed: 0.02, color: 'rgba(16, 185, 129, 0.15)' },
      { y: 0.5, amplitude: 40, frequency: 0.015, speed: 0.025, color: 'rgba(6, 182, 212, 0.12)' },
      { y: 0.7, amplitude: 60, frequency: 0.008, speed: 0.018, color: 'rgba(139, 92, 246, 0.1)' }
    ];

    function drawWave(wave, t) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 3) {
        const y = canvas.height * wave.y + Math.sin(x * wave.frequency + t * wave.speed) * wave.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waves.forEach(wave => drawWave(wave, time));
      time++;
      requestAnimationFrame(animate);
    }
    animate();
  }

  /**
   * Floating Particles
   */
  function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container || prefersReducedMotion) return;

    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f97316', '#ec4899'];
    
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${colors[i % 5]};
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 15 + 20}s;
        animation-delay: ${Math.random() * 10}s;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;
      container.appendChild(p);
    }
  }

  /**
   * Scroll Reveal Animations
   */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }

  /**
   * Parallax Effect on Blobs
   */
  function initParallaxBlobs() {
    if (prefersReducedMotion) return;
    
    const blobs = document.querySelectorAll('.gradient-blob');
    
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      blobs.forEach((blob, i) => {
        const factor = (i + 1) * 0.5;
        blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  /**
   * Initialize All Enhancements
   */
  function init() {
    initHeroVisualizer();
    initParticles();
    initScrollAnimations();
    initParallaxBlobs();
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
