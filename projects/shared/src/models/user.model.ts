import { OperationClaimsModel } from './operation-claims.model';

export interface UserModel {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  operationClaims: OperationClaimsModel[];
  status: string;
}