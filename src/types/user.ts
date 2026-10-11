export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}