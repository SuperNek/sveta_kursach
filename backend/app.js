import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import requestsRoutes from './routes/requests.js';
import attachmentsRoutes from './routes/attachments.js';
import sequelize from './config/database.js';

const app = express();
app.use(bodyParser.json());

// Маршруты API
app.use('/api/requests', requestsRoutes);
app.use('/api/attachments', attachmentsRoutes);

// Папка для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Синхронизация базы данных
const startServer = async () => {
  try {
    await sequelize.sync({ force: true }); // force: true для тестов, отключите в production
    console.log('Database synced.');
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();
