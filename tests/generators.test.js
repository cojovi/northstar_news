import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
// Extract only local identity functions from the AST. No generator main/imports,
// model calls, git commands, notifications or remote publication are executed.
test("every active Python article generator assigns the registry desk deterministically", () => {
  const result = execFileSync(
    "python3",
    [
      "-B",
      "-c",
      `
import ast, json, sys
from pathlib import Path
sys.path.insert(0, str(Path('content').resolve()))
from author_registry import disclosed_desk_author
results = {}
for p in sorted(Path('content').glob('create_article*.py')):
    tree = ast.parse(p.read_text())
    functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'generate_random_author']
    assert len(functions) == 1
    namespace = {'disclosed_desk_author': disclosed_desk_author}
    exec(compile(ast.Module(body=functions, type_ignores=[]), str(p), 'exec'), namespace)
    values = [namespace['generate_random_author']() for _ in range(10)]
    assert all(v == disclosed_desk_author() for v in values)
    assert 'FIRST_NAMES' not in p.read_text() and 'PREFIXES' not in p.read_text()
    results[str(p)] = values[0]
print(json.dumps(results))
`,
    ],
    { encoding: "utf8" },
  );
  const values = JSON.parse(result);
  assert.equal(Object.keys(values).length, 4);
  for (const pair of Object.values(values))
    assert.deepEqual(pair, ["The Northstar Ledger Desk", "northstar-desk"]);
});
