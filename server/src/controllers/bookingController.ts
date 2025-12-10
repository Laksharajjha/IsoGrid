import { Request, Response } from 'express';
import { Booking, Bed, Patient } from '../models';
import { checkAdjacencyRisk } from '../services/allocationService';

export const getBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Bed, as: 'bed' },
                { model: Patient, as: 'patient' },
            ],
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { patientId, bedId, startDate, endDate } = req.body;

        // Check if bed is available
        const bed = await Bed.findByPk(bedId);
        if (!bed) {
            return res.status(404).json({ error: 'Bed not found' });
        }
        if (bed.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Bed is not available' });
        }

        // Check if patient exists
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check for adjacency risk
        const isRisky = await checkAdjacencyRisk(bed.id, patient.condition === 'INFECTIOUS');
        if (isRisky) {
            return res.status(400).json({ error: 'Bed is blocked due to infectious neighbor risk' });
        }

        const booking = await Booking.create({ patientId, bedId, startDate, endDate });

        // Update bed status
        bed.status = 'OCCUPIED';
        await bed.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
};
