import { MissingEnvVarsError, parse, config } from "./dotenv.ts";
import { test, assert, assertEqual } from "https://deno.land/x/testing/mod.ts";
import { readFileSync, env } from "deno";

test(function parser() {
  const testDotenv = new TextDecoder("utf-8").decode(
    readFileSync("./.env.test")
  );
  const config = parse(testDotenv);
  assertEqual(config.BASIC, "basic", "parses a basic variable");
  assertEqual(config.AFTER_EMPTY, "empty", "skips empty lines");
  assertEqual(config.AFTER_COMMENT, "comment", "skips lines with comments");
  assertEqual(config.EMPTY_VALUE, "", "empty values are empty strings");
  assertEqual(
    config.QUOTED_SINGLE,
    "single quoted",
    "single quotes are escaped"
  );
  assertEqual(
    config.QUOTED_DOUBLE,
    "double quoted",
    "double quotes are escaped"
  );
  assertEqual(
    config.MULTILINE,
    "hello\nworld",
    "new lines are expanded in double quotes"
  );
  assertEqual(config.JSON, '{"foo": "bar"}', "inner quotes are maintained");
  assertEqual(config.WHITESPACE, "whitespace", "values are trimmed");

  assertEqual(
    config.MULTILINE_SINGLE_QUOTE,
    "hello\\nworld",
    "new lines are escaped in single quotes"
  );
  assertEqual(config.EQUALS, "equ==als", "handles equals inside string");
});

test(function configure() {
  let conf = config();
  assertEqual(conf.GREETING, "hello world", "fetches .env by default");

  conf = config({ path: "./.env.test" });
  assertEqual(conf.BASIC, "basic", "accepts a path to fetch env from");

  conf = config({ export: true });
  assertEqual(
    env().GREETING,
    "hello world",
    "exports variables to env when requested"
  );
});

test(function configureSafe() {
  // Default
  let conf = config({
    safe: true
  });
  assertEqual(conf.GREETING, "hello world", "fetches .env by default");

  // Custom .env.example
  conf = config({
    safe: true,
    example: "./.env.example.test"
  });

  assertEqual(
    conf.GREETING,
    "hello world",
    "accepts a path to fetch env example from"
  );

  // Custom .env and .env.example
  conf = config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example.test"
  });

  assertEqual(
    conf.GREETING,
    "hello world",
    "accepts paths to fetch env and env example from"
  );

  // Throws if not all required vars are there
  assert.throws(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test"
    });
  }, MissingEnvVarsError);

  // Throws if any of the required vars is empty
  assert.throws(() => {
    config({
      path: "./.env.safe.empty.test",
      safe: true,
      example: "./.env.example2.test"
    });
  }, MissingEnvVarsError);

  // Does not throw if any of the required vars is empty, *and* allowEmptyValues is present
  config({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true
  });

  // Does not throw if any of the required vars passed externaly
  env().ANOTHER = "VAR";
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test"
  });

  // Throws if any of the required vars passed externaly is empty
  env().ANOTHER = "";
  assert.throws(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test"
    });
  });

  // Does not throw if any of the required vars passed externaly is empty, *and* allowEmptyValues is present
  env().ANOTHER = "";
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true
  });
});
