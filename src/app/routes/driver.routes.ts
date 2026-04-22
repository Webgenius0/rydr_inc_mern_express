import express from "express";

import { DriverOnboardingRoutes } from "../modules/Driver/Onboarding/driver.onboarding.route";
import { VehicleRoutes } from "../modules/Driver/Vehicle/vehicle.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/onboarding",
    route: DriverOnboardingRoutes,
  },
  {
    path: "/vehicle",
    route: VehicleRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
