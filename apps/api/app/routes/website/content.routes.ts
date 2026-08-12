import { Router, Request, Response } from 'express';
import prisma from '../../core/database';

const router = Router();

/**
 * GET /api/website/health
 * Simple health check for the website API.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'Website API running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/website/content/sathi
 * Returns dynamic CMS content for the Saathi page, active Saathi profiles,
 * and live aggregate stats (volunteer count & total hours).
 */
router.get('/content/sathi', async (_req: Request, res: Response) => {
  try {
    const content = await (prisma as any).websiteContent.findUnique({
      where: { pageKey: 'sathi_page' },
    });

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Fetch up to 4 approved volunteers for the "Meet our Saathis" section
    const saathisRaw = await (prisma as any).volunteer.findMany({
      where: { applicationStatus: 'APPROVED' },
      take: 4,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        streetArea: true,
        totalCreditHours: true,
        profilePhoto: true,
      },
    });

    const saathis = saathisRaw.map((s: any) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      state: s.state,
      area: s.streetArea || null,
      totalCreditHours: s.totalCreditHours || 0,
      profilePhoto: s.profilePhoto || null,
    }));

    // Aggregate live stats for the hero section
    const volunteerStats = await (prisma as any).volunteer.aggregate({
      where: { applicationStatus: 'APPROVED' },
      _count: true,
      _sum: { totalCreditHours: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        content: content.content,
        saathis,
        liveStats: {
          activeCount: volunteerStats._count || 0,
          totalHours: volunteerStats._sum.totalCreditHours || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ [Website Content Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching content.',
    });
  }
});

export default router;
