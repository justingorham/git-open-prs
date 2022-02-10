import axios from 'axios';

export interface PullRequest {
  number: number;
  state: string;
}

export interface PullRequestWithCommitCount extends PullRequest {
  numberOfCommits: number;
}

export const getOpenPullRequestsWithCommitCount = async (
  account: string,
  repoName: string
): Promise<PullRequestWithCommitCount[]> => {
  const pullRequests = await getPullRequests(account, repoName);
  const openPullRequests = pullRequests.filter((pr) => pr.state === 'open');
  if (openPullRequests.length === 0) {
    return [];
  }
  
  const prsWithCounts: PullRequestWithCommitCount[] = await Promise.all(
    openPullRequests.map(async (pr) => {
      const commits = await getPullRequestCommits(account, repoName, pr.number);
      return {
        ...pr,
        numberOfCommits: commits.length,
      };
    })
  );

  return prsWithCounts;
};

export const getPullRequests = async (
  account: string,
  repoName: string,
  page = 1,
  perPage = 100
): Promise<PullRequest[]> => {
  const { data } = await axios.get<PullRequest[]>(
    `https://api.github.com/repos/${account}/${repoName}/pulls`
  );
  if (data.length === 0) {
    return data;
  }

  const otherData = await getPullRequests(account, repoName, page + 1, perPage);
  return [...data, ...otherData];
};

export const getPullRequestCommits = async (
  account: string,
  repoName: string,
  pullRequestNumber: number,
  page = 1,
  perPage = 100
): Promise<object[]> => {
  const { data } = await axios.get<object[]>(
    `https://api.github.com/repos/${account}/${repoName}/pulls/${pullRequestNumber}/commits?page=${page}&per_page=${perPage}`
  );
  if (data.length === 0) {
    return data;
  }

  const otherData = await getPullRequestCommits(
    account,
    repoName,
    pullRequestNumber,
    page + 1,
    perPage
  );
  return [...data, ...otherData];
};
