
import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import ordersRoutes from './routes/orders.js';
import membersRoutes from './routes/members.js';


const app = express();
app.use(compression());


app.get('/', async (req, res) => {
  try {
    res.json("Working server");
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Add routes
app.use('/', ordersRoutes);
app.use('/', membersRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

