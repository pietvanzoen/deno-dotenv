import { test, runTests } from "https://deno.land/x/testing/mod.ts";
import { assertEquals } from "https://deno.land/x/testing/asserts.ts";
import { compact, difference, trim } from "./util.ts";

test(function compactTest() {
  const actual = compact({
    foo: true,
    bar: false,
    baz: null,
    qux: "hi"
  });
  const expected = {
    foo: true,
    qux: "hi"
  };

  assertEquals(actual, expected, "removes falsy values");
});

test(function trimTest() {
  const actual = trim(" hello world. \n\t ");
  const expected = "hello world.";
  assertEquals(actual, expected, "trims whitespace");
});

test(function differenceTest() {
  const actual = difference(["a", "b", "c"], ["b", "c", "d"]);
  const expected = ["a"];
  assertEquals(
    actual,
    expected,
    "returns an array of elements in list1 that are not in list2"
  );
});

runTests();
