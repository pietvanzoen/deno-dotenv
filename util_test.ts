import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { compact, difference, trim } from "./util.ts";

Deno.test("compactTest", () => {
  const actual = compact({
    foo: true,
    bar: false,
    baz: null,
    qux: "hi",
  });
  const expected = {
    foo: true,
    qux: "hi",
  };

  assertEquals(actual, expected, "removes falsy values");
});

Deno.test("trimTest", () => {
  const actual = trim(" hello world. \n\t ");
  const expected = "hello world.";
  assertEquals(actual, expected, "trims whitespace");
});

Deno.test("differenceTest", () => {
  const actual = difference(["a", "b", "c"], ["b", "c", "d"]);
  const expected = ["a"];
  assertEquals(
    actual,
    expected,
    "returns an array of elements in list1 that are not in list2",
  );
});
