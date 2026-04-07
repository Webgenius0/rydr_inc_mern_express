import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { shapeTemplateRoutes } from '../modules/shapeTemplate/shapeTemplate.route';
import { orderRoutes } from '../modules/order/order.route';
import { ProductPricesRoutes } from '../modules/pricingSettings/pricingSettings.route';
import { CmsRoutes } from '../modules/cms/cms.route';
import { FaqRoutes } from '../modules/faq/faq.route';
import { ProfileRoutes } from '../modules/Profile/profile.route';
import { ContactUsRoutes } from '../modules/contactUs/contactUs.route';
import { FeedbackRoutes } from '../modules/feedback/feedback.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/feedback",
    route: FeedbackRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/shape-template",
    route: shapeTemplateRoutes,
  },
  {
    path: "/order",
    route: orderRoutes,
  },
  {
    path: "/pricing-settings",
    route: ProductPricesRoutes,
  },
  {
    path: "/cms",
    route: CmsRoutes,
  },
  {
    path: "/faq",
    route: FaqRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/contact-us',
    route: ContactUsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
