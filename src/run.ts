import * as core from '@actions/core';
import * as github from '@actions/github';

import { lintChangedFiles } from './eslint';
import { processArrayInput, processBooleanInput, processInput } from './utils';
import { ActionData } from './types';

async function run(): Promise<void> {
  const { context } = github;

  core.debug('👋 Hello! You are an amazing person! 🙌');

  const client = github.getOctokit(
    core.getInput('github-token', { required: true }),
  );

  const data: ActionData = {
    prID: github.context.payload.pull_request?.number,
    sha: context.payload.pull_request?.head.sha || context.sha,

    includeGlob: processArrayInput('includeGlob', []),
    ignoreGlob: processArrayInput('ignoreGlob', []),

    eslint: {
      errorOnUnmatchedPattern: processBooleanInput(
        'errorOnUnmatchedPattern',
        false,
      ),
      extensions: processArrayInput('extensions', [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
      ]),
      rulePaths: processArrayInput('rulePaths', []),
      followSymbolicLinks: processBooleanInput('followSymbolicLinks', true),
      useEslintIgnore: processBooleanInput('useEslintIgnore', true),
      ignorePath: processInput('ignorePath', null) || undefined,
      useEslintrc: processBooleanInput('useEslintrc', true),
      overrideConfigFile: processInput('overrideConfigFile', null) || undefined,
      fix: processBooleanInput('useEslintrc', false),
      fixTypes:
        (processArrayInput('fixTypes', null) as (
          | 'problem'
          | 'suggestion'
          | 'layout'
          | undefined
        )[]) || undefined,
    },
  };

  core.info(`Context:\n ${JSON.stringify(data, null, 2)}`);

  await lintChangedFiles(client, data);
}

run();

export default run;
