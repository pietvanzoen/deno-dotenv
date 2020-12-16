import { assertEquals } from "./test_deps.ts";
import "./load.ts";

Deno.test("load", () => {
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "auto exports .env into env",
  );
});
