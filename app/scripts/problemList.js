import { getURL } from './emoji';
const ext = global.browser || global.chrome;

const problemLinks = document.querySelectorAll('td > a[href^="/problem"]');
if (problemLinks !== undefined && problemLinks.length > 0) {
  ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
    for (const problemLink of problemLinks) {
      const href = problemLink.href.split('/');
      const id = +href[href.length - 1];
      if (id in index && !index[id].every((tr) => tr.endsWith('-typo'))) {
        const cell = problemLink.parentElement.nextElementSibling;
        const langs = [...new Set(index[id].map((tr) => tr.split('-')[0]))];
        const label = document.createElement('span');
        label.classList.add('problem-label');
        label.classList.add('problem-label-tr');
        label.append(
          ...langs.map((lang) => {
            const img = document.createElement('img');
            img.src = getURL(lang);
            return img;
          })
        );
        cell.lastElementChild.after(label);
      }
    }
  });
}
