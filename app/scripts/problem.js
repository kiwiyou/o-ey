const ext = global.browser || global.chrome;

const LANG_NAME = {
  Korean: ext.i18n.getMessage('ko_KR'),
  ko_KR: ext.i18n.getMessage('ko_KR'),
  English: ext.i18n.getMessage('en_US'),
  en_US: ext.i18n.getMessage('en_US'),
  ja_JP: ext.i18n.getMessage('ja_JP'),
  Original: ext.i18n.getMessage('original'),
};

const HEADLINE = {
  Korean: {
    description: '문제',
    input: '입력',
    output: '출력',
    hint: '힌트',
    limit: '제한',
  },
  English: {
    description: 'Statement',
    input: 'Input',
    output: 'Output',
    hint: 'Hint',
    limit: 'Constraints',
  },
};

init();

function init() {
  const typeset = document.createElement('button');
  typeset.setAttribute('onclick', 'MathJax.typeset();');
  typeset.style['display'] = 'hidden';
  document.body.appendChild(typeset);
  const regex = /\/problem\/(\d+).*/;
  if (!regex.test(location.pathname)) {
    return;
  }
  const id = +location.pathname.split('/')[2];
  ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
    let bojTranslations = {};
    let translations = index[id];
    if (translations !== undefined && translations.length > 0) {
      const header = document.getElementById('problem_title').parentElement;
      if (!translations.every((tr) => tr.endsWith('-typo'))) {
        const globe = document.createElement('span');
        globe.classList.add('problem-label');
        globe.classList.add('problem-label-tr');
        globe.append(ext.i18n.getMessage('userTranslated'));
        header.appendChild(globe);
        while (globe.previousSibling.nodeType === Node.TEXT_NODE) {
          globe.previousSibling.remove();
        }
      }
      const langBase64 = document.getElementById('problem-lang-base64');
      let defaultLang = null;
      if (langBase64) {
        for (const lang of JSON.parse(atob(langBase64.textContent))) {
          if (defaultLang === null) {
            defaultLang = lang.problem_lang_tcode;
          }
          bojTranslations[lang.problem_lang_tcode] = lang;
        }
        translations = [
          ...Object.keys(bojTranslations).map((name) => name + '-BOJ'),
          ...translations,
        ];
      }
      const btnGroup = header.getElementsByClassName('btn-group')[0];
      header.appendChild(btnGroup);
      let selectButton = document.getElementById('lang-select-button');
      if (selectButton) {
        const dropdownMenu = selectButton.nextElementSibling;
        selectButton.remove();
        dropdownMenu.remove();
      }
      const buttonGroup = document.querySelector('.problem-button');
      selectButton = document.createElement('button');
      buttonGroup.appendChild(selectButton);
      selectButton.addEventListener('click', () => buttonGroup);
      selectButton.classList.add('btn', 'btn-default', 'dropdown-toggle');
      selectButton.setAttribute('data-toggle', 'dropdown');
      selectButton.setAttribute('href', '#');
      selectButton.innerHTML = `<span class="lang-select-text">${ext.i18n.getMessage(
        'language'
      )}</span>&nbsp;<span class="caret"></span>`;
      const dropdown = document.createElement('ul');
      buttonGroup.appendChild(dropdown);
      dropdown.classList.add('dropdown-menu');
      const langLabel = selectButton.firstElementChild;

      if (Object.keys(bojTranslations).length === 0) {
        const original = {};
        original.title = document.getElementById('problem_title').innerHTML;
        Array.prototype.forEach.call(
          document.getElementsByClassName('problem-section'),
          (section) => {
            original[section.getAttribute('id')] = section.innerHTML;
          }
        );
        defaultLang = 'Original';
        bojTranslations['Original'] = original;
        translations = ['Original-BOJ', ...translations];
      }
      if (
        defaultLang !== null &&
        translations.includes(`${defaultLang}-typo`)
      ) {
        ext.runtime.sendMessage(
          { query: 'getContent', path: `/src/${id}/${defaultLang}-typo.html` },
          (content) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, 'text/html').body;
            const tr = {};
            for (const section of dom.children) {
              tr[section.id] = section.innerHTML;
            }
            applyTranslation(tr);
            typeset.click();
          }
        );
      }

      translations.forEach((translation) => {
        const [lang, author] = translation.split('-', 2);
        if (author === 'typo') {
          bojTranslations[lang] = null;
          return;
        }
        const li = document.createElement('li');
        dropdown.appendChild(li);
        const option = document.createElement('a');
        li.appendChild(option);
        option.classList.add('language-select-link');
        option.href = '#';
        option.setAttribute('data-language-id', translation);
        const label = document.createElement('span');
        option.appendChild(label);
        label.classList.add('lang-text');
        const labelText = `${LANG_NAME[lang]} (${author})`;
        label.append(labelText);

        if (author === 'BOJ') {
          li.addEventListener('click', () => {
            langLabel.textContent = labelText;
            if (bojTranslations[lang] === null) {
              ext.runtime.sendMessage(
                { query: 'getContent', path: `/src/${id}/${lang}-typo.html` },
                (content) => {
                  const parser = new DOMParser();
                  const dom = parser.parseFromString(content, 'text/html').body;
                  const tr = {};
                  for (const section of dom.children) {
                    tr[section.id] = section.innerHTML;
                  }
                  applyTranslation(tr);
                  typeset.click();
                }
              );
            } else if (lang === 'Original') {
              applyTranslation(bojTranslations[lang]);
              typeset.click();
            } else {
              applyBOJTranslation(bojTranslations[lang], HEADLINE[lang]);
              typeset.click();
            }
          });
        } else {
          li.addEventListener('click', () => {
            langLabel.textContent = labelText;
            ext.runtime.sendMessage(
              { query: 'getContent', path: `/src/${id}/${translation}.html` },
              (content) => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(content, 'text/html').body;
                const tr = {};
                for (const section of dom.children) {
                  tr[section.id] = section.innerHTML;
                }
                applyTranslation(tr);
                typeset.click();
              }
            );
          });
        }
      });
    }
  });

  function applyTranslation(lang) {
    for (const key in lang) {
      if (lang[key].trim().length > 0) {
        if (key === 'title') {
          const title = document.getElementById('problem_title');
          title.innerHTML = lang['title'];
        } else {
          const element = document.getElementById(key);
          if (element) {
            element.innerHTML = lang[key];
          }
        }
      }
    }
  }

  function applyBOJTranslation(lang, headline) {
    for (const key in lang) {
      if (lang[key].trim().length > 0) {
        if (key === 'title') {
          const title = document.getElementById('problem_title');
          title.innerHTML = lang['title'];
        } else {
          const element = document.getElementById('problem_' + key);
          if (element) {
            console.log(element);
            if (element.previousElementSibling) {
              element.previousElementSibling.firstElementChild.textContent =
                headline[key] || 'N/A';
            }
            element.innerHTML = lang[key];
          }
        }
      }
    }
  }
}
