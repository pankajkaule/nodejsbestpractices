// routes/order.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Order = require('../models/order');

// Get all orders (admin access)
router.get('/', authenticate, async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find().populate('userId', 'username');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders for the authenticated user
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount } = req.body;
    const order = new Order({ userId, items, totalAmount });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'username');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Check if the user is authorized to access the order
    if (!order.userId.equals(req.userId) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an order (admin access)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const order = await Order.findByIdAndRemove(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
