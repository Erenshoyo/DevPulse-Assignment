export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: number;
  updated_at: number;
}

export interface IUserResponse extends Omit<IUser, "password"> {}

export interface ISignUp {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface ILogin {
  email: string;
  password: string;
}
