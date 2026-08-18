import { Router } from 'express';
import { authenticate } from '../shared/deps';
import * as subscriberController from '../../controllers/subscriber/subscriber.controller';

const router = Router();

router.get('/profile', authenticate, subscriberController.getSubscriberProfile);
router.patch('/profile', authenticate, subscriberController.updateProfile);
router.delete('/profile', authenticate, subscriberController.deleteAccount);
router.delete('/account', authenticate, subscriberController.deleteAccount);
router.get('/activity', authenticate, subscriberController.getActivityLog);

export default router;
