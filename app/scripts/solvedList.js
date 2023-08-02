const ext = global.browser || global.chrome;

ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
  const appendLabel = (row) => {
    const id = row.cells[0].querySelector('a span').textContent;
    if (!(id in index) || index[id].every((tr) => tr.endsWith("-typo"))) {
      return;
    }
    let last = row.cells[1].getElementsByTagName('a')[0];
    while (last.nextElementSibling) {
      last = last.nextElementSibling;
    }
    const label = document.createElement('span');
    last.after(label);
    label.before('\u00A0');
    label.classList.add('problem-label-tr');
    label.append(ext.i18n.getMessage('userTranslated'));
  };
  const tableObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const row of record.addedNodes) {
        if (
          row.getElementsByClassName('problem-label-tr').length >
          0
        ) {
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
