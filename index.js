import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { orders } from "@wix/pricing-plans";
import { members } from "@wix/members";
import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';

dotenv.config();    

const app = express();
app.use(compression());

const wixClient = createClient({
    modules: { orders, members },
    auth: ApiKeyStrategy({
      siteId: process.env.SITE_ID,
      apiKey: process.env.API_KEY,
    }),
  });

  async function getMemberData(memberId, options) {
    try {
      const response = await wixClient.members.getMember(memberId);
      return response;
    } catch (error) {
      console.error('Error getting member:', error);
      throw error; 
    }
  }

  app.get('/', async (res) => {
    try {
      res.json("Working server");
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/order-list-management', async (req, res) => {
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

  app.get('/members/:id', async (req, res) => {
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

  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });


