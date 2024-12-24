import express from 'express';
import sequelize from './config/database.js';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/requests.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API маршруты
app.use('/api/requests', routes);

// Обслуживание статических файлов (frontend)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Маршрут для отдачи главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

sequelize.sync({ force: true }).then(() => {
  console.log('База данных синхронизирована.');
}).catch((error) => {
  console.error('Ошибка синхронизации базы данных:', error.message);
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
