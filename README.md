<div align="center">
  <h1>
    <br/>
    <br/>
    <p align="center">
      <img src="docs/img/annotation.png" width="100%" title="eslint-plus-action">
    </p>
    <br />
    eslint-plus-action
    <br />
    <br />
    <br />
    <br />
  </h1>
  <sup>
    <br />
    <br />
    <br />
    A Github Action which runs ESLint against the changed files in a PR with customizable options and rich summaries.  ESLint issues are annotated inline on your PR diff.
  </sup>
  <br />
  <br />
  <br />
  <br />
  <br />
  <br />
  <br />
  <br />
</div>

## Features

- [Inline Annotations of ESLint Warnings & Errors](https://github.com/bradennapier/eslint-plus-action/pull/3/files)
- Customizable ESLint options
- [Optional summary comments on each push to the PR](https://github.com/bradennapier/eslint-plus-action/pull/3)
- [Links to the rule documentation when available](https://github.com/bradennapier/eslint-plus-action/pull/3#issuecomment-646635983)
- [Annotation Summary Page](https://github.com/bradennapier/eslint-plus-action/pull/3/checks?check_run_id=788235048)
- Suggestions are printed (not yet provided as change suggestions)
- Button to run ESLint Fix [COMING SOON]
- More...

> The summary comments have some redundancy when there are suggestions available.  This will be improved.

> The `fix` property is not yet setup but will come shortly. If fixes are available, it will render an action button to run the fix as well.

## Configuration

You provide configuration properties within your workflow by using the `with` property.  See the `Simple Workflow Example` for an example of providing your github-token.  

> `array` types are expected to be comma-separated values

|    Property   | Type | Default | Required | Description |
| ------------- | ---- | ------- | -------- | ----------- |
| github-token | string | none | true | Your Github token.  This is provided by default and should be set to `${{secrets.GITHUB_TOKEN}} in most cases. |
| issueSummary | boolean | true | false | Should the bot provide a summary of the results as a comment? |
| extensions | array | .js,.jsx,.ts,.tsx | false | An array of extensions to lint |
| includeGlob | array | \*\*/\* | false | Optional array of globs to include from the changed files list |
| ignoreGlob | array | none | false | Optional array of globs to ignore from the changed files list |
| configFile | string | none | false | A config file to use if the default config resolution doesn't work. |
| rulePaths | array | none | false | Optional paths to custom rules directories to include. |
| errorOnUnmatchedPattern | boolean | false | false | Throw error if unmatched pattern is seen? |
| useEslintrc | boolean | true | false | Use eslintrc? |
| useEslintIgnore | boolean | true | false | Use eslintignore? |
| annotateWarnings | boolean | true | false | By setting this to "false", only errors will be annotated |
| reportSuggestions | boolean | true | false | Report suggestions when available within the annotations? |
| reportIgnoredFiles | boolean | false | false | Report a list of any ignored files? |
| reportWarningsAsErrors | boolean | false | false | Report any eslint warnings as errors? |
| fix | boolean | false | false | Commit fixes when possible (UNFINISHED) |

> The official settings can always be seen by viewing the [`action.yml`](https://github.com/bradennapier/eslint-plus-action/blob/master/action.yml) schema for the action.

## Simple Workflow Example

Below is a basic example which should get you going.  You can view the action.yml to see what other properties are available for customization.

```yml
name: "my-workflow"
on: [pull_request]

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: bradennapier/eslint-plus-action@v1
      with: 
        github-token: ${{secrets.GITHUB_TOKEN}}
```

## Environment Variables

There may be times that you need to provide a `NPM_TOKEN` so that the action can install your private repos.  You do this by adding the secret to your repo `Settings -> Secrets` then providing it as an environment variable to the action:

```yml
jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: bradennapier/eslint-plus-action@v1
      env:
        NPM_TOKEN: ${{secrets.NPM_TOKEN}}
      with: 
        github-token: ${{secrets.GITHUB_TOKEN}}
```

## More Previews

<p align="center">
  <img src="docs/img/prcomment.png" width="100%" title="eslint-plus-action-pr-comment">
</p>

## Credits

This action was adapted from other actions which didn't quite work for me but were close.  So special thanks to them for helping me get here.

- https://github.com/marketplace/actions/eslint-annotate
- https://github.com/marketplace/actions/eslint-action