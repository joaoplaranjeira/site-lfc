(function () {
  function initEcosystem() {
    const ecosystem = document.querySelector('[data-ecosystem]');
    const detail = ecosystem?.querySelector('[data-ecosystem-detail]');
    const nodes = Array.from(ecosystem?.querySelectorAll('[data-ecosystem-copy]') || []);
    if (!ecosystem || !detail || !nodes.length) return;

    nodes.forEach((node) => {
      node.addEventListener('click', () => {
        nodes.forEach((item) => item.classList.toggle('active', item === node));
        detail.textContent = node.dataset.ecosystemCopy || '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initEcosystem);
}());
