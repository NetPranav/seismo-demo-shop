// Keeps the running shop in sync with GitHub: every 10 s, fetch origin/main and fast-forward when it moved
// (for example after merging a Seismo fix PR). Next.js dev then hot-reloads the change. Never merges, never
// touches local edits: if the branch has diverged or files are modified, it only reports and waits.
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const every = Number(process.env.AUTO_PULL_MS ?? 10_000);
let last = '';

function tick() {
  try {
    if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') return report('not on main: auto-pull paused');
    git('fetch', '--quiet', 'origin', 'main');
    const behind = Number(git('rev-list', '--count', 'HEAD..origin/main'));
    if (!behind) return report('');
    if (git('status', '--porcelain', '--untracked-files=no')) return report(`${behind} new commit(s) on GitHub, but local files are modified: not pulling`);
    if (Number(git('rev-list', '--count', 'origin/main..HEAD'))) return report(`${behind} new commit(s) on GitHub, but local commits are not pushed: not pulling`);
    git('merge', '--ff-only', '--quiet', 'origin/main');
    console.log(`[auto-pull] ${new Date().toLocaleTimeString()} pulled ${behind} commit(s): ${git('log', '-1', '--format=%s')}`);
    last = '';
  } catch (e) {
    report(`git error: ${String(e.message ?? e).split('\n')[0]}`);
  }
}
function report(msg) { if (msg && msg !== last) console.log(`[auto-pull] ${msg}`); last = msg; }

console.log(`[auto-pull] watching origin/main every ${every / 1000} s`);
tick();
setInterval(tick, every);
