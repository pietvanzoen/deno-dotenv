# Dotenv [![Build Status](https://travis-ci.com/pietvanzoen/deno-dotenv.svg?branch=master)](https://travis-ci.com/pietvanzoen/deno-dotenv)

Dotenv handling for deno.

## Usage

Setup a `.env` file in the root of your project.

```sh
# .env
GREETING=hello world
```

Then import the configuration using the `config` function.

```ts
// app.ts
import { config } from "https://deno.land/x/dotenv/dotenv.ts";

console.log(config());
```

Then run your app.

```
> deno app.ts
{ GREETING: "hello world" }
```

### Options

- `path?: string`: Optional path to `.env` file. Defaults to `./.env`.
- `export?: boolean`: Set to `true` to export all `.env` variables to the current processes environment. Variables are then accessable via [deno's `env` function](https://deno.land/typedoc/index.html#env). Defaults to `false`.

### Auto loading

`load.ts` automatically loads the local `.env` file on import and exports it to the process environment:

```sh
# .env
GREETING=hello world
```

```ts
// app.ts
import "https://deno.land/x/dotenv/load.ts";
import { env } from "deno";

console.log(env().GREETING);
```

```
> deno --allow-env app.ts
hello world
```

## Parsing Rules

The parsing engine currently supports the following rules:

- `BASIC=basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- lines beginning with `#` are treated as comments
- empty values become empty strings (`EMPTY=` becomes `{EMPTY: ''}`)
- single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- new lines are expanded if in double quotes (`MULTILINE="new\nline"` becomes

```
{MULTILINE: 'new
line'}
```

- inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)
- whitespace is removed from both ends of the value (see more on [`trim`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)) (`FOO=" some value "` becomes `{FOO: 'some value'}`)

## Contributing

Issues and pull requests welcome. Please run `make fmt` before commiting.

## Credit

- Inspired by the node module [`dotenv`](https://github.com/motdotla/dotenv).
