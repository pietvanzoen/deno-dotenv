import { assertEquals } from "./test_deps.ts";
import { config } from "./dotenv.ts";

Deno.test("dotenv", () => {
  config();
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "dotenv.ts export still works",
  );
});
