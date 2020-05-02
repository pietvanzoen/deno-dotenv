import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import "./load.ts";

Deno.test("load", () => {
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "auto exports .env into env",
  );
});
