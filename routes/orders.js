import express from 'express';
import { wixClient } from '../wixClient.js';
import { getMemberData } from '../utils/getMemberDetails.js';

const router = express.Router();

router.get('/order-list-management', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit || 30,
      offset: req.query.offset || 0,
    };
    const response = await wixClient.orders.managementListOrders(options);

    if (!Array.isArray(response.orders)) {
      console.error('Orders not found in response:', response);
      return res.status(500).json({ error: 'Orders not found in response' });
    }

    const ordersWithBuyerData = await Promise.all(response.orders.map(async order => {
      const buyerNickname = await getMemberData(order.buyer.memberId);
      return { ...order, buyer: { ...order.buyer, nickname: buyerNickname } };
    }));

    res.json(ordersWithBuyerData);
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;