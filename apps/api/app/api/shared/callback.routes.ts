import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../../core/database';

const router = Router();

const callbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many callback requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── POST /api/shared/callbacks ─────────────────────────────────────────────
router.post('/', callbackLimiter as unknown as RequestHandler, async (req, res) => {
    try {
        const { name, phone, subscriberId, beneficiaryId, notes } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and phone are required' });
        }

        const callback = await prisma.callbackRequest.create({
            data: {
                name,
                phone,
                subscriberId: subscriberId || null,
                beneficiaryId: beneficiaryId || null,
                notes: notes || null,
                status: 'pending'
            }
        });

        res.status(201).json({ success: true, data: callback });
    } catch (err) {
        console.error('POST /callbacks error:', err);
        res.status(500).json({ success: false, message: 'Failed to submit callback request' });
    }
});

export default router;
