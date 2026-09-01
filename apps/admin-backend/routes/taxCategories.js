const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');

const PRESETS = [
  { code: 'GST_18', name: 'Standard Companion / Support Service (18% GST)', gstRate: 18, hsnSacCode: '998399', isExempt: false },
  { code: 'GST_EXEMPT', name: 'Healthcare Clinical Service (GST Exempt - 0%)', gstRate: 0, hsnSacCode: '999312', isExempt: true },
  { code: 'GST_5', name: 'Concessional Transport / Medical (5% GST)', gstRate: 5, hsnSacCode: '999333', isExempt: false },
  { code: 'GST_12', name: 'Medical Goods & Supplies (12% GST)', gstRate: 12, hsnSacCode: '3004', isExempt: false },
  { code: 'NON_TAXABLE', name: 'Non-Taxable Service (0%)', gstRate: 0, hsnSacCode: null, isExempt: true },
];

// GET /api/tax-categories — list all categories (seeds defaults if empty)
router.get('/', async (req, res) => {
  try {
    let list = await prisma.taxCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (list.length === 0) {
      // Seed default presets
      for (const preset of PRESETS) {
        await prisma.taxCategory.upsert({
          where: { code: preset.code },
          create: preset,
          update: preset,
        });
      }
      list = await prisma.taxCategory.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    res.json({ success: true, data: list });
  } catch (err) {
    console.error('GET tax-categories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tax-categories — create a custom tax category
router.post('/', async (req, res) => {
  const { name, gstRate, hsnSacCode, isExempt, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Tax category name is required' });
  }

  try {
    const rate = gstRate !== undefined && gstRate !== null ? parseFloat(gstRate) : 18;
    const exempt = isExempt !== undefined ? Boolean(isExempt) : (rate === 0);
    const sanitized = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15);
    const code = `TAX_${sanitized}_${Date.now().toString().slice(-4)}`;

    const created = await prisma.taxCategory.create({
      data: {
        code,
        name: name.trim(),
        gstRate: rate,
        hsnSacCode: hsnSacCode ? hsnSacCode.trim() : null,
        isExempt: exempt,
        description: description ? description.trim() : null,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('POST tax-categories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tax-categories/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    await prisma.taxCategory.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Tax category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
