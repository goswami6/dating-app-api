const { execSync } = require('child_process');
const fs = require('fs');

const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: __dirname, encoding: 'utf8', timeout: 30000 });
  } catch (e) {
    return (e.stdout || '') + '\nSTDERR: ' + (e.stderr || '');
  }
};

let out = `=== RUN AT ${new Date().toISOString()} ===\n`;
out += '=== GIT STATUS ===\n' + run('git status') + '\n';
out += '=== GIT ADD ===\n' + run('git add -A') + '\n';
out += '=== GIT COMMIT ===\n' + run('git commit -m "Fix: Parameter order mismatches in all shop services"') + '\n';
out += '=== GIT PUSH ===\n' + run('git push origin main') + '\n';
out += '=== DONE ===\n';

const path = require('path');
const outFile = path.join(__dirname, '_pushresult.txt');
fs.writeFileSync(outFile, out, 'utf8');
console.log(out);
