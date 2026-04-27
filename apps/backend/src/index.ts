import express from 'express';
import 'express-async-errors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Request, Response, NextFunction } from 'express';

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:19006',
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', (req, res) => res.json({ message: 'Auth routes' }));
app.use('/api/users', (req, res) => res.json({ message: 'Users routes' }));
app.use('/api/lessons', (req, res) => res.json({ message: 'Lessons routes' }));
app.use('/api/bookings', (req, res) => res.json({ message: 'Bookings routes' }));

// WebSocket events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
});
