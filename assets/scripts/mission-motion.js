(() => {
  const word = document.querySelector('.mission-word');
  if (!word) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canClipText =
    CSS.supports('background-clip', 'text') ||
    CSS.supports('-webkit-background-clip', 'text');
  if (reducedMotion.matches || !canClipText || !('IntersectionObserver' in window)) return;

  let observer;
  const complete = () => {
    observer?.disconnect();
    word.classList.remove('is-wipe-ready', 'is-wipe-playing');
    word.classList.add('is-wipe-complete');
    reducedMotion.removeEventListener('change', onPreferenceChange);
  };
  const onPreferenceChange = event => {
    if (event.matches) complete();
  };

  word.classList.add('is-wipe-ready');
  word.addEventListener(
    'animationend',
    event => {
      if (event.animationName === 'mission-word-fill') complete();
    },
    { once: true }
  );
  reducedMotion.addEventListener('change', onPreferenceChange);

  observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .8)) {
        observer.disconnect();
        word.classList.add('is-wipe-playing');
      }
    },
    { threshold: .8, rootMargin: '0px 0px -64px 0px' }
  );
  observer.observe(word);
})();
