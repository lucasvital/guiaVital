"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskById = exports.updateTaskById = exports.getTaskById = exports.getAllTasks = exports.createTask = void 0;
const task_1 = __importDefault(require("../models/task"));
// Create a new task
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status } = req.body;
    const task = new task_1.default({ name, status });
    yield task.save();
    res.status(201).json(task);
});
exports.createTask = createTask;
// Get all tasks
const getAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield task_1.default.find();
    res.json(tasks);
});
exports.getAllTasks = getAllTasks;
// Get a task by ID
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_1.default.findById(req.params.id);
    if (!task)
        return res.status(404).send('Task not found');
    res.json(task);
});
exports.getTaskById = getTaskById;
// Update a task by ID
const updateTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status } = req.body;
    const task = yield task_1.default.findByIdAndUpdate(req.params.id, { name, status }, { new: true });
    if (!task)
        return res.status(404).send('Task not found');
    res.json(task);
});
exports.updateTaskById = updateTaskById;
// Delete a task by ID
const deleteTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_1.default.findByIdAndDelete(req.params.id);
    if (!task)
        return res.status(404).send('Task not found');
    res.status(204).send();
});
exports.deleteTaskById = deleteTaskById;
