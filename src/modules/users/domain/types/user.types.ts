export interface IUpdateProfile {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface IChangePassword {
  userId: string;
  previous_password: string;
  new_password: string;
}
