import prisma from '../../core/database';
import { ApiError } from '../../utils/ApiError';

import { isSathiBenefit } from '../../constants/systemBenefits';

export const getBeneficiarySathiEligibility = async (beneficiaryId: string) => {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      beneficiaryId,
      isActive: true
    },
    include: {
      packageVersion: {
        include: {
          versionBenefits: {
            include: {
              benefit: {
                include: { benefitType: true }
              }
            }
          }
        }
      },
      benefitBalances: {
        include: {
          benefit: {
            include: { benefitType: true }
          }
        }
      }
    }
  });

  let eligible = false;
  let remainingUnits = 0;
  let sathiBalanceId = null;

  for (const sub of activeSubscriptions) {
    if (sub.benefitBalances && sub.benefitBalances.length > 0) {
      for (const bal of sub.benefitBalances) {
        if (isSathiBenefit(bal.benefit)) {
          const remaining = bal.totalUnits - bal.usedUnits;
          if (remaining > 0) {
            eligible = true;
            remainingUnits += remaining;
            sathiBalanceId = bal.id;
          }
        }
      }
    }

    if (!eligible && sub.packageVersion?.versionBenefits) {
      for (const pvb of sub.packageVersion.versionBenefits) {
        if (isSathiBenefit(pvb.benefit)) {
          const remaining = pvb.unitsIncluded;
          if (remaining > 0 || pvb.isUnlimited) {
            eligible = true;
            remainingUnits += pvb.isUnlimited ? 999 : remaining;
          }
        }
      }
    }
  }

  return { eligible, remainingUnits, sathiBalanceId };
};

export const createSathiVisitRequest = async (beneficiaryId: string, dateTime: string, reason: string, targetVolunteerId?: string) => {
  const { eligible } = await getBeneficiarySathiEligibility(beneficiaryId);
  if (!eligible) {
    throw new ApiError(400, 'Your active subscription does not include Sathi Companion hours/benefits, or you have run out of units.');
  }

  const request = await prisma.sathiVisitRequest.create({
    data: {
      beneficiaryId,
      dateTime: new Date(dateTime),
      reason,
      status: 'PENDING',
      volunteerId: targetVolunteerId || null
    },
    include: {
      beneficiary: true
    }
  });

  return request;
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export const getLinkedVolunteers = async (beneficiaryId: string) => {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: beneficiaryId },
    select: { latitude: true, longitude: true }
  });

  const assignments = await prisma.volunteerAssignment.findMany({
    where: { beneficiaryId, isActive: true },
    include: {
      volunteer: {
        include: {
          reviews: true
        }
      }
    }
  });

  return assignments.map(a => {
    const v = a.volunteer;
    
    let rating = 0;
    let reviewCount = 0;
    if (v.reviews && v.reviews.length > 0) {
      const sum = v.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0);
      rating = sum / v.reviews.length;
      reviewCount = v.reviews.length;
    } else {
      rating = Math.min(5, Math.max(3, 3 + (v.totalCreditPoints / 100)));
    }
    
    let distanceStr = v.city ? `${v.city}${v.state ? `, ${v.state}` : ''}` : (v.address || 'Nearby');
    if (beneficiary?.latitude && beneficiary?.longitude && v.latitude && v.longitude) {
      const dist = calculateDistance(beneficiary.latitude, beneficiary.longitude, v.latitude, v.longitude);
      distanceStr = `${dist.toFixed(1)} km`;
    }

    return {
      id: v.id,
      name: v.name,
      photo: v.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
      rating: rating.toFixed(1),
      reviewCount: reviewCount,
      distance: distanceStr, 
      location: v.city ? `${v.city}${v.state ? `, ${v.state}` : ''}` : (v.address || 'Nearby'),
      hours: v.totalCreditHours.toFixed(1),
      bio: v.previousExperience || v.whyJoin || 'Volunteer passionate about community support.',
      availability: (v as any).availability || [],
      languages: (v as any).languages || [],
      interests: (v as any).interests || []
    };
  });
};

export const getBeneficiarySathiRequests = async (beneficiaryId: string) => {
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  await prisma.sathiVisitRequest.updateMany({
    where: {
      beneficiaryId,
      status: { in: ['PENDING', 'ACCEPTED'] },
      dateTime: { lt: threeHoursAgo }
    },
    data: {
      status: 'REJECTED',
      rejectionReason: 'Automatically marked as not completed due to timeout.'
    }
  });

  const requests = await prisma.sathiVisitRequest.findMany({
    where: { beneficiaryId },
    include: {
      volunteer: {
        select: {
          name: true,
          profilePhoto: true
        }
      }
    },
    orderBy: { dateTime: 'desc' }
  });
  return requests;
};

