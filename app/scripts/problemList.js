const ext = global.browser || global.chrome;

const problemLinks = document.querySelectorAll('td > a[href^="/problem"]');
if (problemLinks !== undefined && problemLinks.length > 0) {
  ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
    for (const problemLink of problemLinks) {
      const href = problemLink.href.split('/');
      const id = +href[href.length - 1];
      if (id in index) {
        const cell = problemLink.parentElement.nextElementSibling;
        const globe = document.createElement('span');
        cell.appendChild(globe);
        globe.classList.add('problem-label');
        globe.classList.add('problem-label-pac');
        globe.append(ext.i18n.getMessage('userTranslated'));
      }
    }
  });
}
