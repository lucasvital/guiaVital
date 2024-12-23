import { Router } from 'express';
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTaskById,
    deleteTaskById
} from '../controllers/taskController';

const router = Router();

// Create a new task
router.post('/tasks', createTask);

// Get all tasks
router.get('/tasks', getAllTasks);

// Get a task by ID
router.get('/tasks/:id', getTaskById);

// Update a task by ID
router.put('/tasks/:id', updateTaskById);

// Delete a task by ID
router.delete('/tasks/:id', deleteTaskById);

export default router;
