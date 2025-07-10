// Smoothly animate the aspect ratio (height/width) of the overlay mask
const mask = document.getElementById('overlayMask');
let latestScrollY = 0;
let ticking = false;

function updateMaskHeight() {
  if (!mask) return;
  const width = mask.offsetWidth;
  // Calculate scroll progress (0 at top, 1 at 15px scroll)
  const maxScroll = 15;
  const scrollY = Math.min(latestScrollY, maxScroll);
  // Use ease-in for slow start, fast end
  const rawProgress = scrollY / maxScroll;
  const progress = Math.pow(rawProgress, 2); // Ease-in
  // Interpolate aspect ratio from 16:2 (0.125) to 16:6 (0.375) for a 3x vertical scale
  const startRatio = 2/16; // 0.125
  const endRatio = 6/16;   // 0.375
  const currentRatio = startRatio + (endRatio - startRatio) * progress;
  const newHeight = width * currentRatio;
  mask.style.height = newHeight + 'px';
  ticking = false;
}

window.addEventListener('scroll', function() {
  latestScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateMaskHeight);
    ticking = true;
  }
});
// Run once on load
updateMaskHeight();

// Hamburger Menu Functionality
// Wrap in DOMContentLoaded to ensure elements exist
window.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const navContainer = document.getElementById('navContainer');
  const closeNav = document.getElementById('closeNav');

  if (hamburgerMenu && navContainer && closeNav) {
    // Toggle navigation
    function toggleNav() {
      navContainer.classList.toggle('open');
      hamburgerMenu.classList.toggle('active');
      // Prevent body scroll when nav is open
      if (navContainer.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    // Event listeners
    hamburgerMenu.addEventListener('click', toggleNav);
    closeNav.addEventListener('click', toggleNav);

    // Close nav when clicking outside
    document.addEventListener('click', function(event) {
      if (navContainer.classList.contains('open') && 
          !navContainer.contains(event.target) && 
          !hamburgerMenu.contains(event.target)) {
        toggleNav();
      }
    });

    // Close nav on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navContainer.classList.contains('open')) {
        toggleNav();
      }
    });
  }
});

// Place this at the end of your script.js
const gridSpacing = 40; // matches your grid
const gridCountX = Math.floor(window.innerWidth / gridSpacing);
const gridCountY = Math.floor(window.innerHeight / gridSpacing);
const glowLine = document.querySelector('.glow-grid-line');
const glowLineH = document.querySelector('.glow-grid-line-horizontal');

function moveGlowLines() {
  // Vertical
  const randomCol = Math.floor(Math.random() * gridCountX);
  const left = randomCol * gridSpacing;
  if (glowLine) {
    glowLine.style.left = `${left}px`;
    glowLine.style.opacity = 1;
  }

  // Horizontal
  const gridOffset = -12; // or adjust if needed
  const randomRow = Math.floor(Math.random() * gridCountY);
  const top = randomRow * gridSpacing + gridOffset;
  if (glowLineH) {
    glowLineH.style.top = `${top}px`;
    glowLineH.style.opacity = 1;
  }
}

setInterval(moveGlowLines, 1200); // Move every 1.2 seconds
moveGlowLines(); 