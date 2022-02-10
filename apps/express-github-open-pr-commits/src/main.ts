import {
  AxiosGithubAdapter,
  GithubOpenPullRequestService,
} from '@git-open-prs/github';
import * as express from 'express';

const app = express();
const prService = new GithubOpenPullRequestService(new AxiosGithubAdapter());
const githubUrlRegex = /^https:\/\/github.com\/([\w-]*)\/([\w-]*)$/gm;
const githubUrlMessage = `repositoryUrl parameter must be a public github repo url`;

app.get('/api', async (req, res, next) => {
  let { repositoryUrl } = req.query;
  console.log({ repositoryUrl });
  if (!repositoryUrl) {
    res.status(400).send('Missing repositoryUrl parameter');
    return;
  }

  if (Array.isArray(repositoryUrl)) {
    repositoryUrl = repositoryUrl[0];
  }

  if (typeof repositoryUrl !== 'string') {
    res.status(400).send(githubUrlMessage);
    return;
  }

  const match = githubUrlRegex.exec(repositoryUrl);
  if (!match) {
    res.status(400).send(githubUrlMessage);
    return;
  }

  try {
    const prs = await prService.getOpenPullRequestsWithCommitCount(
      match[1],
      match[2]
    );
    res.send(prs);
  } catch (e) {
    next(e);
  }
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
