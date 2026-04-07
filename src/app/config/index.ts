import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  db_url: process.env.DB_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || '12',
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
  admin_profile_photo: process.env.ADMIN_PROFILE_PHOTO,
  admin_mobile_number: process.env.ADMIN_MOBILE_NUMBER,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  //   meilisearch_host: process.env.MEILISEARCH_HOST,
  //   meilisearch_master_key: process.env.MEILISEARCH_MASTER_KEY,
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
  email_from: process.env.EMAIL_FROM,
  email_otp_expiration_minutes: process.env.EMAIL_OTP_EXPIRATION_MINUTES
    ? parseInt(process.env.EMAIL_OTP_EXPIRATION_MINUTES)
    : 10,


  // seller info 
  seller_email: process.env.SELLER_EMAIL,

};
