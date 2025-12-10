import { Request, Response } from 'express';
import { Bed } from '../models';

export const getBeds = async (req: Request, res: Response) => {
    try {
        const { wardId } = req.query;
        const whereClause = wardId ? { wardId } : {};
        const beds = await Bed.findAll({ where: whereClause });
        res.json(beds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch beds' });
    }
};

export const updateBedStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const bed = await Bed.findByPk(id);
        if (!bed) {
            return res.status(404).json({ error: 'Bed not found' });
        }

        bed.status = status;
        await bed.save();

        res.json(bed);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bed status' });
    }
};
