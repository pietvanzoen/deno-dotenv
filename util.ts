export function trim(val: string): string {
  return val.trim();
}

export function compact(obj: Object): Object {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key]) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

export function difference(arrA: string[], arrB: string[]): string[] {
  return arrA.filter(a => arrB.indexOf(a) < 0);
}
