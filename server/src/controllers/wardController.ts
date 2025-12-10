import { Request, Response } from 'express';
import { Ward, Bed } from '../models';

export const getWards = async (req: Request, res: Response) => {
    try {
        const wards = await Ward.findAll({
            include: [{ model: Bed, as: 'beds' }],
        });
        res.json(wards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wards' });
    }
};

export const createWard = async (req: Request, res: Response) => {
    try {
        const { name, type, rowCount, colCount } = req.body;
        const ward = await Ward.create({ name, type, rowCount, colCount });

        // Initialize beds for the grid
        const beds = [];
        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < colCount; c++) {
                beds.push({
                    wardId: ward.id,
                    row: r,
                    col: c,
                    status: 'AVAILABLE',
                    type: 'REGULAR',
                });
            }
        }
        await Bed.bulkCreate(beds);

        res.status(201).json(ward);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ward' });
    }
};
