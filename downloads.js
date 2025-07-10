// Carousel functionality
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const slides = document.querySelectorAll('.carousel-slide');

let currentIndex = 0;
const slideWidth = 320; // 300px + 20px gap
const slidesPerView = Math.floor(carouselTrack.offsetWidth / slideWidth);
const maxIndex = Math.max(0, slides.length - slidesPerView);

// Generate dots dynamically based on content
function generateDots() {
  carouselDots.innerHTML = '';
  const totalDots = Math.ceil(slides.length / slidesPerView);
  
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    if (i === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      currentIndex = i * slidesPerView;
      updateCarousel();
    });
    
    carouselDots.appendChild(dot);
  }
}

function updateCarousel() {
  carouselTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  
  // Update dots
  const dots = document.querySelectorAll('.carousel-dot');
  const currentDotIndex = Math.floor(currentIndex / slidesPerView);
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentDotIndex);
  });
}

function nextSlide() {
  if (currentIndex < maxIndex) {
    currentIndex += slidesPerView;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    updateCarousel();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex -= slidesPerView;
    if (currentIndex < 0) currentIndex = 0;
    updateCarousel();
  }
}

// Initialize dots
generateDots();

// Category filtering
const categoryTabs = document.querySelectorAll('.category-tab');
const carouselSlides = document.querySelectorAll('.carousel-slide');

categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs
    categoryTabs.forEach(t => t.classList.remove('active'));
    // Add active class to clicked tab
    tab.classList.add('active');

    const selectedCategory = tab.dataset.category;

    carouselSlides.forEach(slide => {
      if (selectedCategory === 'all' || slide.dataset.category === selectedCategory) {
        slide.style.display = 'block';
      } else {
        slide.style.display = 'none';
      }
    });

    // Reset carousel position and regenerate dots
    currentIndex = 0;
    generateDots();
    updateCarousel();
  });
});

// Initialize carousel
updateCarousel();

// Navigation menu functionality
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navContainer = document.getElementById('navContainer');
const closeNav = document.getElementById('closeNav');
const overlayMask = document.getElementById('overlayMask');

function updateNavButtons() {
  if (navContainer.classList.contains('open')) {
    hamburgerMenu.classList.add('hidden');
    closeNav.classList.remove('hidden');
  } else {
    hamburgerMenu.classList.remove('hidden');
    closeNav.classList.add('hidden');
  }
}

// Initial state
updateNavButtons();

hamburgerMenu.addEventListener('click', () => {
  navContainer.classList.add('open');
  updateNavButtons();
});

closeNav.addEventListener('click', () => {
  navContainer.classList.remove('open');
  updateNavButtons();
});

document.addEventListener('click', (e) => {
  if (!navContainer.contains(e.target) && !hamburgerMenu.contains(e.target)) {
    navContainer.classList.remove('open');
    updateNavButtons();
  }
});

// Download button functionality
// document.querySelectorAll('.download-btn').forEach(btn => {
//   btn.addEventListener('click', (e) => {
//     e.preventDefault();
//     const slide = btn.closest('.carousel-slide');
//     const title = slide.querySelector('.download-title').textContent;
//     const version = slide.querySelector('.download-version').textContent;
    
//     // Simulate download (you can replace this with actual download logic)
//     console.log(`Downloading ${title} ${version}`);
//     alert(`Download started for ${title} ${version}`);
//   });
// }); 

// Animated grid lines (from script.js)
const gridSpacing = 40; // matches your grid
const gridCountX = Math.floor(window.innerWidth / gridSpacing);
const gridCountY = Math.floor(window.innerHeight / gridSpacing);
const glowLine = document.querySelector('.glow-grid-line');
const glowLineH = document.querySelector('.glow-grid-line-horizontal');

function moveGlowLines() {
  // Vertical
  const randomCol = Math.floor(Math.random() * gridCountX);
  const left = randomCol * gridSpacing;
  glowLine.style.left = `${left}px`;
  glowLine.style.opacity = 1;

  // Horizontal
  const gridOffset = -12; // or adjust if needed
  const randomRow = Math.floor(Math.random() * gridCountY);
  const top = randomRow * gridSpacing + gridOffset;
  glowLineH.style.top = `${top}px`;
  glowLineH.style.opacity = 1;
}

setInterval(moveGlowLines, 1200); // Move every 1.2 seconds
moveGlowLines(); 