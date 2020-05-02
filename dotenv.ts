import { compact, difference, trim } from "./util.ts";

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
  return rawDotenv.split("\n").reduce((acc: any, line) => {
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
  const o: Required<ConfigOptions> = Object.assign(
    {
      path: `${Deno.cwd()}/.env`,
      export: false,
      safe: false,
      example: `${Deno.cwd()}/.env.example`,
      allowEmptyValues: false,
    },
    options,
  );

  const conf = parseFile(o.path);

  if (o.safe) {
    const confExample = parseFile(o.example);
    assertSafe(conf, confExample, o.allowEmptyValues);
  }

  if (o.export) {
    for (let key in conf) {
      Deno.env.set(key, conf[key]);
    }
  }

  return conf;
}

function parseFile(filepath: string) {
  return parse(new TextDecoder("utf-8").decode(Deno.readFileSync(filepath)));
}

function isVariableStart(str: string): boolean {
  return /^[a-zA-Z_]*=/.test(str);
}

function cleanQuotes(value: string = ""): string {
  return value.replace(/^['"]([\s\S]*)['"]$/gm, "$1");
}

function expandNewlines(str: string): string {
  return str.replace("\\n", "\n");
}

function assertSafe(
  conf: DotenvConfig,
  confExample: DotenvConfig,
  allowEmptyValues: boolean,
) {
  const currentEnv = Deno.env.toObject();

  // Not all the variables have to be defined in .env, they can be supplied externally
  const confWithEnv = Object.assign({}, currentEnv, conf);

  const missing = difference(
    Object.keys(confExample),
    // If allowEmptyValues is false, filter out empty values from configuration
    Object.keys(allowEmptyValues ? confWithEnv : compact(confWithEnv)),
  );

  if (missing.length > 0) {
    const errorMessages = [
      `The following variables were defined in the example file but are not present in the environment:\n  ${
        missing.join(
          ", ",
        )
      }`,
      `Make sure to add them to your env file.`,
      !allowEmptyValues &&
      `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`,
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
