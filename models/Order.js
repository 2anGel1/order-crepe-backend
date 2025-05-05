const { Model, DataTypes } = require('sequelize');

class Order extends Model {}

module.exports = (sequelize) => {
  Order.init({
    reference: { type: DataTypes.STRING, unique: true },
    itemId: DataTypes.INTEGER,
    itemName: DataTypes.STRING,
    size: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    supplements: DataTypes.JSON,
    totalPrice: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    customerContact: DataTypes.STRING,
    deliveryLocation: DataTypes.STRING,
    additionalNotes: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'processing' },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'unpaid' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
}; 