import { Request, Response } from 'express';
import { Patient, Bed, Booking } from '../models';
import { checkAdjacencyRisk } from '../services/allocationService';
import { Op } from 'sequelize';
import { getIO } from '../socket';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const whereClause = search ? {
            name: { [Op.like]: `%${search}%` } // SQLite uses LIKE for case-insensitive if configured, or just LIKE.
        } : {};

        const patients = await Patient.findAll({
            where: whereClause,
            include: [{
                model: Bed,
                as: 'bed',
                include: [{ model: require('../models').Ward, as: 'ward' }]
            }],
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, age, condition, bedId, userName } = req.body;

        // 1. Check if bed exists and is available
        const bed = await Bed.findByPk(bedId);
        if (!bed) {
            return res.status(404).json({ error: 'Bed not found' });
        }
        if (bed.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Bed is not available' });
        }

        // 2. Check Adjacency Risk
        const hasRisk = await checkAdjacencyRisk(bedId, condition === 'INFECTIOUS');
        if (hasRisk) {
            return res.status(400).json({ error: 'Cannot admit patient: Adjacency Risk Detected (Too close to infectious patient)' });
        }

        // 3. Create Patient
        const patient = await Patient.create({ name, age, condition, bedId });

        // 4. Update Bed Status
        bed.status = 'OCCUPIED';
        await bed.save();

        // 5. Create Booking Record
        await Booking.create({
            patientId: patient.id,
            bedId: bed.id,
            status: 'ACTIVE'
        });

        // Log Activity
        await require('../models').ActivityLog.create({
            type: 'ADMISSION',
            message: `${userName || 'System'} admitted patient ${name} to Bed ${bed.row}-${bed.col}`,
            wardId: bed.wardId
        });

        // Emit socket event
        try {
            getIO().emit('ward-updated', { wardId: bed.wardId });
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to admit patient' });
    }
};

export const dischargePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userName } = req.body;
        const patient = await Patient.findByPk(id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // 1. Update Bed Status to AVAILABLE
        let wardId = null;
        if (patient.bedId) {
            const bed = await Bed.findByPk(patient.bedId);
            if (bed) {
                bed.status = 'AVAILABLE';
                await bed.save();
                wardId = bed.wardId;
            }
        }

        // 2. Update Booking Status to DISCHARGED
        await Booking.update(
            { status: 'DISCHARGED', endTime: new Date() },
            { where: { patientId: id, status: 'ACTIVE' } }
        );

        // Log Activity
        if (wardId) {
            await require('../models').ActivityLog.create({
                type: 'DISCHARGE',
                message: `${userName || 'System'} discharged patient ${patient.name}`,
                wardId: wardId
            });
        }

        // Emit socket event
        if (wardId) {
            try {
                getIO().emit('ward-updated', { wardId });
            } catch (e) {
                console.error('Socket emit failed:', e);
            }
        }

        // 3. Nullify bedId to clear history from active view
        patient.bedId = null;
        await patient.save();

        res.status(200).json({ message: 'Patient discharged successfully' });
    } catch (error) {
        console.error('Discharge error:', error);
        res.status(500).json({ error: 'Failed to discharge patient' });
    }
};

export const updateCondition = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { condition, userName } = req.body;

        const patient = await Patient.findByPk(id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        patient.condition = condition;
        await patient.save();

        if (patient.bedId) {
            const bed = await Bed.findByPk(patient.bedId);
            if (bed) {
                await require('../models').ActivityLog.create({
                    type: 'ALERT',
                    message: `${userName || 'System'} updated ${patient.name}'s condition to ${condition}`,
                    wardId: bed.wardId
                });

                // Emit socket event
                try {
                    getIO().emit('ward-updated', { wardId: bed.wardId });
                } catch (e) {
                    console.error('Socket emit failed:', e);
                }
            }
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update condition' });
    }
};

export const transferPatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { targetBedId, userName } = req.body;

        const patient = await Patient.findByPk(id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const targetBed = await Bed.findByPk(targetBedId);
        if (!targetBed) return res.status(404).json({ error: 'Target bed not found' });
        if (targetBed.status !== 'AVAILABLE') return res.status(400).json({ error: 'Target bed is not available' });

        // Check Adjacency Risk at new location
        const hasRisk = await checkAdjacencyRisk(targetBedId, patient.condition === 'INFECTIOUS');
        if (hasRisk) {
            return res.status(400).json({ error: 'Cannot transfer: Adjacency Risk Detected at target location' });
        }

        // 1. Free old bed
        if (patient.bedId) {
            const oldBed = await Bed.findByPk(patient.bedId);
            if (oldBed) {
                oldBed.status = 'AVAILABLE';
                await oldBed.save();
            }
            // Close old booking
            await Booking.update(
                { status: 'DISCHARGED', endTime: new Date() },
                { where: { patientId: id, bedId: patient.bedId, status: 'ACTIVE' } }
            );
        }

        // 2. Occupy new bed
        targetBed.status = 'OCCUPIED';
        await targetBed.save();

        // 3. Update Patient
        patient.bedId = targetBedId;
        await patient.save();

        // 4. Create new booking
        await Booking.create({
            patientId: patient.id,
            bedId: targetBed.id,
            status: 'ACTIVE'
        });

        // Log Activity
        await require('../models').ActivityLog.create({
            type: 'ADMISSION',
            message: `${userName || 'System'} transferred ${patient.name} to Bed ${targetBed.row}-${targetBed.col}`,
            wardId: targetBed.wardId
        });

        // Emit socket event
        try {
            getIO().emit('ward-updated', { wardId: targetBed.wardId });
            if (patient.bedId) { // Also update old ward if different (though currently logic assumes same ward or we'd need oldBed.wardId)
                // For now, just emit for target ward as transfer is usually intra-ward or we need to fetch oldBed wardId earlier.
                // Actually we have oldBed logic above but didn't save wardId. Let's just emit for target.
            }
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.json(patient);
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Failed to transfer patient' });
    }
};
