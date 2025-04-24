# Contributing

Here are some guidelines to help you get started:

## Branch & Commit messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) guidelines for commit messages. 

This means that each commit message should start with a type, followed by a scope (optional), and then a description. For example:

| Commit type | Example Commit message             | Scope                                                |
|-------------|------------------------------------|------------------------------------------------------|
| feat        | feat: implement button             | Implementation of new feature                        |
| fix         | fix: clickable button              | Bug fix                                              |
| refactor    | refactor: change architecture file | Change code that doesn't affect implemented features |
| docs        | docs: update readme                | Change of documentation                              |
| test        | test: add tests on button          | Update on tests files                                |
| ci          | ci: add validation step            | Modification of CI config files                      |
| chore       | chore: update dependencies         | Changes that don't modify the code                   |

On the same pattern, branch names should also follow the same convention. For example:

| Branch name | Example Branch name        | Scope                                                |
|-------------|----------------------------|------------------------------------------------------|
| feat        | feat-button                | Implementation of new feature                        |
| fix         | fix-clickable-button       | Bug fix                                              |
| refactor    | refactor-architecture-file | Change code that doesn't affect implemented features |
| docs        | docs-update-readme         | Change of documentation                              |
| test        | test-add-test-on-button    | Update on tests files                                |
| ci          | ci-add-validation-step     | Modification of CI config files                      |
| chore       | chore-update-dependencies  | Changes that don't modify the code                   |

Revert commits should be used to revert previous commits. The commit message should start with `revert:` and the commit hash of the reverted commit. For example:

```
revert: <commit_hash>

This reverts commit <commit_hash>.
```

There is a protection set on `master` branch, to avoid any direct push. All changes should be made through pull requests.
In the pull request:
- Require at least **one approve** on the PR.
- When a thread is opened by a reviewer, the contributor should answer/make the changes requested. Only the **creator of the thread** can resolve it.
- When all threads are resolved, the PR can be merged.

## Language

The common language for this project is **English**. Please use English for all contributions (_code naming/comments, documentation, commit, pull requests, …_).

## Coding Rules

