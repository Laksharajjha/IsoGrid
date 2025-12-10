import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*', // Allow all for demo
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('enter-hover', (bedId: number) => {
            // Broadcast to others that this bed is being hovered
            socket.broadcast.emit('bed-locked', { bedId, userId: socket.id });
        });

        socket.on('leave-hover', (bedId: number) => {
            socket.broadcast.emit('bed-unlocked', { bedId });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
