import { readFileSync, env, cwd } from "deno";
import { compact, difference, trim } from "util.ts";

export interface DotenvConfig {
  [key: string]: string;
}

export interface ConfigOptions {
  path?: string;
  export?: boolean;
  safe?: boolean;
  example?: string;
  allowEmptyValues?: boolean;
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
  const o: ConfigOptions = Object.assign(
    {
      path: `${cwd()}/.env`,
      export: false,
      safe: false,
      example: `${cwd()}/.env.example`,
      allowEmptyValues: false
    },
    options
  );

  const conf = parseFile(o.path);

  if (o.safe) {
    const confExample = parseFile(o.example);
    assertSafe(conf, confExample, o.allowEmptyValues);
  }

  if (o.export) {
    const currentEnv = env();
    for (let key in conf) {
      currentEnv[key] = conf[key];
    }
  }

  return conf;
}

function parseFile(filepath) {
  return parse(new TextDecoder("utf-8").decode(readFileSync(filepath)));
}

function isVariableStart(str: string): boolean {
  return /^[a-zA-Z_]*=/.test(str);
}

function cleanQuotes(value: string = ""): string {
  return value.replace(/^['"]([\s\S]*)['"]$/g, "$1");
}

function expandNewlines(str: string): string {
  return str.replace("\\n", "\n");
}

function assertSafe(conf, confExample, allowEmptyValues) {
  const currentEnv = env();

  // Not all the variables have to be defined in .env, they can be supplied externally
  const confWithEnv = Object.assign({}, currentEnv, conf);

  const missing = difference(
    Object.keys(confExample),
    // If allowEmptyValues is false, filter out empty values from configuration
    Object.keys(allowEmptyValues ? confWithEnv : compact(confWithEnv))
  );

  if (missing.length > 0) {
    const errorMessages = [
      `The following variables were defined in the example file but are not present in the environment:\n  ${missing.join(
        ", "
      )}`,
      `Make sure to add them to your env file.`,
      !allowEmptyValues &&
        `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
    ];

    throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"));
  }
}

export class MissingEnvVarsError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "MissingEnvVarsError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
