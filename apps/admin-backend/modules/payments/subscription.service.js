const { prisma } = require('../../lib/prisma');

/**
 * Activates subscription when payment is verified.
 */
async function activateSubscription(subscriptionId) {
  if (!subscriptionId) return null;
  try {
    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isActive: true,
      },
    });
    console.log(`[Subscription Service] Subscription ${subscriptionId} activated.`);
    return updated;
  } catch (err) {
    console.warn('[Subscription Service Warning] Could not update subscription:', err.message);
    return null;
  }
}

module.exports = {
  activateSubscription,
};
