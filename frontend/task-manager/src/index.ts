import express from 'express';
import mongoose from 'mongoose';
import taskRoutes from './routes/taskRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', taskRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/task-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000 // Increase timeout to 20 seconds
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});
