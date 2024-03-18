require('dotenv').config({ path: '../.env' });

const express = require('express');
const userRoutes = require('./routes/userRoute');
const friendshipRoutes = require('./routes/friendshipRoute');
const groupRoutes = require('./routes/groupRoute');


const app = express();
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/groups', groupRoutes);

// Other app setup...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
