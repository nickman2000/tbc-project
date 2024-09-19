export interface IClient {
  id: number;
  clientNumber: number;
  name: string;
  surname: string;
  gender: string;
  personalNumber: number;
  mobileNumber: number;
  country: string;
  city: string;
  address: string;
  realCountry: string;
  realCity: string;
  realAddress: string;
  photoUrl: string;
  accounts: IAccount[];
}

export interface IAccount {
  accountNumber: number;
  clientAccountNumber: number;
  accountType: string;
  currency: string;
  accountStatus: string;
}

export interface IClientFilter {
  name: string;
  clientNumber: string;
  personalNumber: string;
  surname: string;
}

export enum FormAction {
  AddUser = 'add',
  EditUser = 'edit',
}

export type IKey = keyof IClient | keyof IAccount;
