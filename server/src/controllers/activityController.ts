import { Request, Response } from 'express';
import { ActivityLog } from '../models';

export const getActivities = async (req: Request, res: Response) => {
    try {
        const logs = await ActivityLog.findAll({
            limit: 20,
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};
