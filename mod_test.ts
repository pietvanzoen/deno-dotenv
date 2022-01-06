import { assertEquals, assertRejects, assertThrows } from "./test_deps.ts";
import { config, configAsync, MissingEnvVarsError, parse } from "./mod.ts";

Deno.test("parser", () => {
  const testDotenv = Deno.readTextFileSync("./.env.test");

  const { env: config, exports } = parse(testDotenv);
  assertEquals(config.BASIC, "basic", "parses a basic variable");
  assertEquals(config.AFTER_EMPTY, "empty", "skips empty lines");
  assertEquals(config["#COMMENT"], undefined, "skips lines with comments");
  assertEquals(config.EMPTY_VALUE, "", "empty values are empty strings");

  assertEquals(
    config.QUOTED_SINGLE,
    "single quoted",
    "single quotes are escaped",
  );

  assertEquals(
    config.QUOTED_DOUBLE,
    "double quoted",
    "double quotes are escaped",
  );

  assertEquals(
    config.MULTILINE,
    "hello\nworld",
    "new lines are expanded in double quotes",
  );

  assertEquals(
    JSON.parse(config.JSON).foo,
    "bar",
    "inner quotes are maintained",
  );

  assertEquals(
    config.WHITESPACE,
    "    whitespace   ",
    "whitespace in single-quoted values is preserved",
  );

  assertEquals(
    config.WHITESPACE_DOUBLE,
    "    whitespace   ",
    "whitespace in double-quoted values is preserved",
  );

  assertEquals(
    config.MULTILINE_SINGLE_QUOTE,
    "hello\\nworld",
    "new lines are escaped in single quotes",
  );

  assertEquals(config.EQUALS, "equ==als", "handles equals inside string");

  assertEquals(
    config.VAR_WITH_SPACE,
    "var with space",
    "variables defined with spaces are parsed",
  );

  assertEquals(
    config.VAR_WITH_ENDING_WHITESPACE,
    "value",
    "variables defined with ending whitespace are trimmed",
  );

  assertEquals(
    config.V4R_W1TH_NUM8ER5,
    "var with numbers",
    "accepts variables containing number",
  );

  assertEquals(
    config["1INVALID"],
    undefined,
    "variables beginning with a number are not parsed",
  );

  assertEquals(
    config.INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with space",
  );

  assertEquals(
    config.INDENTED_VALUE,
    "indented value",
    "accepts values that are indented with space",
  );

  assertEquals(
    config.TAB_INDENTED_VAR,
    "indented var",
    "accepts variables that are indented with tabs",
  );

  assertEquals(
    config.TAB_INDENTED_VALUE,
    "indented value",
    "accepts values that are indented with tabs",
  );

  const expectedExportedAssignments = [
    {
      name: "EXPORTED_VAR",
      value: "exported value 1",
      comment: "accepts exported variables",
    },
    {
      name: "INDENTED_EXPORTED_ASSIGNMENT",
      value: "exported value 2",
      comment: "accepts indented exported assignments",
    },
    {
      name: "TAB_INDENTED_EXPORTED_ASSIGNMENT",
      value: "  exported value 3  ",
      comment: "accepts tab indented exported assignments",
    },
    {
      name: "TAB_SPACED_ASSIGNMENT_VAR",
      value: "		exported value 4		",
      comment: "accepts tab spaced exported assignments",
    },
  ];

  const expectedExportedVariables = expectedExportedAssignments.map(({ name }) => name);
  assertEquals(
    [...exports],
    expectedExportedVariables,
    "correctly identifies exports",
  );

  expectedExportedAssignments.forEach(({ name, value, comment }) =>
    assertEquals(config[name], value, comment)
  );
});

Deno.test("configure", () => {
  let conf = config();
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  assertEquals(conf.DEFAULT1, "Some Default", "default value loaded");

  conf = config({ path: "./.env.test" });
  assertEquals(conf.BASIC, "basic", "accepts a path to fetch env from");

  conf = config({ export: true });
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "exports variables to env when requested",
  );

  Deno.env.set("DO_NOT_OVERRIDE", "Hello there");
  conf = config({ export: true });
  assertEquals(
    Deno.env.get("DO_NOT_OVERRIDE"),
    "Hello there",
    "does not export .env value if environment variable is already set",
  );

  assertEquals(
    config(
      {
        path: "./.some.non.existent.env",
        defaults: "./.some.non.existent.env",
      },
    ),
    {},
    "returns empty object if file doesn't exist",
  );

  assertEquals(
    config({ path: "./.some.non.existent.env" }),
    { DEFAULT1: "Some Default" },
    "returns with defaults if file doesn't exist",
  );
});

