export const USER_ROLE = {
  USER: "USER",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export const UserSearchableFields = ["first_name", "last_name", "email", "phone"];