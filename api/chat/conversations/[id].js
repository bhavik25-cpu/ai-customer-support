import vercelHandler from '../../../server/src/vercelHandler.js';

export default function handler(req, res) {
  const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;

  if (!id || !/^[a-fA-F0-9]{24}$/.test(String(id))) {
    return res.status(400).json({ message: 'Invalid conversation ID.' });
  }

  return vercelHandler(req, res, '/api/chat/conversations/' + id);
}
