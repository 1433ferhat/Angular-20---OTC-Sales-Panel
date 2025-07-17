//projects\shared\src\models\user.model.ts
export interface UserModel {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  status: 'active' | 'inactive';
  lastLogin: Date;
}
