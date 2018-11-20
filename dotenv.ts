import { readFileSync, env, cwd } from "deno";

export interface DotenvConfig {
  [key: string]: string;
}

export interface ConfigOptions {
  path?: string;
  export?: boolean;
  encoding?: string;
}

export function parse(rawDotenv: string): DotenvConfig {
  return rawDotenv.split("\n").reduce((acc, line) => {
    if (!isVariableStart(line)) return acc;
    let [key, ...vals] = line.split("=");
    let value = vals.join("=");
    if (/^"/.test(value)) {
      value = expandNewlines(value);
    }
    acc[key] = trim(cleanQuotes(value));
    return acc;
  }, {});
}

export function config(options: ConfigOptions = {}): DotenvConfig {
  const dotenv = new TextDecoder("utf-8").decode(
    readFileSync(options.path || `${cwd()}/.env`)
  );

  const conf = parse(dotenv);

  if (options.export) {
    const currentEnv = env();
    for (let key in conf) {
      currentEnv[key] = conf[key];
    }
  }

  return conf;
}

function isVariableStart(str: string): boolean {
  return /^[a-zA-Z_]*=/.test(str);
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
