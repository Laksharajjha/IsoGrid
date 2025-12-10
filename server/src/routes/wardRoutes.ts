import { Router } from 'express';
import { getWards, createWard, deleteWard, autoAdmit } from '../controllers/wardController';

const router = Router();

router.get('/', getWards);
router.post('/', createWard);
router.delete('/:id', deleteWard);
router.post('/:id/auto-admit', autoAdmit);

export default router;
