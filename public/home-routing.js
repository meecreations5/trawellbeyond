/**
 * TrawellBeyond V5.1: preserve the approved homepage motion while linking
 * all Singapore discovery paths to the new destination and journey pages.
 * Other destination and package selections remain design-prototype panels.
 */
document.addEventListener('click', function (event) {
  const target = event.target.closest('[data-destination="Singapore"], [data-package="singapore"]');
  if (!target || target.hasAttribute('data-destination-slug') || target.hasAttribute('data-journey-slug')) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  const isPackage = target.hasAttribute('data-package');
  const isCustomizeAction = isPackage && Boolean(target.closest('.journey-card-bottom'));
  const destination = isPackage
    ? 'singapore-journey.html' + (isCustomizeAction ? '#personalize' : '')
    : 'singapore.html';

  window.location.assign(destination);
}, true);
