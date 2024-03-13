require('dotenv').config();

const express = require('express');
const userRoutes = require('./routes/userRoutes'); // Adjust path as necessary
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

// Other app setup...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
