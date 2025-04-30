const express          = require('express');
const cors             = require('cors');
const mongoose         = require('mongoose');
const morgan           = require('morgan');
const cookieParser     = require('cookie-parser');
const csrf             = require('csurf');
const errorHandler     = require('./middlewares/errorHandler');
const roleRouter       = require('./routes/role');
const permissionRouter = require('./routes/permission');
const todosRouter      = require('./routes/todos');
const userRouter       = require('./routes/user');
const authRouter       = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// Middleware dasar
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Aktifkan CSRF Protection di Production
if (process.env.NODE_ENV !== 'production') {
  // Di development, CSRF protection dimatikan
  console.log('CSRF protection dimatikan di development');
} else {
  // Di production, aktifkan CSRF protection
  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);
  console.log('CSRF protection diaktifkan di production');
}

// Setup CORS (aktifkan credentials dan allow cookies)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Kirim token CSRF ke frontend
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Koneksi MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/rproject', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('🟢 MongoDB connected'))
.catch(err => console.error('🔴 MongoDB error:', err));

// Routes
app.use('/roles', roleRouter);
app.use('/permissions', permissionRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/todos', todosRouter);

app.get('/', (req, res) => {
  res.send('Tes Todo App dengan Node.js dan Express.js');
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
