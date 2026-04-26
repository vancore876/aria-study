const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars BEFORE requiring routes that use them
dotenv.config();

const adminRoute = require('./routes/admin');
const subscriptionRoute = require('./backend/routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/admin', adminRoute);
app.use('/api', subscriptionRoute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
