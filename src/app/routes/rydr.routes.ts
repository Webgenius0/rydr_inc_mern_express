import express from "express";

import { RydrOnboardingRoutes } from "../modules/Rydr/Onboarding/rydr.onboarding.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/onboarding",
    route: RydrOnboardingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
