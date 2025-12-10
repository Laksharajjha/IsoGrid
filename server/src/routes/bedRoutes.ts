import { Router } from 'express';
import { getBeds, updateBedStatus } from '../controllers/bedController';

const router = Router();

router.get('/:wardId', getBeds);
router.patch('/:id/status', updateBedStatus);

export default router;
