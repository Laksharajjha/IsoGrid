import { Request, Response } from 'express';
import { Patient, Bed } from '../models';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await Patient.findAll({
            include: [{ model: Bed, as: 'bed' }],
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, age, condition, bedId } = req.body;
        const patient = await Patient.create({ name, age, condition, bedId });

        // If bedId is provided, update bed status to OCCUPIED
        if (bedId) {
            const bed = await Bed.findByPk(bedId);
            if (bed) {
                bed.status = 'OCCUPIED';
                await bed.save();
            }
        }

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create patient' });
    }
};
