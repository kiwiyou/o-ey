const ext = global.browser || global.chrome;

const problemIds = document.querySelectorAll('.list_problem_id');
if (problemIds !== undefined && problemIds.length > 0) {
  ext.runtime.sendMessage({ query: 'getIndex' }, (index) => {
    for (const problemId of problemIds) {
      const id = +problemId.textContent;
      if (id in index) {
        const cell = problemId.nextElementSibling.nextElementSibling;
        const globe = document.createElement('span');
        cell.appendChild(globe);
        globe.classList.add('problem-label');
        globe.classList.add('problem-label-pac');
        globe.append('User Translated');
        tags[tags.length - 1].after(globe);
      }
    }
  });
}
