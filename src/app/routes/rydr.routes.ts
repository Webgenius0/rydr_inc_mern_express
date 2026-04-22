import express from "express";

import { RydrOnboardingRoutes } from "../modules/Rydr/Onboarding/rydr.onboarding.route";
import { PreferredServiceRoutes } from "../modules/Dashboard/PreferredService/preferredService.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/onboarding",
    route: RydrOnboardingRoutes,
  },
  {
    path: "/preferred-services",
    route: PreferredServiceRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
