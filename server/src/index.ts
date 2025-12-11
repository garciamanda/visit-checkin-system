import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, AppError } from './middleware/errorHandler';
import { apiLimiter } from './middleware/security';

import authRoutes from './routes/auth';
import visitorRoutes from './routes/visitors';
import reportRoutes from './routes/reports';

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor do Sistema de Visitas está funcionando!',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bem-vindo ao Sistema de Registro de Visitas!',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

app.use((req, res) => {
  throw new AppError(`Endpoint não encontrado: ${req.method} ${req.originalUrl}`, 404);
});


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});