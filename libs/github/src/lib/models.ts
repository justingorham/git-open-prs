export interface PullRequest {
  number: number;
  state: string;
}

export interface PullRequestWithCommitCount extends PullRequest {
  numberOfCommits: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Commit {

}