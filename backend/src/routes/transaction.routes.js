const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      sort = '-createdAt',
      page = '1',
      limit = '20',
      from,
      to,
    } = req.query;

    const filters = { userId: req.user.id };
    if (category) filters.category = category;
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) filters.createdAt.$lte = new Date(to);
    }
    if (q) {
      filters.$or = [
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    // Build sort object, supports e.g. "-createdAt", "amount", "-amount"
    const sortObj = {};
    String(sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((key) => {
        if (key.startsWith('-')) sortObj[key.slice(1)] = -1;
        else sortObj[key] = 1;
      });

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Transaction.find(filters).sort(sortObj).skip(skip).limit(limitNum),
      Transaction.countDocuments(filters),
    ]);

    return res.json({ items, page: pageNum, limit: limitNum, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, currency = 'ZAR', description, category } = req.body;
    if (amount == null || isNaN(amount)) {
      return res.status(400).json({ message: 'Amount must be provided' });
    }

    const tx = await Transaction.create({
      userId: req.user.id,
      amount,
      currency,
      description,
      category,
      status: 'completed',
    });

    return res.status(201).json(tx);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// CSV export endpoint (must be BEFORE parameterized routes)
router.get('/export/csv', async (req, res) => {
  try {
    const { q, category, sort = '-createdAt', from, to } = req.query;

    const filters = { userId: req.user.id };
    if (category) filters.category = category;
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) filters.createdAt.$lte = new Date(to);
    }
    if (q) {
      filters.$or = [
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const sortObj = {};
    String(sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((key) => {
        if (key.startsWith('-')) sortObj[key.slice(1)] = -1;
        else sortObj[key] = 1;
      });

    const items = await Transaction.find(filters).sort(sortObj);

    // Build CSV
    const headers = ['date', 'amount', 'currency', 'category', 'description', 'status'];
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const rows = [headers.join(',')].concat(
      items.map((it) =>
        [
          new Date(it.createdAt).toISOString(),
          it.amount,
          it.currency,
          it.category || 'Uncategorized',
          it.description || '',
          it.status,
        ]
          .map(esc)
          .join(',')
      )
    );
    const csv = rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    return res.send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const { amount, description, category, currency, status } = req.body;
    const update = {};
    if (amount != null) update.amount = amount;
    if (description != null) update.description = description;
    if (category != null) update.category = category;
    if (currency != null) update.currency = currency;
    if (status != null) update.status = status;

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: update },
      { new: true }
    );
    if (!tx) return res.status(404).json({ message: 'Not found' });
    return res.json(tx);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Category summary
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { userId: req.user.id };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const agg = await Transaction.aggregate([
      { $match: match },
      { $group: {
          _id: { category: { $ifNull: ['$category', 'Uncategorized'] } },
          income: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } },
          net: { $sum: '$amount' },
          count: { $sum: 1 },
        }
      },
      { $project: { _id: 0, category: '$_id.category', income: 1, expense: 1, net: 1, count: 1 } },
      { $sort: { net: -1 } }
    ]);

    return res.json(agg);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// CSV import endpoint (multipart/form-data, field name: "file")
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const text = req.file.buffer.toString('utf8');
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });

    const docs = [];
    for (const r of records) {
      // Accept headers: date, amount, currency, category, description, status
      const amount = Number(r.amount);
      if (Number.isNaN(amount)) continue;
      const currency = (r.currency || 'ZAR').toString();
      const category = r.category ? String(r.category) : undefined;
      const description = r.description ? String(r.description) : undefined;
      const status = r.status && ['pending','completed','failed'].includes(String(r.status)) ? String(r.status) : 'completed';
      const createdAt = r.date ? new Date(r.date) : undefined;

      const doc = {
        userId: req.user.id,
        amount,
        currency,
        description,
        category,
        status,
      };
      if (!Number.isNaN(createdAt?.getTime?.())) {
        doc.createdAt = createdAt;
        doc.updatedAt = createdAt;
      }
      docs.push(doc);
    }

    if (docs.length === 0) {
      return res.status(400).json({ message: 'No valid rows found in CSV' });
    }

    // Insert many; allow schema timestamps to set when not provided
    const inserted = await Transaction.insertMany(docs, { ordered: false });
    return res.json({ inserted: inserted.length });
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
