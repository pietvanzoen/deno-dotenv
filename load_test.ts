import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import "./load.ts";

Deno.test(function load(): void {
  assertEquals(
    Deno.env().GREETING,
    "hello world",
    "auto exports .env into env"
  );
});
