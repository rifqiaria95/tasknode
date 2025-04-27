const express     = require('express');
const cors        = require('cors');
const mongoose    = require('mongoose');
const todosRouter = require('./routes/todos');
const authRouter  = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Setup CORS
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect('mongodb+srv://rifqiaria95:WJDOYcgun2noqlq3@cluster0.dgktdmo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('🟢 MongoDB connected'))
.catch(err => console.error('🔴 MongoDB error:', err));

app.use('/auth', authRouter);
app.use('/todos', todosRouter);

app.get('/', (req, res) => {
  res.send('Tes Todo App dengan Node.js dan Express.js');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
