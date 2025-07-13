import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const apiSecret = 'g7vvnduvjs2qec5h4t9taj8wh38sq2ja8ym3yqfdybdgzsaeg82ppdxwpxt4v8kg'; // Stream API Secret (keep this safe!)

// Endpoint to generate a dev token for a userId
router.get('/dev-token/:userId', (req, res) => {
  const { userId } = req.params;
  const apiKeyFromClient = req.query.apiKey;
  // Optional: log or validate the apiKeyFromClient here
  try {
    const payload = { user_id: userId };
    const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
