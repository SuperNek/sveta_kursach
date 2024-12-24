import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Request from './Request.js';

const StatusHistory = sequelize.define('StatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  changedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Связь: StatusHistory принадлежит Request
StatusHistory.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

export default StatusHistory;
