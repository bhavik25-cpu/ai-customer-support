import vercelHandler from '../../server/src/vercelHandler.js';

export default function handler(req, res) {
  return vercelHandler(req, res, '/api/auth/logout');
}
