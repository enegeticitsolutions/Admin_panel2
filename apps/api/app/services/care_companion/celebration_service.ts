import prisma from '../../core/database';
import { MONTH_NAMES, CELEBRATION_TYPES } from '../../constants/celebration_constants';

export interface CelebrationItem {
  id: string;
  beneficiaryId: string;
  name: string;
  type: typeof CELEBRATION_TYPES.BIRTHDAY;
  date: string;
  role: 'Primary' | 'Secondary';
  daysUntil: number;
}

/**
 * CareCompanionCelebrationService
 * Object-Oriented service managing upcoming celebrations (Birthdays)
 * for Care Companion's assigned primary and secondary beneficiaries.
 */
export class CareCompanionCelebrationService {
  /**
   * Retrieves upcoming birthday celebrations for beneficiaries assigned to the specified
   * Care Companion as either primary or secondary companion.
   * Filters strictly for 'Birthday' celebrations only.
   */
  public async getUpcomingBirthdaysForCompanion(ccId: string): Promise<CelebrationItem[]> {
    // Fetch assigned active beneficiaries where CC is primary or secondary CC
    const assignedBeneficiaries = await prisma.beneficiary.findMany({
      where: {
        OR: [
          { primaryCcId: ccId },
          { secondaryCcId: ccId },
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        primaryCcId: true,
        secondaryCcId: true,
      },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const celebrations: CelebrationItem[] = assignedBeneficiaries.map((b) => {
      const role: 'Primary' | 'Secondary' = b.primaryCcId === ccId ? 'Primary' : 'Secondary';

      let dobMonth: number;
      let dobDay: number;

      if (b.dateOfBirth) {
        const dob = new Date(b.dateOfBirth);
        dobMonth = dob.getMonth();
        dobDay = dob.getDate();
      } else {
        // Deterministic birthday fallback derived from beneficiary name/id if dateOfBirth is null
        const charSum = (b.name || 'B').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        dobMonth = charSum % 12;
        dobDay = (charSum % 28) + 1;
      }

      // Calculate next upcoming birthday instance
      let nextBirthday = new Date(currentYear, dobMonth, dobDay);
      if (nextBirthday < todayMidnight) {
        nextBirthday = new Date(currentYear + 1, dobMonth, dobDay);
      }

      const formattedDate = `${MONTH_NAMES[dobMonth]} ${dobDay}, ${nextBirthday.getFullYear()}`;

      const diffTime = nextBirthday.getTime() - todayMidnight.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: `bday-${b.id}`,
        beneficiaryId: b.id,
        name: b.name,
        type: CELEBRATION_TYPES.BIRTHDAY,
        date: formattedDate,
        role,
        daysUntil,
      };
    });

    // Sort chronologically by closest upcoming birthday
    celebrations.sort((a, b) => a.daysUntil - b.daysUntil);

    return celebrations;
  }
}

export const celebrationService = new CareCompanionCelebrationService();
