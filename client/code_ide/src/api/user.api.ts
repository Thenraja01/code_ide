import api from "./axios";

export const updateProfile = async (data: { name?: string; email?: string }) => {
  const res = await api.put("/user/update", data);
  return res.data;
};

export const changePassword = async (data: { currentPassword:  string; newPassword:  string }) => {
  const res = await api.post("/user/change-password", data);
  return res.data;
};

export const verifyOTP = async (otp: string) => {
  const res = await api.post("/user/verify-otp", { otp });
  return res.data;
};
