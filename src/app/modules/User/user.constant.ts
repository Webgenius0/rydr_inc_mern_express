export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export const UserSearchableFields = [
  "name",
  "email",
  "mobileNumber",
  "role",
  "status",
];
