const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const adminRoute = require('./routes/admin');
const subscriptionRoute = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/admin', adminRoute);
app.use('/api', subscriptionRoute);

// Root route for testing
app.get('/', (req, res) => {
  res.send('ARIA Backend is running');
});

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));
}

// Export for Vercel
module.exports = app;

// Start server locally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
