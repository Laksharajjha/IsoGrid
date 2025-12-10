import { Router } from 'express';
import { runSimulation } from '../controllers/simulationController';

const router = Router();

router.post('/run', runSimulation);

export default router;
