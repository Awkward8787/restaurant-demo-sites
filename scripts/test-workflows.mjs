import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pages = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
const [header, jobs] = pages.split(/\njobs:\n/);
assert.match(header, /contents: read/);
assert.doesNotMatch(header, /pages: write/);
assert.doesNotMatch(header, /id-token: write/);
const [build, deploy] = jobs.split(/\n  deploy:\n/);
assert.doesNotMatch(build, /pages: write/);
assert.doesNotMatch(build, /id-token: write/);
assert.match(deploy, /pages: write/);
assert.match(deploy, /id-token: write/);
for (const use of pages.matchAll(/uses:\s+(\S+)/g)) {
  assert.match(use[1], /@[0-9a-f]{40}$/, use[1]);
}
assert.match(pages, /# v4\.4\.0/);
assert.match(pages, /# v3\.0\.1/);
assert.match(pages, /# v4\.0\.5/);

const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
assert.match(ci, /pull_request:/);
assert.match(ci, /contents: read/);
assert.doesNotMatch(ci, /id-token:\s*write/);
assert.doesNotMatch(ci, /pages:\s*write/);
assert.match(ci, /npm ci/);
assert.match(ci, /npm test/);
assert.match(ci, /npm run build/);
for (const use of ci.matchAll(/uses:\s+(\S+)/g)) {
  assert.match(use[1], /@[0-9a-f]{40}$/, use[1]);
}

console.log("workflows ok");
