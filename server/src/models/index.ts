import Ward from './Ward';
import Bed from './Bed';
import Patient from './Patient';
import Booking from './Booking';

// Associations

// Ward <-> Bed
Ward.hasMany(Bed, { foreignKey: 'wardId', as: 'beds' });
Bed.belongsTo(Ward, { foreignKey: 'wardId', as: 'ward' });

// Bed <-> Patient
Bed.hasOne(Patient, { foreignKey: 'bedId', as: 'currentPatient' });
Patient.belongsTo(Bed, { foreignKey: 'bedId', as: 'bed' });

// Patient <-> Booking
Patient.hasMany(Booking, { foreignKey: 'patientId', as: 'bookings' });
Booking.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Bed <-> Booking
Bed.hasMany(Booking, { foreignKey: 'bedId', as: 'bookings' });
Booking.belongsTo(Bed, { foreignKey: 'bedId', as: 'bed' });

import ActivityLog from './ActivityLog';

export {
    Ward,
    Bed,
    Patient,
    Booking,
    ActivityLog,
};
