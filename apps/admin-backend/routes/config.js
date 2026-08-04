const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');

// ── GET /api/config ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const configs = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' }
    });
    res.json({ success: true, data: configs });
  } catch (err) {
    console.error('GET /api/config error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch system configurations' });
  }
});

// ── PUT /api/config/:key ─────────────────────────────────────────────────────
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, group } = req.body;

    const updated = await prisma.systemConfig.update({
      where: { key },
      data: {
        value: String(value),
        ...(description !== undefined ? { description } : {}),
        ...(group !== undefined ? { group } : {})
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /api/config/:key error:', req.params.key, err);
    res.status(500).json({ success: false, message: 'Failed to update system configuration' });
  }
});

// ── POST /api/config ─────────────────────────────────────────────────────────
// Upsert: creates if not exists, updates if it does
router.post('/', async (req, res) => {
  try {
    const { key, value, description, group } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'key and value are required' });
    }

    const upserted = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: String(value),
        ...(description !== undefined ? { description } : {}),
        ...(group !== undefined ? { group } : {}),
      },
      create: {
        key,
        value: String(value),
        description: description || null,
        group: group || null,
      },
    });

    res.status(201).json({ success: true, data: upserted });
  } catch (err) {
    console.error('POST /api/config error:', err);
    res.status(500).json({ success: false, message: 'Failed to upsert configuration' });
  }
});

module.exports = router;
