import { Router } from "express";
import { listTasks, getTask, createTask, updateTask, deleteTask } from "../controllers/maintenanceController.js";

const router = Router();
router.get("/", listTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
