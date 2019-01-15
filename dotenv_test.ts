import { parse, config } from "./dotenv.ts";
import { test, assertEqual } from "https://deno.land/x/testing/mod.ts";
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
