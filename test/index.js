import * as babel from "babel-core";
import expect from "expect";
import fs from "fs";
import path from "path";

const fixturesDir = path.join(process.cwd(), "test/fixtures");

const options = {
  plugins: [
    "syntax-jsx",
    "./src/plugin.js",
  ],
};

const trim = (str) => str.replace(/^\s+|\s+$/, "");

describe("fixtures/", () => {
  fs.readdirSync(fixturesDir)
    .filter((folder) => folder.match(/^[a-z-]+$/))
    .forEach((folder) => {
      describe(`${folder}/`, () => {
        it("should match expected", () => {
          const actual = fs.readFileSync(path.join(fixturesDir, folder, "actual.js"), "utf8");
          const expected = fs.readFileSync(path.join(fixturesDir, folder, "expected.js"), "utf8");

          const transformed = babel.transform(actual, options).code;

          expect(trim(transformed)).toEqual(trim(expected));
        });
      });
    })
  ;
});
