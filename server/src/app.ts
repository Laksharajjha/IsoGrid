import express from 'express';
import cors from 'cors';
import wardRoutes from './routes/wardRoutes';
import bedRoutes from './routes/bedRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/wards', wardRoutes);
app.use('/api/beds', bedRoutes);

export default app;
