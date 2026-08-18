import { Request, Response } from 'express';
import * as subscriberService from '../../services/subscriber/subscriber_service';

export const getSubscriberProfile = async (req: Request, res: Response) => {
  try {
    const subscriberId = (req as any).userId;
    if (!subscriberId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const beneficiaryId = req.query.beneficiaryId as string | undefined;
    const profile = await subscriberService.getSubscriberProfile(subscriberId, beneficiaryId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const subscriberId = (req as any).userId;
    const profile = await subscriberService.updateProfile(subscriberId, req.body);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getActivityLog = async (req: Request, res: Response) => {
  try {
    const subscriberId = (req as any).userId;
    const logs = await subscriberService.getActivityLog(subscriberId);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { userAccountService } = await import('../../services/shared/user_account.service');
    const result = await userAccountService.deleteAccount(userId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};
