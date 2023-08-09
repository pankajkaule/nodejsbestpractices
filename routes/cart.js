// routes/cart.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Cart = require('../models/cart');
const Order = require('../models/order');

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req, res) => {
    try {
      const userId = req.userId;
      const { productId, quantity } = req.body;
  
      console.log('userId:', userId);
      console.log('productId:', productId);
      console.log('quantity:', quantity);
  
      let cart = await Cart.findOneAndUpdate(
        { userId },
        { $push: { items: { productId, quantity } } },
        { new: true }
      ).populate('items.productId');
  
      console.log('cart:', cart);
  
      if (!cart) {
        cart = new Cart({ userId, items: [] });
        await cart.save();
        return res.status(404).json({ message: 'Cart not found new cart is created now try again' });

      }
  
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Create order from cart
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);
    const order = new Order({ userId, items: cart.items, totalAmount });
    await order.save();
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.status(201).json({ message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
