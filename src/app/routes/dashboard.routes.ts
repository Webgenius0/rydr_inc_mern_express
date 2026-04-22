import express from "express";
import { PreferredServiceRoutes } from "../modules/Dashboard/PreferredService/preferredService.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/preferred-services",
    route: PreferredServiceRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
