import axios, { AxiosInstance } from 'axios';
import { Commit, PullRequest } from './models';

// Secondary Port
export interface IGithubAdapter {
  getPullRequests(account: string, repoName: string): Promise<PullRequest[]>;
  getPullRequestCommits(
    account: string,
    repoName: string,
    pullRequestNumber: number
  ): Promise<Commit[]>;
}

export class AxiosGithubAdapter implements IGithubAdapter {
  private readonly axios: AxiosInstance;
  constructor(axiosInstance?: AxiosInstance) {
    this.axios = axiosInstance ?? axios;
  }

  async getPullRequests(
    account: string,
    repoName: string
  ): Promise<PullRequest[]> {
    return this.getPullRequestsReursive(account, repoName);
  }

  private async getPullRequestsReursive(
    account: string,
    repoName: string,
    page = 1,
    perPage = 100
  ): Promise<PullRequest[]> {
    const url = `https://api.github.com/repos/${account}/${repoName}/pulls?page=${page}&per_page=${perPage}`;
    const { data } = await this.axios.get<PullRequest[]>(url);
    if (data.length === 0) {
      return data;
    }

    const otherData = await this.getPullRequestsReursive(
      account,
      repoName,
      page + 1,
      perPage
    );
    return [...data, ...otherData];
  }

  async getPullRequestCommits(
    account: string,
    repoName: string,
    pullRequestNumber: number
  ): Promise<Commit[]> {
    return this.getPullRequestCommitsRecursive(
      account,
      repoName,
      pullRequestNumber
    );
  }

  private async getPullRequestCommitsRecursive(
    account: string,
    repoName: string,
    pullRequestNumber: number,
    page = 1,
    perPage = 100
  ): Promise<object[]> {
    const url = `https://api.github.com/repos/${account}/${repoName}/pulls/${pullRequestNumber}/commits?page=${page}&per_page=${perPage}`;
    const { data } = await this.axios.get<object[]>(url);
    if (data.length === 0) {
      return data;
    }

    const otherData = await this.getPullRequestCommitsRecursive(
      account,
      repoName,
      pullRequestNumber,
      page + 1,
      perPage
    );
    return [...data, ...otherData];
  }
}
