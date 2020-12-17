import { assertEquals } from "./test_deps.ts";
import { difference, removeEmptyValues } from "./util.ts";

Deno.test("removeEmptyValuesTest", () => {
  const actual = removeEmptyValues({
    a: true,
    b: false,
    c: null,
    d: "hi",
    e: "",
    f: 0,
  });
  const expected = {
    a: true,
    b: false,
    d: "hi",
    f: 0,
  };

  assertEquals(actual, expected, "removes null, undefined, and false");
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
