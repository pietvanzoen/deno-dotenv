const RE = {
  EMPTY_LINES: /^\n/g,
  COMMENTS: /^#.*/g
};

interface Config {
  [key: string]: string | number;
}

export function parse(rawDotenv: string): Config {
  const config: Config = rawDotenv.split("\n").reduce((acc, line) => {
    if (!isVariable(line)) return acc;
    let [key, ...vals] = line.split("=");
    let value = vals.join("=");
    if (/^"/.test(value)) {
      value = expandNewlines(value);
    }
    acc[key] = trim(cleanQuotes(value));
    return acc;
  }, {});

  return config;
}

function isVariable(str: string): boolean {
  return /^[a-zA-Z_]*=/.test(str);
}

function clean(dotenv: string): string {
  return dotenv.replace(RE.EMPTY_LINES, "").replace(RE.COMMENTS, "");
}

function cleanQuotes(value: string = ""): string {
  return value.replace(/^['"]([\s\S]*)['"]$/g, "$1");
}

function trim(val: any): any {
  if (typeof val !== "string") return val;
  return val.trim();
}

function expandNewlines(str: string): string {
  return str.replace("\\n", "\n");
}
