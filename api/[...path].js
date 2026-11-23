import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let databaseConnection;

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      message: 'API is not configured: MONGODB_URI is missing.'
    });
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({
      message: 'API is not configured: JWT_SECRET must contain at least 32 characters.'
    });
  }

  try {
    if (!databaseConnection) {
      databaseConnection = connectDB().catch((error) => {
        databaseConnection = undefined;
        throw error;
      });
    }

    await databaseConnection;
    return app(req, res);
  } catch (error) {
    console.error('[Vercel API bootstrap error]', error);
    return res.status(503).json({
      message: 'The API could not connect to its database. Check the production configuration.'
    });
  }
}
