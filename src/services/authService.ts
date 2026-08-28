import type { Role, User } from "../types";

const demoUsers: User[] = [
  { id: "u1", name: "Amit", email: "amit@example.com", phone: "9876543210", role: "customer" },
  { id: "admin", name: "MittiLok Admin", email: "admin@mittilok.in", role: "admin" },
];

export const authService = {
  async login(email: string, _password: string): Promise<User> {
    return demoUsers.find((user) => user.email === email) ?? { id: "u2", name: email.split("@")[0], email, role: "customer" };
  },
  async signup(name: string, email: string, role: Role = "customer"): Promise<User> {
    return { id: crypto.randomUUID(), name, email, role };
  },
  async logout() {
    return true;
  },
};
