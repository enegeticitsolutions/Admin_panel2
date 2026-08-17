import { Router, Request, Response } from 'express';
import { authenticate } from '../shared/deps';
import prisma from '../../core/database';
import { config } from '../../core/config';
import { autoUpdateMissedVisits } from '../../services/care_companion/visit_service';
import { celebrationService } from '../../services/care_companion/celebration_service';
import { celebrationNotificationService } from '../../services/care_companion/celebration_notification_service';

const router = Router();

// GET /api/care-companion/dashboard
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From authenticate middleware

    // Run auto-transition check
    await autoUpdateMissedVisits();

    // 1. Get Care Companion Profile
    const cc = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        careCompanionProfile: true,
      },
    });

    if (!cc || !cc.careCompanionProfile) {
      return res.status(404).json({ success: false, message: 'Care Companion profile not found' });
    }

    const ccId = cc.careCompanionProfile.id;

    // 2. Calculate Today's Stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysVisits = await prisma.visit.findMany({
      where: {
        careCompanionId: ccId,
        scheduledTime: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: { not: 'cancelled' },
      },
      include: {
        beneficiary: true,
      }
    });

    const todaysVisitsCount = todaysVisits.length;
    const todaysHoursSum = todaysVisits.reduce((sum, v) => sum + (v.durationMinutes || 0), 0) / 60;

    // 3. Find Next Upcoming Visit
    const upcomingVisit = await prisma.visit.findFirst({
      where: {
        careCompanionId: ccId,
        scheduledTime: {
          gte: startOfToday,
        },
        status: { in: ['scheduled', 'in_progress'] },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      include: {
        beneficiary: true,
      }
    });

    let nextVisit = null;
    if (upcomingVisit) {
      const ben = upcomingVisit.beneficiary;
      const formattedTime = upcomingVisit.scheduledTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const fullAddress = [ben?.flatPlot, ben?.streetArea, ben?.landmark, ben?.city]
        .filter(Boolean)
        .join(', ') || ben?.address || 'Address not specified';

      nextVisit = {
        id: upcomingVisit.id,
        visitCode: upcomingVisit.visitCode || upcomingVisit.encounterId,
        patientName: ben?.name || 'Unknown Beneficiary',
        type: upcomingVisit.notes ? 'Special Care' : 'Home Visit',
        // Full structured address for display + navigation
        address: fullAddress,
        flatPlot: ben?.flatPlot || null,
        streetArea: ben?.streetArea || null,
        landmark: ben?.landmark || null,
        city: ben?.city || null,
        state: ben?.state || null,
        pincode: ben?.pincode || null,
        latitude: ben?.latitude || null,
        longitude: ben?.longitude || null,
        time: formattedTime,
        scheduledTime: upcomingVisit.scheduledTime.toISOString(),
        durationMinutes: upcomingVisit.durationMinutes,
        distance: '—', // Computed on-device if needed via coords
        status: upcomingVisit.status,
      };
    }

    // 4. Retrieve Celebrations (Birthdays of assigned primary/secondary beneficiaries)
    const celebrations = await celebrationService.getUpcomingBirthdaysForCompanion(ccId);

    // 5. Non-blocking Catch-Up Push Notification check for birthdays (1 day before & on the day)
    setImmediate(() => {
      celebrationNotificationService.checkAndDispatchCelebrationNotificationsForCompanion(cc.id, ccId);
    });

    res.json({
      success: true,
      data: {
        user: {
          id: cc.id,
          name: cc.name,
          firstName: cc.name?.split(' ')[0] || 'Care Companion',
        },
        stats: {
          todaysVisits: todaysVisitsCount,
          hoursToday: Math.round(todaysHoursSum * 10) / 10,
        },
        nextVisit,
        celebrations: celebrations.slice(0, config.notifications.maxCelebrationsDashboard),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
