// Every t("key") used in the app must exist in i18n.ts with non-empty English and Hindi.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const i18n = readFileSync(join(root, "src/lib/i18n.ts"), "utf8");
const entry = /^\s*'([\w.\-]+)':\s*\{\s*en:\s*(['"`])((?:\\.|(?!\2).)*)\2,\s*hi:\s*(['"`])((?:\\.|(?!\4).)*)\4\s*\}/gm;
const keys = new Map<string, { en: string; hi: string }>();
for (const m of i18n.matchAll(entry)) keys.set(m[1], { en: m[3], hi: m[5] });

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mts)$/.test(f) ? [p] : [];
  });
}

test("translation file parses and has no duplicates", () => {
  const all = [...i18n.matchAll(/^\s*'([\w.\-]+)':\s*\{/gm)].map((m) => m[1]);
  assert.ok(all.length > 300);
  assert.equal(new Set(all).size, all.length, "duplicate keys");
  assert.equal(keys.size, all.length, "some entries could not be parsed");
});

test("every key has English and Hindi text", () => {
  for (const [k, v] of keys) {
    assert.ok(v.en.trim(), `${k}: empty English`);
    assert.ok(v.hi.trim(), `${k}: empty Hindi`);
  }
});

test("every t('...') key used in src exists", () => {
  const missing: string[] = [];
  for (const f of files(join(root, "src"))) {
    for (const m of readFileSync(f, "utf8").matchAll(/\bt[f]?\(\s*["']([\w-]+\.[\w.\-]+)["']/g)) {
      if (!keys.has(m[1])) missing.push(`${m[1]} (${f.replace(root, "")})`);
    }
  }
  assert.deepEqual(missing, []);
});
