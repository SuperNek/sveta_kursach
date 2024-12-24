import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/requests.js';

const app = express();

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

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
