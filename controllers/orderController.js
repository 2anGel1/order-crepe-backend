const { Op } = require('sequelize');
// const whatsappService = require('../services/whatsapp');

// Generate unique reference
const generateReference = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const orderController = (Order) => ({
  async createOrder(req, res) {
    try {
      const {
        itemId,
        itemName,
        size,
        quantity,
        supplements,
        totalPrice,
        customerName,
        customerContact,
        deliveryLocation,
        additionalNotes
      } = req.body;

      const order = await Order.create({
        reference: generateReference(),
        itemId,
        itemName,
        size,
        quantity,
        supplements,
        totalPrice,
        customerName,
        customerContact,
        deliveryLocation,
        additionalNotes
      });

      // Send initial WhatsApp notification
      // try {
      //   await whatsappService.sendStatusUpdateMessage(
      //     order.customerContact,
      //     order.reference,
      //     'processing'
      //   );
      // } catch (whatsappError) {
      //   console.error('WhatsApp notification failed:', whatsappError);
      //   // Don't fail the request if WhatsApp fails
      // }

      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { reference } = req.params;
      const { status } = req.body;

      const order = await Order.findOne({
        where: { reference }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status
      await order.update({ status });

      // Send WhatsApp notification
      // try {
      //   await whatsappService.sendStatusUpdateMessage(
      //     order.customerContact,
      //     order.reference,
      //     status
      //   );
      // } catch (whatsappError) {
      //   console.error('WhatsApp notification failed:', whatsappError);
      //   // Don't fail the request if WhatsApp fails
      // }

      res.json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  },

  async getOrders(req, res) {
    try {
      const { page = 1, limit = 5, status, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getOrderByReference(req, res) {
    try {
      const { reference } = req.params;
      const order = await Order.findOne({
        where: { reference }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
});

module.exports = orderController; 