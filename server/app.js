require('dotenv').config({ path: '../.env' });

const express = require('express');
const userRoutes = require('./routes/userRoute');
const friendshipRoutes = require('./routes/friendshipRoute');
const groupRoutes = require('./routes/groupRoute');
const expenseRoutes = require('./routes/expenseRoute');
const commentRoutes = require('./routes/commentRoute');
const errorMiddleware = require('./middleware/errorMiddleware');


const app = express();
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/expenses', commentRoutes);




app.use(errorMiddleware);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});


// Other app setup...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
