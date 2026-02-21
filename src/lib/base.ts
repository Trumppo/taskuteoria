export const normalizedBase = (() => {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
})();

export const withBase = (path: string) =>
  new URL(path.replace(/^\//, ""), `https://taskuteoria.local${normalizedBase}`).pathname;
