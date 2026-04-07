export function generateOTP(): string {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  return otp;
}
