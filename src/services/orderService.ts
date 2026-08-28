import { orders } from "../data/catalog";

export const orderService = {
  async getOrders() {
    return orders;
  },
  async getOrder(orderNumber: string) {
    return orders.find((order) => order.orderNumber === orderNumber) ?? orders[0];
  },
};
