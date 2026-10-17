import assert from "node:assert/strict";
import { jsonForScript } from "../src/lib/json-script.mjs";

const payload = { note: "</script><script>alert(1)</script>", hours: { mon: [["11:30", "24:00"]] } };
const raw = jsonForScript(payload);
assert.equal(raw.includes("<"), false);
assert.match(raw, /\\u003c\/script/);
assert.deepEqual(JSON.parse(raw), payload);
assert.equal(jsonForScript(null), "null");

console.log("json ok");
