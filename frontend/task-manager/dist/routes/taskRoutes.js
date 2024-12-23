"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
// Create a new task
router.post('/tasks', taskController_1.createTask);
// Get all tasks
router.get('/tasks', taskController_1.getAllTasks);
// Get a task by ID
router.get('/tasks/:id', taskController_1.getTaskById);
// Update a task by ID
router.put('/tasks/:id', taskController_1.updateTaskById);
// Delete a task by ID
router.delete('/tasks/:id', taskController_1.deleteTaskById);
exports.default = router;
