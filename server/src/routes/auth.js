import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {requireAuth} from '../middleware/auth.js';
import {asyncHandler} from '../utils/asyncHandler.js';
const router=Router();
const safeUser=user=>({id:user._id,name:user.name,email:user.email});
const createToken=user=>jwt.sign({sub:user._id.toString()},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'7d'});
router.post('/signup',asyncHandler(async(req,res)=>{
 const name=String(req.body.name||'').trim();const email=String(req.body.email||'').trim().toLowerCase();const password=String(req.body.password||'');
 if(name.length<2)return res.status(400).json({message:'Name must contain at least 2 characters.'});
 if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({message:'Enter a valid email address.'});
 if(password.length<8)return res.status(400).json({message:'Password must contain at least 8 characters.'});
 if(await User.exists({email}))return res.status(409).json({message:'This email is already registered. Please sign in.'});
 const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12)});
 res.status(201).json({token:createToken(user),user:safeUser(user)});
}));
router.post('/login',asyncHandler(async(req,res)=>{
 const email=String(req.body.email||'').trim().toLowerCase();const password=String(req.body.password||'');
 const user=await User.findOne({email}).select('+passwordHash');
 if(!user||!(await bcrypt.compare(password,user.passwordHash)))return res.status(401).json({message:'Incorrect email or password.'});
 res.json({token:createToken(user),user:safeUser(user)});
}));
router.get('/me',requireAuth,asyncHandler(async(req,res)=>{
 const user=await User.findById(req.userId);if(!user)return res.status(401).json({message:'User account was not found.'});res.json({user:safeUser(user)});
}));
router.post('/logout',requireAuth,(_req,res)=>res.json({message:'Logged out. Remove the client token to finish logout.'}));
export default router;
