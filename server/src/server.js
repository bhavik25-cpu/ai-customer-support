import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {connectDB} from './config/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));
app.use(express.json({limit:'32kb'}));
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'ai-customer-support'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:50,standardHeaders:'draft-7',legacyHeaders:false}),authRoutes);
app.use('/api/chat',rateLimit({windowMs:60*1000,limit:40,standardHeaders:'draft-7',legacyHeaders:false}),chatRoutes);
app.use((_req,res)=>res.status(404).json({message:'API route not found.'}));
app.use((error,_req,res,_next)=>{
 console.error('[API error]',error);const status=error.status||(error.code===11000?409:500);
 res.status(status).json({message:status>=500&&process.env.NODE_ENV==='production'?'Server error. Please try again.':error.message||'Internal server error.'});
});
const port=Number(process.env.PORT||5000);
try{
 if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<24||process.env.JWT_SECRET.startsWith('CHANGE_ME'))throw new Error('Set a private JWT_SECRET (at least 24 characters) in server/.env before starting.');
 await connectDB();app.listen(port,()=>console.log('API ready: http://localhost:'+port));
}catch(error){console.error('Could not start server: '+error.message);process.exit(1);}
