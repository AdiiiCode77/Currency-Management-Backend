export type loginAsType =  'superAdmin'  | 'Admin' | 'User';

export interface ILogin {
  email: string;
  password: string;
  login_as: loginAsType;
}

export interface ISignupFirstStep {
  email?: string;
}
export interface ISignupSecondStep {
  sentOtp: string;
  email: string;
  phone: string;
  password?: string;
  name: string;
  user_type_id: string;
}

