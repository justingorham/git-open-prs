import axios from 'axios';
import { getOpenPullRequestsWithCommitCount } from './github';

jest.mock('axios');
describe('github', () => {
  it('should work', async () => {
    const prs = await getOpenPullRequestsWithCommitCount(
      'expressjs',
      'expressjs.com'
    );
    
  });
});
