import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';

const port = Number(process.env.PORT || 5000);

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set a private JWT_SECRET containing at least 32 characters in server/.env before starting.');
  }

  await connectDB();
  app.listen(port, () => console.log('API ready on port ' + port));
} catch (error) {
  console.error('Could not start server: ' + error.message);
  process.exit(1);
}
