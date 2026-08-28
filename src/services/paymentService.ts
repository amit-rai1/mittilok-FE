export const paymentService = {
  async createRazorpayOrder(amount: number) {
    return { provider: "razorpay", amount, orderId: `rzp_demo_${Date.now()}` };
  },
};
