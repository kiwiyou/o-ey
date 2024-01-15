const ext = global.browser || global.chrome;

export function getURL(lang) {
  return ext.extension.getURL(`/images/${lang}.svg`);
}
