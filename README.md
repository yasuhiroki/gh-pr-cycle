# gh-pr-cycle

CLI to Output GitHub PullRequest Cycle Stats

# Example

```bash
$ gh-pr-cycle --all yasuhiroki/gh-pr-cycle
| PR number | state | created by | created at | merged by | mergedd at | duration(msec) | changed files |
| 1 | closed | yasuhiroki | yasuhiroki | 11000 | 1 |
| 2 | open | yasuhiroki | | | 1 |
```

# Output Example

```sh
$ node main.js <owner> <repository name>
```

