import { OperationClaimsModel } from './operation-claims.model';

export interface UserModel {
  id: string;
  name: string;
  email: string;
  operationClaims: OperationClaimsModel[];
  status: string;
}