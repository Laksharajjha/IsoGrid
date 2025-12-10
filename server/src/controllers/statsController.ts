import { Request, Response } from 'express';
import { Ward, Patient } from '../models';
import { Op } from 'sequelize';

export const getStats = async (req: Request, res: Response) => {
    try {
        const totalWards = await Ward.count();

        // Count patients who currently have a bed assigned (Active)
        const activePatients = await Patient.count({
            where: {
                bedId: { [Op.ne]: null }
            }
        });

        // Count infectious patients (Critical Alerts context)
        const infectiousPatients = await Patient.count({
            where: {
                condition: 'INFECTIOUS',
                bedId: { [Op.ne]: null }
            }
        });

        res.json({
            totalWards,
            activePatients,
            criticalAlerts: infectiousPatients,
            systemStatus: 'Optimal'
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
