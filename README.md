# gh-pr-cycle

CLI to Output GitHub PullRequest Cycle Stats

# Installation

```
npm install gh-pr-cycle
```

# Usage

```bash
$ gh-pr-cycle {user}/{repo}
```

## Example

```bash
$ gh-pr-cycle --all yasuhiroki/gh-pr-cycle
| PR number | state | created by | created at | merged by | mergedd at | duration(msec) | changed files |
| 1 | closed | yasuhiroki | yasuhiroki | 11000 | 1 |
| 2 | open | yasuhiroki | | | 1 |
```

# Options

## `--all`

Show open/closed pull request.

```bash
$ gh-pr-cycle --all {user}/{repo}
```

## `--token TOKEN`

Use GitHub Personal Token.

```bash
$ gh-pr-cycle --token 'Your Personal Token' {user}/{repo}
```


