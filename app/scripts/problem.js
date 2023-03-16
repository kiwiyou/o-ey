const LANG_NAME = {
  Korean: '한국어',
  ko_KR: '한국어',
  English: 'English',
  ja_JP: '日本語',
};

const HEADLINE = {
  Korean: {
    description: '문제',
    input: '입력',
    output: '출력',
    hint: '힌트',
  },
  English: {
    description: 'Statement',
    input: 'Input',
    output: 'Output',
    hint: 'Hint',
  },
};

let i = setInterval(() => {
  if (window.MathJax !== undefined) {
    clearInterval(i);
    console.log('ok');
    init();
  }
}, 100);

function init() {
  const runtime = (global.browser || global.chrome).runtime;
  const id = +location.pathname.split('/')[2];
  runtime.sendMessage({ query: 'getJson', url: '/index' }, (index) => {
    let bojTranslations = {};
    let translations = index[id];
    if (translations !== undefined && translations.length > 0) {
      const langBase64 = document.getElementById('problem-lang-base64');
      if (langBase64) {
        for (const lang of JSON.parse(atob(langBase64.textContent))) {
          bojTranslations[lang.problem_lang_tcode] = lang;
        }
        translations = [
          ...Object.keys(bojTranslations).map((name) => name + '-baekjoon'),
          ...translations,
        ];
      }

      let selectButton = document.getElementById('lang-select-button');
      if (selectButton) {
        selectButton.remove();
      }
      const buttonGroup = document.querySelector('.problem-button');
      selectButton = document.createElement('button');
      buttonGroup.appendChild(selectButton);
      selectButton.addEventListener('click', () => buttonGroup);
      selectButton.classList.add('btn', 'btn-default', 'dropdown-toggle');
      selectButton.setAttribute('data-toggle', 'dropdown');
      selectButton.setAttribute('href', '#');
      selectButton.innerHTML = `<span class="lang-select-text">언어</span>&nbsp;<span class="caret"></span>`;
      dropdown = document.createElement('ul');
      buttonGroup.appendChild(dropdown);
      dropdown.classList.add('dropdown-menu');
      const langLabel = selectButton.firstElementChild;

      translations.forEach((translation) => {
        const li = document.createElement('li');
        dropdown.appendChild(li);
        const option = document.createElement('a');
        li.appendChild(option);
        option.classList.add('language-select-link');
        option.href = '#';
        option.setAttribute('data-language-id', translation);
        const [lang, author] = translation.split('-', 2);
        const label = document.createElement('span');
        option.appendChild(label);
        label.classList.add('lang-text');
        const labelText = `${LANG_NAME[lang]} (${author})`;
        label.append(labelText);

        if (author === 'baekjoon') {
          li.addEventListener('click', () => {
            langLabel.textContent = labelText;
            applyBOJTranslation(bojTranslations[lang], HEADLINE[lang]);
            window.MathJax.typeset();
          });
        } else {
          li.addEventListener('click', () => {
            langLabel.textContent = labelText;
            runtime.sendMessage(
              { query: 'getJson', url: `/src/${id}/${translation}.json` },
              (tr) => {
                applyTranslation(tr);
                window.MathJax.typeset();
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
          title.textContent = lang['title'];
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
          title.textContent = lang['title'];
        } else {
          const element = document.getElementById('problem_' + key);
          if (element) {
            element.previousElementSibling.firstElementChild.textContent =
              headline[key] || 'N/A';
            element.innerHTML = lang[key];
          }
        }
      }
    }
  }
}
