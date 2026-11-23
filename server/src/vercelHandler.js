import app from './app.js';
import { connectDB } from './config/db.js';

let databaseConnection;

export default async function vercelHandler(req, res, routePath) {
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

    // Explicit API files may be mounted by Vercel with a rewritten URL.
    // Force the intended Express path so auth endpoints always reach the correct router.
    if (routePath) {
      const currentUrl = req.url || '';
      const queryIndex = currentUrl.indexOf('?');
      const query = queryIndex >= 0 ? currentUrl.slice(queryIndex) : '';
      req.url = routePath + query;
    }

    return app(req, res);
  } catch (error) {
    console.error('[Vercel API bootstrap error]', error);
    return res.status(503).json({
      message: 'The API could not connect to MongoDB Atlas. Check the Atlas IP access list and MONGODB_URI configuration.'
    });
  }
}
