// Search functionality
const searchInput = document.getElementById('searchInput');
const docsGrid = document.getElementById('docsGrid');
const docCards = document.querySelectorAll('.doc-card');
const searchStats = document.getElementById('searchStats');
const noResults = document.getElementById('noResults');

function filterDocs() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;
  let totalCount = docCards.length;

  docCards.forEach(card => {
    const keywords = card.getAttribute('data-keywords').toLowerCase();
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    const tags = Array.from(card.querySelectorAll('.doc-tag')).map(tag => tag.textContent.toLowerCase());

    const isMatch = searchTerm === '' || 
      keywords.includes(searchTerm) ||
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      tags.some(tag => tag.includes(searchTerm));

    if (isMatch) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Update search stats
  if (searchTerm === '') {
    searchStats.textContent = `Showing all ${totalCount} topics`;
    noResults.style.display = 'none';
  } else {
    searchStats.textContent = `Found ${visibleCount} of ${totalCount} topics`;
    
    if (visibleCount === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  }
}

// Add event listener for search input
searchInput.addEventListener('input', filterDocs);

// Initialize search stats
filterDocs();

// Add click event to doc-cards to open URLs
docCards.forEach(card => {
  card.addEventListener('click', function(e) {
    // Prevent click if selecting text
    if (window.getSelection().toString()) return;
    const url = card.getAttribute('data-url');
    if (url) {
      window.open(url, '_blank');
    }
  });
}); 