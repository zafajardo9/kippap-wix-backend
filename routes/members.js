import express from 'express';
import { wixClient } from '../wixClient.js';
import { getMemberData } from '../utils/getMemberDetails.js';

const router = express.Router();

router.get('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await getMemberData(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Error getting member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;