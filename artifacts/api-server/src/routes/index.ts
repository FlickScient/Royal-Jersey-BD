import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import leaguesRouter from "./leagues";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import offersRouter from "./offers";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import settingsRouter from "./settings";
import visitsRouter from "./visits";
import migrateRouter from "./migrate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(leaguesRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(offersRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(uploadRouter);
router.use(settingsRouter);
router.use(visitsRouter);
router.use(migrateRouter);

export default router;
