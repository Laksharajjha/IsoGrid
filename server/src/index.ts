import app from './app';
import sequelize from './config/database';
import './models'; // Import models to register them

import { createServer } from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models (alter: true to update tables without dropping)
        // Sync models
        await sequelize.sync();
        console.log('Database synced.');

        const httpServer = createServer(app);
        initSocket(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
