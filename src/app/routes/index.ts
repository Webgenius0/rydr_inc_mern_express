import express from "express";

import { RydrOnboardingRoutes } from "../modules/Rydr/Onboarding/rydr.onboarding.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/rydr/onboarding",
    route: RydrOnboardingRoutes,
  },
  // {
  //   path: "/user",
  //   route: UserRoutes,
  // },
  // {
  //   path: "/faq",
  //   route: FaqRoutes,
  // },
  // {
  //   path: "/profile",
  //   route: ProfileRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
