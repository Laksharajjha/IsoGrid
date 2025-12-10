import { Router } from 'express';
import { getWards, createWard } from '../controllers/wardController';

const router = Router();

router.get('/', getWards);
router.post('/', createWard);

export default router;
