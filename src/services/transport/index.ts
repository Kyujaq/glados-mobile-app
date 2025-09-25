import { TransportClient } from './TransportClient';
import { createTransportConfig } from './transportConfig';

export * from './TransportClient';
export * from './transportConfig';
export * from './types';

export const transport = new TransportClient(createTransportConfig());
