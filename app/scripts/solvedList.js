import { getURL } from './emoji';
const ext = global.browser || global.chrome;

ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
  const appendLabel = (row) => {
    const idCell = row.querySelector('a[href]');
    if (!idCell) {
      return;
    }
    const id = idCell.querySelector('span').textContent;
    console.log(index, id);
    if (!(id in index) || index[id].every((tr) => tr.endsWith('-typo'))) {
      return;
    }
    const langs = [...new Set(index[id].map((tr) => tr.split('-')[0]))];
    const label = document.createElement('span');
    label.classList.add('problem-label-tr');
    label.append(
      ...langs.map((lang) => {
        const img = document.createElement('img');
        img.src = getURL(lang);
        return img;
      })
    );
    idCell.append('\u00A0', label);
  };
  const tableObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const row of record.addedNodes) {
        if (row.getElementsByClassName('problem-label-tr').length > 0) {
          continue;
        }
        try {
          appendLabel(row);
        } catch {}
      }
    }
  });
  const table = document.getElementsByTagName('tbody')[0];
  if (table) {
    for (const row of table.rows) {
      try {
        appendLabel(row);
      } catch {}
    }
    tableObserver.observe(table, {
      childList: true,
    });
  }
  const rootObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeName === 'DIV') {
          const table = node.getElementsByTagName('tbody')[0];
          if (table) {
            for (const row of table.rows) {
              try {
                appendLabel(row);
              } catch {}
            }
            tableObserver.observe(table, {
              childList: true,
            });
          }
        }
      }
    }
  });
  const root = document.getElementById('__next');
  rootObserver.observe(root, {
    childList: true,
  });
});
