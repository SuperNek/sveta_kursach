import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Attachment from './Attachment.js';

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'new',
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  initiator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  executor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Устанавливаем связи
Request.hasMany(Attachment, { foreignKey: 'requestId', as: 'attachments' });
Attachment.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

export default Request;
