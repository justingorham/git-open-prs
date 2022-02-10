/* eslint-disable @typescript-eslint/no-unused-vars */
import { IGithubAdapter } from './GithubAdapter';
import { GithubOpenPullRequestService } from './GithubOpenPullRequestService';
import { Commit, PullRequest } from './models';

class MockGithubAdapter implements IGithubAdapter {
  getPullRequests(account: string, repoName: string): Promise<PullRequest[]> {
    throw new Error('Method not implemented.');
  }
  getPullRequestCommits(
    account: string,
    repoName: string,
    pullRequestNumber: number
  ): Promise<Commit[]> {
    throw new Error('Method not implemented.');
  }
}

describe('GithubOpenPullRequestService', () => {
  let githubAdapter: IGithubAdapter;
  let service: GithubOpenPullRequestService;

  beforeEach(() => {
    githubAdapter = new MockGithubAdapter();
    service = new GithubOpenPullRequestService(githubAdapter);
  });

  it('should return errors from IGithubAdapter getPullRequests', async () => {
    jest.spyOn(githubAdapter, 'getPullRequests').mockImplementation(() => {
      return Promise.reject('Too many requests');
    });
    try {
      await service.getOpenPullRequestsWithCommitCount('account', 'repoName');
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual('Too many requests');
    }
  });

  it('should return empty array when there are no open pull requests', async () => {
    jest.spyOn(githubAdapter, 'getPullRequests').mockImplementation(() => {
      return Promise.resolve<PullRequest[]>([
        {
          number: 1,
          state: 'closed',
        },
      ]);
    });

    const result = await service.getOpenPullRequestsWithCommitCount(
      'account',
      'repoName'
    );
    expect(result).toEqual([]);
  });

  it('should return errors from IGithubAdapter getPullRequestCommits', async () => {
    jest.spyOn(githubAdapter, 'getPullRequests').mockImplementation(() => {
      return Promise.resolve<PullRequest[]>([
        {
          number: 1,
          state: 'open',
        },
      ]);
    });
    jest
      .spyOn(githubAdapter, 'getPullRequestCommits')
      .mockImplementation(() => {
        return Promise.reject('Too many requests');
      });
    try {
      await service.getOpenPullRequestsWithCommitCount('account', 'repoName');
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual('Too many requests');
    }
  });

  it('should return commitCounts for PRs', async () => {
    jest.spyOn(githubAdapter, 'getPullRequests').mockImplementation(() => {
      return Promise.resolve<PullRequest[]>([
        {
          number: 1,
          state: 'open',
        },
      ]);
    });
    jest
      .spyOn(githubAdapter, 'getPullRequestCommits')
      .mockImplementation(() => {
        return Promise.resolve<Commit[]>([{}, {}, {}]);
      });

    const result = await service.getOpenPullRequestsWithCommitCount(
      'account',
      'repoName'
    );
    expect(result).toStrictEqual([
      { number: 1, state: 'open', numberOfCommits: 3 },
    ]);
  });
});
