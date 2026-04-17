/* eslint-disable no-console */
import config from "../config";
import { USER_ROLE, USER_STATUS } from "../modules/User/user.constant";
import { User } from "../modules/User/user.model";

export const seed = async () => {
  try {
    //atfirst check if the admin exist of not
    const admin = await User.findOne({
      role: USER_ROLE.ADMIN,
      email: config.admin_email,
      status: USER_STATUS.ACTIVE,
    });
    if (!admin) {
      console.log("Seeding started...");

      await User.create({
        first_name: "Admin",
        last_name: "Admin",
        phone: "1234567890",
        email: config.admin_email,
        language: "en",
        agreed_terms_and_conditions: true,
        role: USER_ROLE.ADMIN,
        status: USER_STATUS.ACTIVE,
      });
      console.log("Admin created successfully...");
      console.log("Seeding completed...");
    }
  } catch (error) {
    console.log("Error in seeding", error);
  }
};
