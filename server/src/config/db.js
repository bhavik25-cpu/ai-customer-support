import mongoose from 'mongoose';
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_customer_support';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected: ' + mongoose.connection.host + '/' + mongoose.connection.name);
}
