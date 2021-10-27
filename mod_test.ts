import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertThrows,
} from "./test_deps.ts";
import { config, MissingEnvVarsError, parse, stringify } from "./mod.ts";

Deno.test("parser", () => {
  const testDotenv = new TextDecoder("utf-8").decode(
    Deno.readFileSync("./.env.test"),
  );
  const config = parse(testDotenv);
  assertEquals(config.BASIC, "basic", "parses a basic variable");
  assertEquals(config.AFTER_EMPTY, "empty", "skips empty lines");
  assertEquals(config["#COMMENT"], undefined, "skips lines with comments");
  assertEquals(config.EMPTY_VALUE, "", "empty values are empty strings");

  assertEquals(
    config.QUOTED_SINGLE,
    "single quoted",
    "single quotes are escaped",
  );

  assertEquals(
    config.QUOTED_DOUBLE,
    "double quoted",
    "double quotes are escaped",
  );

  assertEquals(
    config.MULTILINE,
    "hello\nworld",
    "new lines are expanded in double quotes",
  );

  assertEquals(
    JSON.parse(config.JSON).foo,
    "bar",
    "inner quotes are maintained",
  );

  assertEquals(
    config.WHITESPACE,
    "    whitespace   ",
    "whitespace in single-quoted values is preserved",
  );

  assertEquals(
    config.WHITESPACE_DOUBLE,
    "    whitespace   ",
    "whitespace in double-quoted values is preserved",
  );

  assertEquals(
    config.MULTILINE_SINGLE_QUOTE,
    "hello\\nworld",
    "new lines are escaped in single quotes",
  );

  assertEquals(config.EQUALS, "equ==als", "handles equals inside string");

  assertEquals(
    config.VAR_WITH_SPACE,
    "var with space",
    "variables defined with spaces are parsed",
  );

  assertEquals(
    config.VAR_WITH_ENDING_WHITESPACE,
    "value",
    "variables defined with ending whitespace are trimmed",
  );

  assertEquals(
    config.V4R_W1TH_NUM8ER5,
    "var with numbers",
    "accepts variables containing number",
  );

  assertEquals(
    config["1INVALID"],
    undefined,
    "variables beginning with a number are not parsed",
  );

  assertEquals(
    config.INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with space",
  );

  assertEquals(
    config.INDENTED_VALUE,
    "indented value",
    "accepts values that are indented with space",
  );

  assertEquals(
    config.TAB_INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with tabs",
  );

  assertEquals(
    config.TAB_INDENTED_VALUE,
    "indented value",
    "accepts values that are indented with tabs",
  );
});

