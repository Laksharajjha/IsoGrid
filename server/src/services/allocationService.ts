import { Bed, Patient } from '../models';
import { Op } from 'sequelize';

export const checkAdjacencyRisk = async (wardId: number, row: number, col: number): Promise<boolean> => {
    // Define neighbor coordinates (Top, Bottom, Left, Right)
    const neighbors = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
    ];

    // Filter out invalid coordinates (negative values)
    // Note: We rely on the query to just not find beds for out-of-bound coordinates
    // but filtering negatives is a good optimization.
    const validNeighbors = neighbors.filter(n => n.r >= 0 && n.c >= 0);

    // Query database for occupied beds at these coordinates in the same ward
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
                where: {
                    condition: 'INFECTIOUS',
                },
                required: true, // Only return beds that HAVE an infectious patient
            },
        ],
    });

    // If any neighboring bed has an infectious patient, there is a risk
    return neighboringBeds.length > 0;
};
