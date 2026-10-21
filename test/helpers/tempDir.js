const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// A fresh folder for one test, deleted afterwards even if the test fails.
// Tests never touch the real tickets.json.
function tempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tickets-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

module.exports = { tempDir };
