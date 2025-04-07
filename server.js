// server.js
require('dotenv').config();  // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection using URI from .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('Error:', err));

// Create a Schema for media files
const mediaSchema = new mongoose.Schema({
  filename: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now },
});

const Media = mongoose.model('Media', mediaSchema);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to serve static files
app.use(express.static('uploads'));

// Endpoint to upload media
app.post('/upload', upload.single('media'), (req, res) => {
  const newMedia = new Media({
    filename: req.file.originalname,
    filePath: req.file.path
  });

  newMedia.save()
    .then(() => res.json({ message: 'File uploaded and saved in database!' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Serve the frontend (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
