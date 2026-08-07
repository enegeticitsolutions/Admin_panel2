import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, validate, AuthRequest } from '../shared/deps';
import { updateUserSchema } from '../../schemas/user';
import * as userService from '../../services/admin/user_service';

const router = Router();

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (authReq.userRole !== 'admin' && authReq.userRole !== 'super_admin' && authReq.userRole !== 'field_manager') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
  }
  next();
};

router.get('/:userId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUser(req.params.userId as string);
    res.json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(404).json({ success: false, message: (e as Error).message });
  }
});

router.put('/:userId', authenticate, requireAdmin, validate(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.userId as string, req.body);
    res.json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(404).json({ success: false, message: (e as Error).message });
  }
});

router.get('/companion-profile/:userId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const profile = await userService.getCompanionProfile(req.params.userId as string);
    res.json({ success: true, data: profile });
  } catch (e: unknown) {
    res.status(404).json({ success: false, message: (e as Error).message });
  }
});

export default router;