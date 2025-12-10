import { Bed, Patient } from '../models';
import { Op } from 'sequelize';

export const checkAdjacencyRisk = async (bedId: number, isNewPatientInfectious: boolean): Promise<boolean> => {
    // 1. Get the target bed's coordinates
    const targetBed = await Bed.findByPk(bedId);
    if (!targetBed) return false; // Should handle error, but for risk check, no bed = no risk context

    const { wardId, row, col } = targetBed;

    // Define neighbor coordinates (Top, Bottom, Left, Right)
    const neighbors = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
    ];

    const validNeighbors = neighbors.filter(n => n.r >= 0 && n.c >= 0);

    // 2. Query neighbors
    const neighboringBeds = await Bed.findAll({
        where: {
            wardId,
            [Op.or]: validNeighbors.map(n => ({ row: n.r, col: n.c })),
            status: 'OCCUPIED',
        },
        include: [
            {
                model: Patient,
                as: 'currentPatient',
            },
        ],
    });

    // 3. Risk Logic:
    // Case A: New patient is INFECTIOUS -> Can't be next to ANYONE (for simplicity, or just non-infectious?)
    // Let's say: Infectious patients must be isolated. So if neighbor exists, RISK.
    // Actually, usually Infectious + Infectious is okay (cohorting), but Infectious + Non-Infectious is BAD.
    // For this app's "Adjacency Logic":
    // - If New Patient is INFECTIOUS: Cannot be next to NON-INFECTIOUS.
    // - If New Patient is NON-INFECTIOUS: Cannot be next to INFECTIOUS.

    for (const neighbor of neighboringBeds) {
        const neighborPatient = (neighbor as any).currentPatient;
        if (!neighborPatient) continue;

        const neighborIsInfectious = neighborPatient.condition === 'INFECTIOUS';

        if (isNewPatientInfectious) {
            // I am infectious. Neighbor must NOT be non-infectious.
            // (Assuming Infectious+Infectious is safe for now, or maybe strict isolation?)
            // Let's implement STRICT isolation: Infectious cannot be next to ANYONE.
            // Wait, cohorting is better.
            // Let's stick to: Risk if conditions mismatch.
            if (!neighborIsInfectious) return true; // Risk!
        } else {
            // I am non-infectious. Neighbor must NOT be infectious.
            if (neighborIsInfectious) return true; // Risk!
        }
    }

    return false;
};
