import { Response } from 'express';
import { AuthRequest } from '../../api/shared/deps';
import prisma from '../../core/database';

export const getSubscriberInvoices = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const invoices = await prisma.invoice.findMany({
    where: { subscriberId: userId },
    include: {
      items: true,
      subscription: {
        include: {
          package: true,
          packageVersion: true,
        },
      },
      beneficiary: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: invoices,
  });
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      subscriberId: userId,
    },
    include: {
      items: true,
      subscription: {
        include: {
          package: true,
          packageVersion: true,
        },
      },
      beneficiary: true,
      subscriber: true,
    },
  });

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  res.json({
    success: true,
    data: invoice,
  });
};

export const getInvoiceByOrderId = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { orderId } = req.params;

  // orderId might be the Razorpay orderId (transactionId) OR the subscriptionId passed from checkout
  let invoice = await prisma.invoice.findFirst({
    where: {
      subscriberId: userId,
      subscriptionId: orderId,
    },
    include: {
      items: true,
      subscription: {
        include: {
          package: true,
          packageVersion: true,
        },
      },
      beneficiary: true,
      subscriber: true,
    }
  });

  if (!invoice) {
    const payment = await prisma.payment.findFirst({
      where: {
        subscriberId: userId,
        transactionId: orderId,
      },
      include: {
        invoice: {
          include: {
            items: true,
            subscription: {
              include: {
                package: true,
                packageVersion: true,
              },
            },
            beneficiary: true,
            subscriber: true,
          }
        }
      }
    });
    
    if (payment && payment.invoice) {
      invoice = payment.invoice;
    }
  }

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found for this order' });
  }

  res.json({
    success: true,
    data: invoice,
  });
};
