const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { emergencyEvents } = require('../services/events');

// GET all emergency requests
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const requests = await prisma.emergencyRequest.findMany({
      where,
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                profilePhoto: true,
                location: true,
                flatPlot: true,
                streetArea: true,
                landmark: true,
                city: true,
                state: true,
                pincode: true,
                latitude: true,
                longitude: true
              }
            },
            subscriber: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            },
            primaryCC: {
              include: {
                user: {
                  select: { id: true, name: true, phone: true }
                }
              }
            },
            secondaryCC: {
              include: {
                user: {
                  select: { id: true, name: true, phone: true }
                }
              }
            },
            emergencyContacts: {
              select: {
                id: true,
                name: true,
                phone: true,
                relationship: true,
                isPrimary: true
              }
            },
            team: {
              include: {
                fieldManager: {
                  include: {
                    user: {
                      select: { id: true, name: true, phone: true }
                    }
                  }
                }
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Resolve Field Manager from Zone if not set directly on Team
    const zones = await prisma.zone.findMany({
      where: { fieldManagerId: { not: null } },
      include: {
        fieldManagerUser: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    const enrichedRequests = requests.map((reqItem) => {
      const b = reqItem.beneficiary;
      if (!b) return reqItem;

      let fmName = b.team?.fieldManager?.user?.name || b.team?.fieldManager?.name || null;
      let fmPhone = b.team?.fieldManager?.user?.phone || null;

      // Fallback: match by pincode to zone
      if (!fmName && (b.pincode || b.user?.pincode)) {
        const pin = (b.pincode || b.user?.pincode || '').trim();
        const matchingZone = zones.find((z) => Array.isArray(z.pincodes) && z.pincodes.includes(pin));
        if (matchingZone && matchingZone.fieldManagerUser) {
          fmName = matchingZone.fieldManagerUser.name;
          fmPhone = matchingZone.fieldManagerUser.phone;
        }
      }

      return {
        ...reqItem,
        beneficiary: {
          ...b,
          fieldManager: fmName ? { name: fmName, phone: fmPhone } : null
        }
      };
    });

    res.json({ success: true, data: enrichedRequests });
  } catch (error) {
    console.error('Error fetching emergency requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency requests' });
  }
});

// UPDATE emergency request status

router.put('/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const existing = await prisma.emergencyRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    let deductionNote = '';


    // Financial-Grade Ledger: Handle BenefitReservation transition (HELD -> CONSUMED or HELD -> RELEASED)
    const reservation = await prisma.benefitReservation.findUnique({
      where: { emergencyRequestId: id },
      include: { balance: true }
    });

    if (reservation && reservation.status === 'HELD') {
      const units = reservation.units;
      const bal = reservation.balance;

      const totalBefore = bal.totalUnits;
      const reservedBefore = bal.reservedUnits;
      const usedBefore = bal.usedUnits;
      const availableBefore = Math.max(0, totalBefore - reservedBefore - usedBefore);

      if (status === 'resolved') {
        // HELD -> CONSUMED
        const reservedAfter = Math.max(0, reservedBefore - units);
        const usedAfter = usedBefore + units;
        const availableAfter = availableBefore;

        await prisma.$transaction([
          prisma.benefitReservation.update({
            where: { id: reservation.id },
            data: { status: 'CONSUMED' }
          }),
          prisma.benefitTransaction.create({
            data: {
              balanceId: bal.id,
              reservationId: reservation.id,
              transactionType: 'CONSUMED',
              units: units,
              totalBefore, totalAfter: totalBefore,
              reservedBefore, reservedAfter,
              usedBefore, usedAfter,
              availableBefore, availableAfter,
              reason: `Emergency SOS Ticket Resolved: ${existing.ticketNumber}`,
              performedByUserId: req.user?.id || null
            }
          }),
          prisma.subscriptionBenefitBalance.update({
            where: { id: bal.id },
            data: { reservedUnits: reservedAfter, usedUnits: usedAfter, availableUnits: availableAfter }
          })
        ]);
        deductionNote = ` (1 Emergency unit consumed from reserved balance)`;
      } else if (status === 'cancelled' || status === 'rejected') {
        // HELD -> RELEASED
        const reservedAfter = Math.max(0, reservedBefore - units);
        const usedAfter = usedBefore;
        const availableAfter = availableBefore + units;

        await prisma.$transaction([
          prisma.benefitReservation.update({
            where: { id: reservation.id },
            data: { status: 'RELEASED' }
          }),
          prisma.benefitTransaction.create({
            data: {
              balanceId: bal.id,
              reservationId: reservation.id,
              transactionType: 'RELEASED',
              units: units,
              totalBefore, totalAfter: totalBefore,
              reservedBefore, reservedAfter,
              usedBefore, usedAfter,
              availableBefore, availableAfter: availableAfter,
              reason: `Emergency SOS Ticket ${status.toUpperCase()}: ${existing.ticketNumber}`,
              performedByUserId: req.user?.id || null
            }
          }),
          prisma.subscriptionBenefitBalance.update({
            where: { id: bal.id },
            data: { reservedUnits: reservedAfter, availableUnits: availableAfter }
          })
        ]);
        deductionNote = ` (1 Emergency unit released back to available balance)`;
      }
    }



    const currentNotes = Array.isArray(existing.notes) ? existing.notes : [];
    const updatedNotes = [
      ...currentNotes,
      {
        timestamp: new Date().toISOString(),
        note: `Status updated to ${status.toUpperCase()}${resolutionNotes ? `: ${resolutionNotes}` : ''}${deductionNote}`
      }
    ];

    const data = {
      status,
      notes: updatedNotes,
      ...(status === 'resolved' ? { resolvedAt: new Date(), resolutionNotes } : {})
    };

    const updated = await prisma.emergencyRequest.update({
      where: { id },
      data,
      include: {
        beneficiary: {
          include: {
            user: true,
            subscriber: true
          }
        }
      }
    });

    // Trigger Emergency Event Dispatchers asynchronously
    if (status === 'resolved') {
      emergencyEvents.dispatchEmergencyResolved({
        requestId: updated.id,
        beneficiaryId: updated.beneficiaryId,
        outcome: resolutionNotes || 'Issue safely handled and resolved by ERC team'
      });
    } else if (status === 'in_progress' || status === 'assigned') {
      emergencyEvents.dispatchAmbulanceDispatched({
        requestId: updated.id,
        beneficiaryId: updated.beneficiaryId,
        eta: '10-15 minutes'
      });
    }

    res.json({ success: true, data: updated, message: `Emergency request status updated to ${status}.${deductionNote}` });
  } catch (error) {
    console.error('Error updating emergency status:', error);
    res.status(500).json({ success: false, message: 'Failed to update emergency status' });
  }
});

// ADD operational note to emergency request
router.post('/requests/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note, author } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const existing = await prisma.emergencyRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    const currentNotes = Array.isArray(existing.notes) ? existing.notes : [];
    const updatedNotes = [
      ...currentNotes,
      {
        timestamp: new Date().toISOString(),
        author: author || 'ERC Agent',
        note
      }
    ];

    const updated = await prisma.emergencyRequest.update({
      where: { id },
      data: { notes: updatedNotes }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error adding emergency note:', error);
    res.status(500).json({ success: false, message: 'Failed to add emergency note' });
  }
});

module.exports = router;
