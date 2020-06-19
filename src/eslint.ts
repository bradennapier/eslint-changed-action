import * as core from '@actions/core';
import { CLIEngine } from 'eslint';
import { getChangedFiles } from './fs';
import { Octokit, ActionData, LintState } from './types';
import { createCheck } from './api';
import { processLintResults } from './utils';
import { NAME, OWNER, REPO } from './constants';
import path from 'path';

export async function lintChangedFiles(
  client: Octokit,
  data: ActionData,
): Promise<void> {
  const eslint = new CLIEngine({
    extensions: data.eslint.extensions,
    ignorePath: data.eslint.useEslintIgnore ? '.gitignore' : undefined,
    ignore: data.eslint.useEslintIgnore,
    useEslintrc: data.eslint.useEslintrc,
    rulePaths: data.eslint.rulePaths,
    errorOnUnmatchedPattern: data.eslint.errorOnUnmatchedPattern,
    fix: data.eslint.fix,
    configFile: data.eslint.configFile,
  });

  const updateCheck = await createCheck(client, data);

  const state: LintState = {
    errorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    summary: '',
    rulesSummaries: new Map(),
  };

  for await (const changed of await getChangedFiles(client, data)) {
    console.log('[CHANGED BATCH] : Files : ', changed);

    if (changed.length === 0) {
      break;
    }

    const results = await eslint.executeOnFiles(changed);

    const output = processLintResults(eslint, results, state);

    await updateCheck({
      status: 'in_progress',
      output: {
        title: NAME,
        summary: `${state.errorCount} error(s) found so far`,
        annotations: output.annotations,
      },
    });
  }
  const summary = `
|     Type     |       Occurrences       |            Fixable           |
| ------------ | ----------------------- | ---------------------------- | 
| **Errors**   | ${state.errorCount}     | ${state.fixableErrorCount}   |
| **Warnings** | ${state.warningCount}   | ${state.fixableWarningCount} |
  `;
  const checkResult = await updateCheck({
    conclusion: state.errorCount > 0 ? 'failure' : 'success',
    status: 'completed',
    completed_at: new Date().toISOString(),
    output: {
      title: 'Checks Complete',
      summary,
    },
    actions:
      state.fixableErrorCount > 0 || state.fixableWarningCount > 0
        ? [
            {
              label: `Fix ${
                state.fixableErrorCount + state.fixableWarningCount
              } Issues`,
              description: 'Run eslint --fix on the fixable errors & warnings?',
              identifier: 'fix',
            },
          ]
        : undefined,
  });
  if (data.prID) {
    await client.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: data.prID,
      body: `
## [Eslint Summary](${checkResult.data.html_url})

${summary}

- **Result:**      ${checkResult.data.conclusion}
- **Annotations:** [${checkResult.data.output.annotations_count} total](${
        checkResult.data.html_url
      })

---

${[...state.rulesSummaries]
  .sort(([, a], [, b]) => a.level.localeCompare(b.level))
  .map(
    ([, summary]) =>
      `## [${summary.level}] ${
        summary.ruleUrl
          ? `[${summary.ruleId}](${summary.ruleUrl})]`
          : summary.ruleId
      } 

> ${summary.message}

${summary.annotations.map((annotation) => `- ${annotation.path}`).join('\n')}`,
  )
  .join('\n\n---\n\n')}
      `,
    });
  }

  // await client.repos.createOrUpdateFileContents({
  //   owner: OWNER,
  //   repo: REPO,
  //   path: 'src/test.md',
  //   message: 'Commit Message',
  //   content: Buffer.from('Hello').toString('base64'),
  // });
}
