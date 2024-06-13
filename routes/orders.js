import express from 'express';
import { wixClient, imagekit } from '../wixClient.js';
import { getMemberData } from '../utils/getMemberDetails.js';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const router = express.Router();



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/order-list-management', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0,
      orderStatuses: ['ACTIVE', 'PAUSED'],
      paymentStatuses: ['PAID', 'PENDING'],

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


router.get('/file-export-orders', async (req, res) => {
  try {
    const options = {
      limit: 50,
      offset: req.query.offset || 0,
      orderStatuses: ['ACTIVE', 'PAUSED'],
      paymentStatuses: ['PAID', 'PENDING'],

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Plan ID', key: 'planId', width: 30 },
      { header: 'Subscription ID', key: 'subscriptionId', width: 30 },
      { header: 'Order ID', key: 'wixPayOrderId', width: 30 },
      { header: 'Buyer Name', key: 'buyerName', width: 30 },
      { header: 'Buyer Email', key: 'buyerEmail', width: 30 },
      { header: 'Total Price', key: 'totalPrice', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Order Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'lastPaymentStatus', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 30 }
    ];


    // Add rows
    ordersWithBuyerData.forEach(order => {
      const buyerContact = order.buyer?.nickname?.contact || {};
      worksheet.addRow({
        planId: order.planId,
        subscriptionId: order.subscriptionId,
        wixPayOrderId: order.wixPayOrderId,
        buyerName: `${buyerContact.firstName || ''} ${buyerContact.lastName || ''}`,
        buyerEmail: order.buyer.nickname.loginEmail,
        totalPrice: order.priceDetails.total,
        currency: order.priceDetails.currency,
        status: order.status,
        lastPaymentStatus: order.lastPaymentStatus,
        startDate: order.startDate
      });
    });

    // Ensure the temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write the workbook to a file
    const filePath = path.join(tempDir, 'orders.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Read the file and upload it to ImageKit
    fs.readFile(filePath, async (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        const result = await imagekit.upload({
          file: data,
          fileName: 'orders.xlsx',
          tags: ['orders']
        });

        // Return the file URL
        res.json({ fileUrl: result.url });

        // Clean up the temporary file
        fs.unlink(filePath, (unlinkError) => {
          if (unlinkError) {
            console.error('Error deleting temporary file:', unlinkError);
          }
        });
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




export default router;