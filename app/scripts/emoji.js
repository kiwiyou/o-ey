const ext = global.browser || global.chrome;

export function getURL(lang) {
  return ext.runtime.getURL(`/images/${lang}.svg`);
}
