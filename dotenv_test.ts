import { assertEquals } from "https://deno.land/std@0.60.0/testing/asserts.ts";
import { config } from "./dotenv.ts";

Deno.test("dotenv", () => {
  config();
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "dotenv.ts export still works",
  );
});