export const respondToSathiReschedule = async (beneficiaryId: string, requestId: string, action: 'ACCEPT' | 'REJECT') => {
  const request = await prisma.sathiVisitRequest.findUnique({
    where: { id: requestId }
  });

  if (!request || request.beneficiaryId !== beneficiaryId) {
    throw new ApiError(404, 'Sathi visit request not found.');
  }

  if (request.status !== 'RESCHEDULE_PROPOSED') {
    throw new ApiError(400, 'Request is not in a rescheduled state.');
  }

  if (action === 'ACCEPT') {
    if (!request.proposedDateTime) {
      throw new ApiError(400, 'No proposed date time available to accept.');
    }
    const updatedRequest = await prisma.sathiVisitRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        dateTime: request.proposedDateTime,
        rejectionReason: null
      }
    });
    return updatedRequest;
  } else {
    const updatedRequest = await prisma.sathiVisitRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectionReason: 'Beneficiary declined the reschedule proposal.'
      }
    });
    return updatedRequest;
  }
};

export const completeSathiVisit = async (beneficiaryId: string, requestId: string) => {
  const request = await prisma.sathiVisitRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new ApiError(404, 'Sathi visit request not found.');
  }

  if (request.beneficiaryId !== beneficiaryId) {
    throw new ApiError(403, 'You do not have permission to modify this visit request.');
  }

  if (request.status !== 'IN_PROGRESS') {
    throw new ApiError(400, 'This visit is not in progress and cannot be completed.');
  }

  // First update SathiVisitRequest to COMPLETED (without actualDurationMinutes yet)
  const updatedRequest = await prisma.sathiVisitRequest.update({
    where: { id: requestId },
    data: {
      status: 'COMPLETED'
    }
  });

  // Automatically check out the Saathi's active visit log with exact time
  if (request.volunteerId) {
    const activeLog = await prisma.volunteerVisitLog.findFirst({
      where: {
        beneficiaryId,
        volunteerId: request.volunteerId,
        status: 'in_progress'
      }
    });

    if (activeLog) {
      const checkOutTime = new Date();
      const rawMinutes = (checkOutTime.getTime() - activeLog.checkInTime.getTime()) / 60000;
      const hoursEarned = rawMinutes / 60;
      
      const config = await prisma.systemConfig.findUnique({ where: { key: 'SATHI_CREDIT_RATE' } });
      const creditRate = parseFloat(config ? config.value : '10');
      const pointsEarned = hoursEarned * creditRate;
      await prisma.$transaction(async (tx) => {
        // Update the actualDurationMinutes
        await tx.sathiVisitRequest.update({
          where: { id: requestId },
          data: { actualDurationMinutes: rawMinutes }
        });

        if (activeLog.subscriptionBenefitBalanceId) {
          await tx.subscriptionBenefitBalance.update({
            where: { id: activeLog.subscriptionBenefitBalanceId },
            data: { usedUnits: { increment: hoursEarned } }
          });
        }

        const volunteer = await tx.volunteer.findUnique({
          where: { id: activeLog.volunteerId }
        });

        if (volunteer) {
          await tx.volunteer.update({
            where: { id: volunteer.id },
            data: {
              totalCreditHours: volunteer.totalCreditHours + hoursEarned,
              totalCreditPoints: volunteer.totalCreditPoints + pointsEarned
            }
          });

          await tx.volunteerCreditTransaction.create({
            data: {
              volunteerId: volunteer.id,
              visitLogId: activeLog.id,
              type: 'earned',
              minutesDelta: rawMinutes,
              pointsDelta: pointsEarned,
              balanceAfter: volunteer.totalCreditPoints + pointsEarned,
              description: `Visit Verified`
            }
          });
        }

        await tx.volunteerVisitLog.update({
          where: { id: activeLog.id },
          data: {
            checkOutTime,
            minutesLogged: rawMinutes,
            hoursEarned,
            creditPointsEarned: pointsEarned,
            status: 'completed'
          }
        });
      });
    }
  }

  return { request: updatedRequest, message: 'Visit marked as completed successfully and Sathi hours logged.' };
};

export const submitVolunteerReview = async (volunteerId: string, beneficiaryId: string, rating: number, reviewText?: string) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const review = await prisma.volunteerReview.create({
    data: {
      volunteerId,
      beneficiaryId,
      rating,
      reviewText: reviewText || null
    }
  });

  return review;
};

export const getVolunteerReviews = async (volunteerId: string) => {
  const reviews = await prisma.volunteerReview.findMany({
    where: { volunteerId },
    include: {
      beneficiary: {
        select: {
          name: true,
          photo: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return reviews;
};
