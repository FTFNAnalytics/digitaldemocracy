/** ASCII fold used only to propose a crosswalk match. It does not rename a place. */
export function foldName(value: string): string {
  const stripped = value.normalize("NFD").replace(/\p{M}/gu, "");
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function levenshtein(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;
  const previous = new Array<number>(right.length + 1);
  const current = new Array<number>(right.length + 1);
  for (let column = 0; column <= right.length; column += 1) previous[column] = column;
  for (let row = 1; row <= left.length; row += 1) {
    current[0] = row;
    const leftChar = left.charCodeAt(row - 1);
    for (let column = 1; column <= right.length; column += 1) {
      const cost = leftChar === right.charCodeAt(column - 1) ? 0 : 1;
      const insert = current[column - 1]! + 1;
      const remove = previous[column]! + 1;
      const replace = previous[column - 1]! + cost;
      current[column] = Math.min(insert, remove, replace);
    }
    for (let column = 0; column <= right.length; column += 1) previous[column] = current[column]!;
  }
  return previous[right.length]!;
}
