import { MockKBClient } from '../../src/kb/mockClient';
import { describeKBClient } from './contract';

describeKBClient('MockKBClient', async () => new MockKBClient());
