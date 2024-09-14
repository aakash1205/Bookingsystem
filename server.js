const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv=require('dotenv');
dotenv.config();
// Middleware
app.use(express.static('public')); // Serve front-end files from 'public' folder
app.use(express.json());

// MongoDB connection string (replace <username>, <password>, and <dbname> with your values)
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Seat Schema and Model
const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  booked: { type: Boolean, default: false },
});

const Seat = mongoose.model('Seat', seatSchema);

// Serve the seat layout HTML page
app.get('/layout', async (req, res) => {
  try {
    const seats = await Seat.find().sort({ seatNumber: 1 });
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seat Layout</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Train Seat Layout</h1>
        <div id="coach">
          ${seats.map(seat => `
            <div class="seat ${seat.booked ? 'booked' : 'available'}">
              ${seat.seatNumber}
            </div>
          `).join('')}
        </div>
        <script src="/app.js"></script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error fetching seat layout');
  }
});

// Book seats
app.post('/book', async (req, res) => {
  const { numSeats } = req.body;
  
  try {
    const availableSeats = await Seat.find({ booked: false }).limit(numSeats);

    if (availableSeats.length < numSeats) {
      return res.json({ success: false, message: 'Not enough seats available.' });
    }

    const bookedSeats = [];
    
    for (let i = 0; i < numSeats; i++) {
      const seat = availableSeats[i];
      seat.booked = true;
      await seat.save();
      bookedSeats.push(seat.seatNumber);
    }

    res.json({ success: true, bookedSeats });
  } catch (error) {
    res.status(500).json({ message: 'Error booking seats', error });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
