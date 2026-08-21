import { Router } from 'express';
import { getCompanyConfig } from '../../controllers/public/company.controller';

const router = Router();

router.get('/config', getCompanyConfig);

export default router;
