import sequelize from './config/database';
import { Ward, Bed } from './models';

const seed = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Reset DB

        // Create a Ward
        const ward = await Ward.create({
            name: 'Isolation Ward A',
            type: 'Respiratory',
            rowCount: 5,
            colCount: 6,
        });

        // Create Beds
        const beds = [];
        for (let r = 0; r < ward.rowCount; r++) {
            for (let c = 0; c < ward.colCount; c++) {
                beds.push({
                    wardId: ward.id,
                    row: r,
                    col: c,
                    status: 'AVAILABLE',
                    type: (r === 0) ? 'ICU' : 'REGULAR', // Top row is ICU
                });
            }
        }
        await Bed.bulkCreate(beds);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
