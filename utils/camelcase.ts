export function CamelCase(fileName: string): string {
  return fileName.replace(/(^\w)/, (match) => match.toUpperCase());
}

export function camelCase(fileName: string): string {
  return fileName.replace(/(^\w)/, (match) => match.toLowerCase());
}

export function camelcase(fileName: string): string {
  return fileName.toLowerCase();
}

export function CAMELCASE(fileName: string): string {
  return fileName.toUpperCase();
}
