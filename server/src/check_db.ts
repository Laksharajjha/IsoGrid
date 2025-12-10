import { Ward, Bed } from './models';

async function checkDB() {
    try {
        const wards = await Ward.findAll({
            include: [{ model: Bed, as: 'beds' }]
        });
        const totalBeds = await Bed.count();
        console.log('Total Beds in DB:', totalBeds);

        console.log('Wards found:', wards.length);
        wards.forEach((w: any) => {
            console.log(`Ward ${w.id}: ${w.name} (${w.beds?.length} beds)`);
        });
    } catch (error) {
        console.error('Error fetching wards:', error);
    }
}

checkDB();
