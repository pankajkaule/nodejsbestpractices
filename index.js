const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb+srv://pankaj:12345@cluster0.zmduk.mongodb.net/ecommerceSample', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(-1);
});

app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

app.use('/auth', authRoutes);
app.use('/products', productRoutes); 


const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
