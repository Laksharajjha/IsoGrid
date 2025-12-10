import { Request, Response } from 'express';
import { Ward, Bed, Patient, Booking } from '../models';
import { checkAdjacencyRisk } from '../services/allocationService';

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

export const deleteWard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Ward.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Ward not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ward' });
    }
};

export const autoAdmit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, age, condition } = req.body;

        // 1. Get all available beds in the ward
        const beds = await Bed.findAll({
            where: { wardId: id, status: 'AVAILABLE' },
            order: [['row', 'ASC'], ['col', 'ASC']]
        });

        if (beds.length === 0) {
            return res.status(400).json({ error: 'No available beds in this ward' });
        }

        // 2. Find the first safe bed
        let safeBed = null;
        for (const bed of beds) {
            const hasRisk = await checkAdjacencyRisk(bed.id, condition === 'INFECTIOUS');
            if (!hasRisk) {
                safeBed = bed;
                break;
            }
        }

        if (!safeBed) {
            return res.status(400).json({ error: 'No safe beds available due to adjacency risks' });
        }

        // 3. Admit Patient to Safe Bed
        const patient = await Patient.create({ name, age, condition, bedId: safeBed.id });

        // 4. Update Bed Status
        safeBed.status = 'OCCUPIED';
        await safeBed.save();

        // 5. Create Booking Record
        await Booking.create({
            patientId: patient.id,
            bedId: safeBed.id,
            status: 'ACTIVE'
        });

        // Log Activity
        await require('../models').ActivityLog.create({
            type: 'ADMISSION',
            message: `${req.body.userName || 'System'} auto-admitted patient ${name} to Bed ${safeBed.row}-${safeBed.col}`,
            wardId: safeBed.wardId
        });

        // Emit socket event
        try {
            require('../socket').getIO().emit('ward-updated', { wardId: safeBed.wardId });
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.status(201).json({ patient, bed: safeBed, message: `Auto-admitted to Bed ${safeBed.row}-${safeBed.col}` });

    } catch (error) {
        console.error('Auto-admit error:', error);
        res.status(500).json({ error: 'Failed to auto-admit patient' });
    }
};
