import { Request, Response } from 'express';
import { Bed, Patient } from '../models';

export const getBeds = async (req: Request, res: Response) => {
    try {
        const { wardId } = req.params;
        const whereClause = wardId ? { wardId } : {};
        const beds = await Bed.findAll({
            where: whereClause,
            include: [{ model: Patient, as: 'currentPatient' }]
        });
        res.json(beds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch beds' });
    }
};

export const updateBedStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, userName } = req.body;

        const bed = await Bed.findByPk(id);
        if (!bed) {
            return res.status(404).json({ error: 'Bed not found' });
        }

        bed.status = status;
        if (status === 'MAINTENANCE') {
            bed.maintenanceStartTime = new Date();
        } else {
            bed.maintenanceStartTime = null;
        }
        await bed.save();

        // Log Activity
        if (status === 'MAINTENANCE') {
            const ActivityLog = require('../models').ActivityLog; // Lazy load to avoid circular dep issues if any
            await ActivityLog.create({
                message: `${userName || 'System'} marked Bed ${bed.row}-${bed.col} for maintenance`,
                type: 'MAINTENANCE',
                wardId: bed.wardId
            });
        }

        // Emit socket event
        try {
            require('../socket').getIO().emit('ward-updated', { wardId: bed.wardId });
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.json(bed);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bed status' });
    }
};
