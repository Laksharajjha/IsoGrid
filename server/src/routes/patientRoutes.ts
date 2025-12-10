import { Router } from 'express';
import { getPatients, createPatient, dischargePatient, updateCondition, transferPatient } from '../controllers/patientController';

const router = Router();

router.get('/', getPatients);
router.post('/', createPatient);
router.post('/:id/discharge', dischargePatient);
router.patch('/:id/condition', updateCondition);
router.post('/:id/transfer', transferPatient);

export default router;
