# Shell Command Chaining on Windows

## Rule: Always use `;` instead of `&&` for command chaining

When running terminal commands on this Windows machine (PowerShell), **never use `&&` to chain commands**.
PowerShell does not support `&&` as a statement separator and will throw a parse error.

**Always use `;` instead**, wrapped inside `cmd /c "..."` when needed.

### Examples

❌ Wrong:
```
cmd /c "git add -A && git commit -m "msg" && git push"
```

✅ Correct:
```
cmd /c "git add -A ; git commit -m "msg" ; git push"
```

Or split into separate sequential `run_command` calls if the output of one affects the next.

This applies to ALL shell command chaining: git workflows, npm scripts, file operations, etc.
