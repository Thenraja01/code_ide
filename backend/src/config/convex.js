import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import dotenv from 'dotenv';

dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || 'http://127.0.0.1:3210';

const convex = new ConvexHttpClient(CONVEX_URL);

export { convex, anyApi };
export default convex;
