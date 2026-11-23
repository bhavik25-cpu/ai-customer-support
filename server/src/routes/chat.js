import { Router } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { askOpenRouter } from '../services/openrouter.js';

const router = Router();
router.use(requireAuth);

router.get('/conversations', asyncHandler(async (req, res) => {
  const rows = await Conversation.find({ user: req.userId })
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    conversations: rows.map(item => ({
      id: item._id,
      title: item.title,
      updatedAt: item.updatedAt,
      preview: item.messages.at(-1)?.content?.slice(0, 80) || ''
    }))
  });
}));

// PDF requirement: return the authenticated user's previous chat logs.
router.get('/history', asyncHandler(async (req, res) => {
  const history = await Conversation.find({ user: req.userId })
    .sort({ updatedAt: -1 })
    .select('title messages createdAt updatedAt')
    .lean();

  res.json({
    history: history.map(item => ({
      id: item._id,
      title: item.title,
      messages: item.messages,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  });
}));

router.post('/conversations', asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({ user: req.userId });
  res.status(201).json({
    conversation: {
      id: conversation._id,
      title: conversation.title,
      messages: []
    }
  });
}));

router.get('/conversations/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid conversation ID.' });
  }

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    user: req.userId
  }).lean();

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  res.json({
    conversation: {
      id: conversation._id,
      title: conversation.title,
      messages: conversation.messages
    }
  });
}));

router.delete('/conversations/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid conversation ID.' });
  }

  const result = await Conversation.findOneAndDelete({
    _id: req.params.id,
    user: req.userId
  });

  if (!result) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  res.json({ message: 'Conversation deleted.' });
}));

router.post('/send', asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  const conversationId = req.body.conversationId;

  if (!message) {
    return res.status(400).json({ message: 'Please enter a message.' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ message: 'Message is too long (maximum 4,000 characters).' });
  }

  let conversation;
  if (conversationId) {
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID.' });
    }
    conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.userId
    });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
  } else {
    conversation = await Conversation.create({ user: req.userId });
  }

  conversation.messages.push({ role: 'user', content: message });
  if (conversation.messages.length === 1) {
    conversation.title = message.replace(/\s+/g, ' ').slice(0, 55);
  }
  await conversation.save();

  const answer = await askOpenRouter(
    conversation.messages.map(item => ({
      role: item.role,
      content: item.content
    }))
  );

  conversation.messages.push({ role: 'assistant', content: answer });
  await conversation.save();

  res.json({
    conversationId: conversation._id,
    title: conversation.title,
    userMessage: conversation.messages.at(-2),
    assistantMessage: conversation.messages.at(-1)
  });
}));

export default router;
