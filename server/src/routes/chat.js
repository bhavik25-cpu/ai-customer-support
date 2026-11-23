import {Router} from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import {requireAuth} from '../middleware/auth.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {askOpenRouter} from '../services/openrouter.js';
const router=Router();router.use(requireAuth);
router.get('/conversations',asyncHandler(async(req,res)=>{
 const rows=await Conversation.find({user:req.userId}).sort({updatedAt:-1}).lean();
 res.json({conversations:rows.map(item=>({id:item._id,title:item.title,updatedAt:item.updatedAt,preview:item.messages.at(-1)?.content?.slice(0,80)||''}))});
}));
router.post('/conversations',asyncHandler(async(req,res)=>{
 const c=await Conversation.create({user:req.userId});res.status(201).json({conversation:{id:c._id,title:c.title,messages:[]}});
}));
router.get('/conversations/:id',asyncHandler(async(req,res)=>{
 if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid conversation ID.'});
 const c=await Conversation.findOne({_id:req.params.id,user:req.userId}).lean();if(!c)return res.status(404).json({message:'Conversation not found.'});
 res.json({conversation:{id:c._id,title:c.title,messages:c.messages}});
}));
router.delete('/conversations/:id',asyncHandler(async(req,res)=>{
 if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid conversation ID.'});
 const result=await Conversation.findOneAndDelete({_id:req.params.id,user:req.userId});if(!result)return res.status(404).json({message:'Conversation not found.'});
 res.json({message:'Conversation deleted.'});
}));
router.post('/send',asyncHandler(async(req,res)=>{
 const message=String(req.body.message||'').trim();const conversationId=req.body.conversationId;
 if(!message)return res.status(400).json({message:'Please enter a message.'});
 if(message.length>4000)return res.status(400).json({message:'Message is too long (maximum 4,000 characters).'});
 let c;
 if(conversationId){if(!mongoose.isValidObjectId(conversationId))return res.status(400).json({message:'Invalid conversation ID.'});c=await Conversation.findOne({_id:conversationId,user:req.userId});if(!c)return res.status(404).json({message:'Conversation not found.'});}
 else c=await Conversation.create({user:req.userId});
 c.messages.push({role:'user',content:message});if(c.messages.length===1)c.title=message.replace(/\s+/g,' ').slice(0,55);await c.save();
 const answer=await askOpenRouter(c.messages.map(item=>({role:item.role,content:item.content})));c.messages.push({role:'assistant',content:answer});await c.save();
 res.json({conversationId:c._id,title:c.title,userMessage:c.messages.at(-2),assistantMessage:c.messages.at(-1)});
}));
export default router;
