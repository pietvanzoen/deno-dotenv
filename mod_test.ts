import { MissingEnvVarsError, parse, config } from "./mod.ts";
import {
  assertThrows,
  assertEquals,
  fail,
} from "https://deno.land/std@0.60.0/testing/asserts.ts";

Deno.test("parser", () => {
  const testDotenv = new TextDecoder("utf-8").decode(
    Deno.readFileSync("./.env.test"),
  );
  const config = parse(testDotenv);
  assertEquals(config.BASIC, "basic", "parses a basic variable");
  assertEquals(config.AFTER_EMPTY, "empty", "skips empty lines");
  assertEquals(config.AFTER_COMMENT, "comment", "skips lines with comments");
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
  assertEquals(config.JSON, '{"foo": "bar"}', "inner quotes are maintained");
  assertEquals(config.WHITESPACE, "whitespace", "values are trimmed");

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
    config.V4R_W1TH_NUM8ER5,
    "var with numbers",
    "accepts variables containing number",
  );

  assertEquals(
    config.INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with space",
  );

  assertEquals(
    config.TAB_INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with tabs",
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
