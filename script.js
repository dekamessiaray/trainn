const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const revealTargets = document.querySelectorAll('.section, .stats, .connect');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(target => {
    target.classList.add('reveal');
    observer.observe(target);
  });
}
