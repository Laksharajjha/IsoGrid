import express from 'express';
import cors from 'cors';
import wardRoutes from './routes/wardRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/wards', wardRoutes);

export default app;
