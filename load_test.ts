import { env } from "deno";
import { test, assertEqual } from "https://deno.land/x/testing/testing.ts";
import "./load.ts";

test(function load() {
  assertEqual(env().GREETING, "hello world", "auto exports .env into env");
});
