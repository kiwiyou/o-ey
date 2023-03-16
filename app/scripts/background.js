const REPO =
  'https://raw.githubusercontent.com/kiwiyou/boj-user-translation/main';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.query === 'getJson') {
    const url = `${REPO}` + request.url;
    fetch(url)
      .then((r) => r.json())
      .then((r) => sendResponse(r))
      .catch();
    return true;
  }
});
