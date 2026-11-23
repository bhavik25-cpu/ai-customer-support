import mongoose from 'mongoose';
const messageSchema=new mongoose.Schema({
 role:{type:String,enum:['user','assistant'],required:true},
 content:{type:String,required:true,maxlength:12000},
 createdAt:{type:Date,default:Date.now}
});
const conversationSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 title:{type:String,default:'New conversation',maxlength:90},
 messages:{type:[messageSchema],default:[]}
},{timestamps:true});
conversationSchema.index({user:1,updatedAt:-1});
export default mongoose.model('Conversation',conversationSchema);