Deno.test("stringify", () => {
  const testDotenv = new TextDecoder("utf-8").decode(
    Deno.readFileSync("./.env.test"),
  );
  const config = parse(testDotenv);
  const stringified = stringify(config);

  assertMatch(
    stringified,
    new RegExp("BASIC\s*=\s*('|\")?basic('|\")?"),
    "stringify a basic variable",
  );

  assertMatch(
    stringified,
    new RegExp("AFTER_EMPTY\s*=\s*('|\")?empty('|\")?"),
    "skips empty lines",
  );

  assertNotMatch(
    stringified,
    new RegExp("#COMMENT\s*=\s*('|\")?not-parsed('|\")?"),
    "skips lines with comments",
  );

  assertMatch(
    stringified,
    new RegExp("EMPTY_VALUE\s*=\s*(\"{2}|'{2})?"),
    "empty values are empty strings",
  );

  assertMatch(
    stringified,
    new RegExp("QUOTED_SINGLE\s*=\s*('|\")?single quoted('|\")?"),
    "single quotes are escaped",
  );

  assertMatch(
    stringified,
    new RegExp("QUOTED_DOUBLE\s*=\s*('|\")?double quoted('|\")?"),
    "double quotes are escaped",
  );

  assertMatch(
    stringified,
    new RegExp("MULTILINE\s*=\s*('|\")hello\nworld('|\")"),
    "new lines are expanded in single/double quotes",
  );

  assertMatch(
    stringified,
    new RegExp('JSON\s*=\s*\'?{"foo": "bar"}\'?'),
    "inner quotes are maintained",
  );

  assertMatch(
    stringified,
    new RegExp("WHITESPACE\s*=\s*('|\")\s{4}whitespace\s{3}('|\")"),
    "whitespace in single-quoted values is preserved",
  );

  assertMatch(
    stringified,
    new RegExp("WHITESPACE_DOUBLE\s*=\s*('|\")\s{4}whitespace\s{3}('|\")"),
    "whitespace in double-quoted values is preserved",
  );

  assertMatch(
    stringified,
    new RegExp("MULTILINE_SINGLE_QUOTE\s*=\s*('|\")hello\nworld('|\")"),
    "new lines are escaped in single/double quotes",
  );

  assertMatch(
    stringified,
    new RegExp("EQUALS\s*=\s*('|\")?equ==als('|\")?"),
    "handles equals inside string",
  );

  assertMatch(
    stringified,
    new RegExp("THE_ANSWER\s*=\s*('|\")?42('|\")?"),
    "number value is not stringified",
  );

  assertMatch(
    stringified,
    new RegExp("VAR_WITH_SPACE\s*=\s*('|\")?var with space('|\")?"),
    "variables defined with spaces are stringified",
  );

  assertMatch(
    stringified,
    new RegExp("VAR_WITH_ENDING_WHITESPACE\s*=\s*('|\")?value('|\")?"),
    "variables defined with ending whitespace are trimmed",
  );
  
  assertMatch(
    stringified,
    new RegExp("V4R_W1TH_NUM8ER5\s*=\s*('|\")?var with numbers('|\")?"),
    "accepts variables containing number",
  );

  assertMatch(
    stringified,
    new RegExp("1INVALID\s*=\s*('|\")?var starting with a number('|\")?"),
    "variables beginning with a number are not stringified",
  );

  assertMatch(
    stringified,
    new RegExp("INDENTED_VAR\s*=\s*('|\")?indented var('|\")?"),
    "accepts variables that are indented with space",
  );

  assertMatch(
    stringified,
    new RegExp("INDENTED_VALUE\s*=\s*('|\")?indented value('|\")?"),
    "accepts values that are indented with space",
  );

  assertMatch(
    stringified,
    new RegExp("TAB_INDENTED_VAR\s*=\s*('|\")?indented var('|\")?"),
    "accepts variables that are indented with tabs",
  );
  
  assertMatch(
    stringified,
    new RegExp("TAB_INDENTED_VALUE\s*=\s*('|\")?indented value('|\")?"),
    "accepts values that are indented with tabs",
  );
});

Deno.test("configure", () => {
  let conf = config();
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  assertEquals(conf.DEFAULT1, "Some Default", "default value loaded");

  conf = config({ path: "./.env.test" });
  assertEquals(conf.BASIC, "basic", "accepts a path to fetch env from");

  conf = config({ export: true });
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "exports variables to env when requested",
  );

  Deno.env.set("DO_NOT_OVERRIDE", "Hello there");
  conf = config({ export: true });
  assertEquals(
    Deno.env.get("DO_NOT_OVERRIDE"),
    "Hello there",
    "does not export .env value if environment variable is already set",
  );

  assertEquals(
    config(
      {
        path: "./.some.non.existent.env",
        defaults: "./.some.non.existent.env",
      },
    ),
    {},
    "returns empty object if file doesn't exist",
  );

  assertEquals(
    config({ path: "./.some.non.existent.env" }),
    { DEFAULT1: "Some Default" },
    "returns with defaults if file doesn't exist",
  );
});

Deno.test("configureSafe", () => {
  // Default
  let conf = config({
    safe: true,
  });
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  // Custom .env.example
  conf = config({
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts a path to fetch env example from",
  );

  // Custom .env and .env.example
  conf = config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts paths to fetch env and env example from",
  );

  // Throws if not all required vars are there
  assertThrows(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Throws if any of the required vars is empty
  assertThrows(() => {
    config({
      path: "./.env.safe.empty.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Does not throw if required vars are provided by example
  config({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example3.test",
    defaults: "./.env.defaults",
  });

  // Does not throw if any of the required vars is empty, *and* allowEmptyValues is present
  config({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });

  // Does not throw if any of the required vars passed externaly
  Deno.env.set("ANOTHER", "VAR");
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
  });

  // Throws if any of the required vars passed externaly is empty
  Deno.env.set("ANOTHER", "");
  assertThrows(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  });

  // Does not throw if any of the required vars passed externaly is empty, *and* allowEmptyValues is present
  Deno.env.set("ANOTHER", "");
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });
});