Deno.test("configureSafe", () => {
  // Default
  let conf = config({
    safe: true,
  });
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  // Custom .env.example
  conf = config({
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts a path to fetch env example from",
  );

  // Custom .env and .env.example
  conf = config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts paths to fetch env and env example from",
  );

  // Throws if not all required vars are there
  assertThrows(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Throws if any of the required vars is empty
  assertThrows(() => {
    config({
      path: "./.env.safe.empty.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Does not throw if required vars are provided by example
  config({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example3.test",
    defaults: "./.env.defaults",
  });

  // Does not throw if any of the required vars is empty, *and* allowEmptyValues is present
  config({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });

  // Does not throw if any of the required vars passed externally
  Deno.env.set("ANOTHER", "VAR");
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
  });

  // Throws if any of the required vars passed externally is empty
  Deno.env.set("ANOTHER", "");
  assertThrows(() => {
    config({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  });

  // Does not throw if any of the required vars passed externally is empty, *and* allowEmptyValues is present
  Deno.env.set("ANOTHER", "");
  config({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });
});

Deno.test("configure async", async () => {
  let conf = await configAsync();
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  assertEquals(conf.DEFAULT1, "Some Default", "default value loaded");

  conf = await configAsync({ path: "./.env.test" });
  assertEquals(conf.BASIC, "basic", "accepts a path to fetch env from");

  conf = await configAsync({ export: true });
  assertEquals(
    Deno.env.get("GREETING"),
    "hello world",
    "exports variables to env when requested",
  );

  Deno.env.set("DO_NOT_OVERRIDE", "Hello there");
  conf = await configAsync({ export: true });
  assertEquals(
    Deno.env.get("DO_NOT_OVERRIDE"),
    "Hello there",
    "does not export .env value if environment variable is already set",
  );

  assertEquals(
    await configAsync(
      {
        path: "./.some.non.existent.env",
        defaults: "./.some.non.existent.env",
      },
    ),
    {},
    "returns empty object if file doesn't exist",
  );

  assertEquals(
    await configAsync({ path: "./.some.non.existent.env" }),
    { DEFAULT1: "Some Default" },
    "returns with defaults if file doesn't exist",
  );
});

Deno.test("configureSafe async", async () => {
  // Default
  let conf = await configAsync({
    safe: true,
  });
  assertEquals(conf.GREETING, "hello world", "fetches .env by default");

  // Custom .env.example
  conf = await configAsync({
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts a path to fetch env example from",
  );

  // Custom .env and .env.example
  conf = await configAsync({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example.test",
  });

  assertEquals(
    conf.GREETING,
    "hello world",
    "accepts paths to fetch env and env example from",
  );

  // Throws if not all required vars are there
  assertRejects(async () => {
    await configAsync({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Throws if any of the required vars is empty
  assertRejects(async () => {
    await configAsync({
      path: "./.env.safe.empty.test",
      safe: true,
      example: "./.env.example2.test",
    });
  }, MissingEnvVarsError);

  // Does not throw if required vars are provided by example
  await configAsync({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example3.test",
    defaults: "./.env.defaults",
  });

  // Does not throw if any of the required vars is empty, *and* allowEmptyValues is present
  await configAsync({
    path: "./.env.safe.empty.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });

  // Does not throw if any of the required vars passed externally
  Deno.env.set("ANOTHER", "VAR");
  await configAsync({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
  });

  // Throws if any of the required vars passed externally is empty
  Deno.env.set("ANOTHER", "");
  assertRejects(async () => {
    await configAsync({
      path: "./.env.safe.test",
      safe: true,
      example: "./.env.example2.test",
    });
  });

  // Does not throw if any of the required vars passed externally is empty, *and* allowEmptyValues is present
  Deno.env.set("ANOTHER", "");
  await configAsync({
    path: "./.env.safe.test",
    safe: true,
    example: "./.env.example2.test",
    allowEmptyValues: true,
  });
});
