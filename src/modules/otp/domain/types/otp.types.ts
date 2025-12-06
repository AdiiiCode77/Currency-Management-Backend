export interface ISendOtp {
  email?: string;
  phone?: string;
}

export interface IVerifyOtp {
  email?: string;
  phone?: string;
  otp: string;
}

export interface IResetPassword {
  userId: string;
  password: string;
}
