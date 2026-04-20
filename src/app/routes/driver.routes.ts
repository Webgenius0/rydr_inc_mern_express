import express from "express";

import { DriverOnboardingRoutes } from "../modules/Driver/Onboarding/driver.onboarding.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/onboarding",
    route: DriverOnboardingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
