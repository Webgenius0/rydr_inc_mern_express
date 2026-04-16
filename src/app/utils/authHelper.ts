export function generateOTP(): string {
  const email_otp = Math.floor(10000 + Math.random() * 90000).toString();
  return email_otp;
}
