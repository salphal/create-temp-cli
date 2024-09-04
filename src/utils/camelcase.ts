/**
 * CamelCase
 */
export function CamelCase(fileName: string): string {
  return fileName
    .split(/[-_\s]/)
    .map((v) => v.trim())
    .filter((v) => !!v)
    .map((v) => v.replace(/(^\w)/, (match) => match.toUpperCase()))
    .join('');
}

/**
 * camelCase
 */
export function camelCase(fileName: string): string {
  return fileName
    .split(/[-_\s]/)
    .map((v) => v.trim())
    .filter((v) => !!v)
    .map((v, i) =>
      v.replace(/(^\w)/, (match) => (i === 0 ? match.toLowerCase() : match.toUpperCase())),
    )
    .join('');
}

/**
 * camel-case
 */
export function camelcase(fileName: string): string {
  return fileName
    .split(/[-_\s]/)
    .map((v) => v.trim())
    .filter((v) => !!v)
    .map((v) => v.toLowerCase())
    .join('-');
}

/**
 * CAMEL_CASE
 */
export function CAMELCASE(fileName: string): string {
  return fileName
    .split(/[-_\s]/)
    .map((v) => v.trim())
    .filter((v) => !!v)
    .map((v) => v.toUpperCase())
    .join('_');
}

/**
 * CAMEL_CASE -> CC
 */
export function SHORTCAMELCASE(fileName: string): string {
  return fileName
    .split(/[-_\s]/)
    .map((v) => (v.length >= 1 ? v.slice(0, 1).toUpperCase() : ''))
    .join('');
}
