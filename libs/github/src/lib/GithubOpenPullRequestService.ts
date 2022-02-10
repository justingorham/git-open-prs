import { IGithubAdapter } from './GithubAdapter';
import { PullRequestWithCommitCount } from './models';

// Primary Port
export interface IGithubOpenPullRequestService {
  getOpenPullRequestsWithCommitCount(
    account: string,
    repoName: string
  ): Promise<PullRequestWithCommitCount[]>;
}

export class GithubOpenPullRequestService
  implements IGithubOpenPullRequestService
{
  constructor(private readonly _githubAdapter: IGithubAdapter) {}

  async getOpenPullRequestsWithCommitCount(
    account: string,
    repoName: string
  ): Promise<PullRequestWithCommitCount[]> {
    const pullRequests = await this._githubAdapter.getPullRequests(
      account,
      repoName
    );
    const openPullRequests = pullRequests.filter((pr) => pr.state === 'open');
    if (openPullRequests.length === 0) {
      return [];
    }

    const prsWithCounts: PullRequestWithCommitCount[] = await Promise.all(
      openPullRequests.map(async (pr) => {
        const commits = await this._githubAdapter.getPullRequestCommits(
          account,
          repoName,
          pr.number
        );
        return {
          number: pr.number,
          state: pr.state,
          numberOfCommits: commits.length,
        };
      })
    );

    return prsWithCounts;
  }
}
