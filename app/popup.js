const ext = global.browser || global.chrome;

const repos = document.getElementById('repos');
ext.storage.local.get(['tr-repos'], (result) => {
  const repoList = result['tr-repos'];
  repos.value = repoList.join('\n');
});

const save = document.getElementById('save');
save.addEventListener('click', () => {
  const repoList = repos.value.split('\n');
  ext.storage.local.set({
    'tr-repos': repoList,
  });
});
