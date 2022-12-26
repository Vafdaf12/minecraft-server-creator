import { Choice } from "prompts";

export const repeatStr = (str: string, n: number) => new Array(n + 1).join(str);

/**
 * Converts a value into a choice with
 * the same value as title
 * @param value The value to convert
 * @returns The prompts-compatible choice
 */
export const choiceFromValue = (value: string): Choice => ({
  value,
  title: value
});

export function formatQuery(url: string, query: any) {
  const queries = Object.entries(query)
    .map(v => `${v[0]}=${v[1]}`)
    .join("&");
  return `${url}?${queries}`;
}
