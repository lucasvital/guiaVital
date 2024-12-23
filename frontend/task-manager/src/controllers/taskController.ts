import { Request, Response } from 'express';
import Task from '../models/task';

// Create a new task
export const createTask = async (req: Request, res: Response) => {
    const { name, status } = req.body;
    const task = new Task({ name, status });
    await task.save();
    res.status(201).json(task);
};

// Get all tasks
export const getAllTasks = async (req: Request, res: Response) => {
    const tasks = await Task.find();
    res.json(tasks);
};

// Get a task by ID
export const getTaskById = async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send('Task not found');
    res.json(task);
};

// Update a task by ID
export const updateTaskById = async (req: Request, res: Response) => {
    const { name, status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { name, status }, { new: true });
    if (!task) return res.status(404).send('Task not found');
    res.json(task);
};

// Delete a task by ID
export const deleteTaskById = async (req: Request, res: Response) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send('Task not found');
    res.status(204).send();
};
