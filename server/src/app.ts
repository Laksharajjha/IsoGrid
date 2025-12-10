import express from 'express';
import cors from 'cors';
import wardRoutes from './routes/wardRoutes';
import bedRoutes from './routes/bedRoutes';
import patientRoutes from './routes/patientRoutes';
import bookingRoutes from './routes/bookingRoutes';
import statsRoutes from './routes/statsRoutes';
import simulationRoutes from './routes/simulationRoutes';
import activityRoutes from './routes/activityRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/wards', wardRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/activity', activityRoutes);

export default app;
