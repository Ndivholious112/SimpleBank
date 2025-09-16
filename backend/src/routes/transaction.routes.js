const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, currency = 'USD', description } = req.body;
    if (amount == null || isNaN(amount)) {
      return res.status(400).json({ message: 'Amount must be provided' });
    }

    const tx = await Transaction.create({
      userId: req.user.id,
      amount,
      currency,
      description,
      status: 'completed',
    });

    return res.status(201).json(tx);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    return res.json(tx);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
