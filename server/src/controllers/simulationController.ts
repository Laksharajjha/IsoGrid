import { Request, Response } from 'express';
import { Ward, Bed, Patient, Booking, ActivityLog } from '../models';
import { checkAdjacencyRisk } from '../services/allocationService';
import { Op } from 'sequelize';

export const runSimulation = async (req: Request, res: Response) => {
    try {
        // 1. Randomly Discharge 1-3 Patients
        const occupiedBeds = await Bed.findAll({ where: { status: 'OCCUPIED' }, include: [{ model: Patient, as: 'currentPatient' }] });
        const dischargeCount = Math.min(occupiedBeds.length, Math.floor(Math.random() * 3) + 1);

        const dischargedNames = [];
        for (let i = 0; i < dischargeCount; i++) {
            const bed = occupiedBeds[Math.floor(Math.random() * occupiedBeds.length)];
            if (bed && (bed as any).currentPatient) {
                // Discharge Logic (Duplicate of patientController logic - ideally refactor to service)
                const patient = (bed as any).currentPatient;
                bed.status = 'AVAILABLE';
                await bed.save();

                await Booking.update(
                    { status: 'DISCHARGED', endTime: new Date() },
                    { where: { patientId: patient.id, status: 'ACTIVE' } }
                );

                patient.bedId = null;
                await patient.save();
                dischargedNames.push(patient.name);

                // Remove from local list to avoid double discharge in loop
                const index = occupiedBeds.indexOf(bed);
                if (index > -1) occupiedBeds.splice(index, 1);

                await ActivityLog.create({
                    message: `Patient ${patient.name} discharged from Bed ${bed.row}-${bed.col}`,
                    type: 'DISCHARGE'
                });
            }
        }

        // 2. Randomly Admit 1-3 New Patients
        const availableBeds = await Bed.findAll({ where: { status: 'AVAILABLE' } });
        const admitCount = Math.min(availableBeds.length, Math.floor(Math.random() * 3) + 1);

        const admittedNames = [];
        const conditions = ['INFECTIOUS', 'NON_INFECTIOUS', 'NON_INFECTIOUS', 'NON_INFECTIOUS']; // 25% chance of infectious
        const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];

        for (let i = 0; i < admitCount; i++) {
            if (availableBeds.length === 0) break;

            const bed = availableBeds[Math.floor(Math.random() * availableBeds.length)];
            const name = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 100)}`;
            const age = Math.floor(Math.random() * 60) + 20;
            const condition = conditions[Math.floor(Math.random() * conditions.length)];

            // Check Risk
            const hasRisk = await checkAdjacencyRisk(bed.id, condition === 'INFECTIOUS');
            if (!hasRisk) {
                const patient = await Patient.create({ name, age, condition, bedId: bed.id });
                bed.status = 'OCCUPIED';
                await bed.save();

                await Booking.create({ patientId: patient.id, bedId: bed.id, status: 'ACTIVE' });
                admittedNames.push(`${name} (${condition})`);

                // Remove from local list
                const index = availableBeds.indexOf(bed);
                if (index > -1) availableBeds.splice(index, 1);

                await ActivityLog.create({
                    message: `Patient ${name} admitted to Bed ${bed.row}-${bed.col} (${condition})`,
                    type: 'ADMISSION'
                });
            }
        }

        res.json({
            message: 'Simulation step complete',
            discharged: dischargedNames,
            admitted: admittedNames
        });

    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({ error: 'Simulation failed' });
    }
};
