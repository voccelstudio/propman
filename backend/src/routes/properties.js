import { Router } from "express";
import { listProperties, getProperty, createProperty, updateProperty, deleteProperty } from "../controllers/propertyController.js";

const router = Router();

router.get("/", listProperties);
router.get("/:id", getProperty);
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;
