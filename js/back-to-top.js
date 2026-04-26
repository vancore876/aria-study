// Back to top button functionality
const backToTopButton = document.createElement('button');
backToTopButton.textContent = '↑';
backToTopButton.style.position = 'fixed';
backToTopButton.style.bottom = '2rem';
backToTopButton.style.right = '2rem';
backToTopButton.style.display = 'none';
backToTopButton.style.padding = '1rem 1.5rem';
backToTopButton.style.backgroundColor = 'var(--color-accent)';
backToTopButton.style.color = 'var(--color-surface)';
backToTopButton.style.border = 'none';
backToTopButton.style.borderRadius = '8px';
backToTopButton.style.fontSize = '1.2rem';
backToTopButton.style.cursor = 'pointer';
backToTopButton.style.zIndex = '1000';
backToTopButton.style.transition = 'all 0.3s ease';
backToTopButton.style.boxShadow = 'var(--shadow)';
backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
document.body.appendChild(backToTopButton);

// Show/hide based on scroll position
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTopButton.style.display = 'block';
    backToTopButton.style.opacity = '1';
  } else {
    backToTopButton.style.display = 'none';
    backToTopButton.style.opacity = '0';
  }
});
