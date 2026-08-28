import { orders, products } from "../data/catalog";

export const adminService = {
  async getDashboard() {
    return {
      revenue: orders.reduce((sum, order) => sum + order.total, 0) + 285600,
      orders: 148,
      customers: 1240,
      products: products.length,
      lowStock: products.filter((product) => product.stock < 12).length,
      pendingOrders: 23,
    };
  },
};
