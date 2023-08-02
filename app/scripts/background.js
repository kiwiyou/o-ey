const ext = global.browser || global.chrome;

ext.runtime.onInstalled.addListener(() => {
  ext.storage.local.get(['tr-repos'], (result) => {
    if (!('tr-repos' in result)) {
      ext.storage.local.set({
        'tr-repos': [
          'https://raw.githubusercontent.com/kiwiyou/boj-user-translation/main',
        ],
      });
    }
  });
});

const getRepos = () =>
  new Promise((resolve) =>
    ext.storage.local.get(['tr-repos'], (result) => {
      resolve(result['tr-repos']);
    })
  );

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.query === 'getIndex') {
    (async () => {
      const repos = await getRepos();
      const reqs = await Promise.all(
        repos.map(async (repo) => {
          const url = `${repo}/index`;
          return await (await fetch(url)).json();
        })
      );
      const index = reqs.reduce((p, c) => {
        for (const key in c) {
          if (p[key]) {
            p[key] = [
              ...p[key],
              ...c[key].filter((tr) => !p[key].includes(tr)),
            ];
          } else {
            p[key] = c[key];
          }
        }
        return p;
      });
      sendResponse(index);
    })();
  } else if (request.query === 'getContent') {
    (async () => {
      const repos = await getRepos();
      const reqs = repos.map(async (repo) => {
        const url = `${repo}${request.path}`;
        const res = await fetch(url);
        if (res.status !== 200) {
          throw res.status;
        }
        return await res.text();
      });
      for (const req of reqs) {
        try {
          sendResponse(await req);
          break;
        } catch {}
      }
    })();
  }
  return true;
});
