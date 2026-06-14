import { Router } from "express";
import { listSales, getSale, createSale, updateSale, deleteSale, addSaleEvent } from "../controllers/saleController.js";

const router = Router();
router.get("/", listSales);
router.get("/:id", getSale);
router.post("/", createSale);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);
router.post("/events", addSaleEvent);

export default router;
