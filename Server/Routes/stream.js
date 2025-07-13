import express from 'express';
import { StreamVideoServerClient } from '@stream-io/video-node';

const router = express.Router();

const apiKey = 'aemwtenush72';
const apiSecret = 'YOUR_STREAM_API_SECRET'; // TODO: Replace with your real Stream API Secret (keep this safe!)

const streamServerClient = new StreamVideoServerClient({ apiKey, apiSecret });

// Endpoint to generate a dev token for a userId
router.get('/dev-token/:userId', (req, res) => {
  const { userId } = req.params;
  try {
    const token = streamServerClient.getDevToken(userId);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
