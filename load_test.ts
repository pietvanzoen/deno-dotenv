import { env } from "deno";
import { test, runTests } from "https://deno.land/x/testing/mod.ts";
import { assertEquals } from "https://deno.land/x/testing/asserts.ts";
import "./load.ts";

test(function load() {
  assertEquals(env().GREETING, "hello world", "auto exports .env into env");
});

runTests();
