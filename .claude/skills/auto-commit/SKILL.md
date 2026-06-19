---
name: auto-commit
description: Reviews everything changed in the current git working tree and prepares a Conventional Commits-style commit message, then asks for authorization before committing and again before pushing. Trigger this whenever the user runs the /auto-commit command, or asks Claude to "commit my changes," "prepare a commit," "write a commit message for this," or "commit and push," even if they don't say the exact command name.
---

# Auto Commit

Turns a dirty working tree into a reviewed, authorized commit (and optionally a push), without the user having to write the message themselves.

## Why this works the way it does

Looking at the actual diff content (not just filenames) is what makes the commit message accurate instead of a generic "update files." Asking for explicit authorization before `git commit` and again before `git push` matters because committing rewrites local history and pushing affects shared/remote history — both are easy to undo in isolation but annoying to untangle once compounded, so a quick confirmation is cheap insurance. Using the identity already in `git config` (rather than asking the user to retype their name/email) keeps authorship correct with zero extra friction.

## Workflow

### 1. Inspect what's there

```bash
git status --short
git diff
git diff --staged
```

If `git diff`, `git diff --staged` are all empty and there are no untracked files in `git status --short`, tell the user there's nothing to commit and stop here — don't fabricate a commit.

### 2. Check recent commit style (context, not a blocker)

```bash
git log -10 --oneline
```

If the existing log already uses a consistent `type(scope):` pattern, mirror that scope vocabulary in step 5 rather than inventing new scope names. If the log is empty, freeform, or this is the first commit, don't worry about it.

### 3. Confirm author identity

```bash
git config user.name
git config user.email
```

Don't override this — git already attributes the commit to whichever identity is configured, so there's nothing to set explicitly. The only exception: if either command returns empty, the repo has no identity configured, so ask the user for a name and email before continuing (or tell them to run `git config user.name "..."` / `user.email "..."` themselves).

### 4. Stage everything

```bash
git add -A
```

The point of this skill is to capture both staged and unstaged changes (and new untracked files) in one pass.

### 5. Draft a Conventional Commits message

Format:

```
<type>(<scope>): <imperative summary, no trailing period>

- <what changed and why, bullet 1>
- <what changed and why, bullet 2>
```

- `type` — one of `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`. Pick whichever matches the dominant change.
- `scope` — optional; include it only when it's obvious from the file paths (e.g. `auth`, `api`, `cli`) or already used in the repo's log (step 2).
- Summary line: English, imperative mood ("add", not "added"/"adds"), ideally under ~72 characters.
- Body bullets: English, describe what changed and why based on the actual diff content — never vague filler like "various fixes" or "misc changes."
- **If the diff clearly mixes unrelated concerns** (e.g. a new feature plus an unrelated formatting pass on a different file), say so and ask the user whether they'd rather split it into separate commits before continuing — don't silently force everything into one message.
- **Scan the diff for anything that looks like a secret** (API keys, passwords, tokens, `.env` contents, private keys). Never put credential-looking values in the commit message, and flag them to the user directly — they may not want to commit that file at all.

#### Example

Diff: a new `validateEmail` function added to `src/utils/auth.js`, plus a call site updated in `src/components/SignupForm.jsx`.

```
feat(auth): add email validation before signup submission

- Add validateEmail() helper with regex-based format check
- Call validateEmail() in SignupForm before submitting the form
```

### 6. Present and ask for authorization

Show the user:
- the full proposed commit message
- the list of files it covers (from `git status --short`)
- the author identity from step 3

Then ask directly: "Want me to commit this?" Wait for a clear yes — don't run `git commit` on an assumption.

### 7. Commit

```bash
git commit -m "<summary line>" -m "<body bullets>"
```

Using two separate `-m` flags (or a heredoc) preserves the blank line between summary and body.

### 8. Ask about pushing

After a successful commit: "Commit done. Want me to push it?"

- If yes, check for an upstream first:
  ```bash
  git rev-parse --abbrev-ref --symbolic-full-name @{u}
  ```
  - If this succeeds, run `git push`.
  - If it errors (no upstream set), ask whether to push to `origin` on the current branch with `git push -u origin <branch>`, or specify a different remote/branch.
- If no, stop here — the commit is ready locally and nothing else happens.

## Edge cases

- **Detached HEAD** — warn before staging/committing; a commit made here isn't on any branch and can be lost once you check out elsewhere.
- **Unresolved merge conflicts** (conflict markers in the diff) — don't commit; point them out and stop.
- **No upstream remote at all** — handled in step 8; don't assume `origin` exists without checking (`git remote -v`).
- **Nothing changed** — handled in step 1; say so plainly.
