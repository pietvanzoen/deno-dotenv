// deno-lint-ignore no-explicit-any
export function compact(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

export function difference(arrA: string[], arrB: string[]): string[] {
  return arrA.filter((a) => arrB.indexOf(a) < 0);
}
