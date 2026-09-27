import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDatabase(): Promise<void> {
  if (!config.mongoUri) {
    console.warn('MONGODB_URI is not configured; running with in-memory mock data.');
    return;
  }
  const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB Atlas.');
}
