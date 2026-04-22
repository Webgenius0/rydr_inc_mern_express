import express from "express";

import validateRequest from "../../../middlewares/validateRequest";
import { VehicleValidation } from "./vehicle.validation";
import { VehicleControllers } from "./vehicle.controller";
import protect from "../../../middlewares/auth";
import { USER_ROLE } from "../../User/user.constant";

const router = express.Router();

router.post(
  "/",
  validateRequest(VehicleValidation.addVehicleValidationSchema),
  protect(USER_ROLE.DRIVER),
  VehicleControllers.addVehicle,
);

export const VehicleRoutes = router;
