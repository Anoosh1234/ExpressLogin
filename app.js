// app.js
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30000 // 30 seconds in milliseconds
  }
}));

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'anoosh',
  database: 'express'
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
  res.render('form', { message: '' }); // Initial rendering without any message
});

app.post('/submit', async (req, res, next) => {
  const { name, email, mobile, address, dob, message } = req.body;
  
  try {
    // Insert the form data into the database
    const [results, fields] = await pool.execute(
      'INSERT INTO form_data (name, email, mobile, address, dob, message) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, mobile, address, dob, message]
    );

    // Render a thank you message page
    res.render('thankyou', { name, email });
  } catch (error) {
    // Pass the error to Express's error handling middleware
    next(error);
  }
});


app.get('/logout', (req, res) => {
  // Perform any cleanup or session handling if needed
  res.redirect('/login'); // Redirect to the login page
});


// Login route
app.get('/login', (req, res) => {
  res.render('login', { error: '' }); // Render the login form
});

app.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if the provided credentials are valid
    const [rows, fields] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (rows.length > 0) {
      // User authenticated successfully, set authenticated session flag and redirect to the data page
      req.session.authenticated = true;
      res.redirect('/data');
    } else {
      // Invalid credentials, render the login page with an error message
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (error) {
    // Pass the error to Express's error handling middleware
    next(error);
  }
});

app.get('/data', async (req, res, next) => {
  // Check if the user is authenticated
  if (!req.session.authenticated) {
    // If not authenticated, redirect to the login page
    return res.redirect('/login');
  }

  try {
    // Retrieve all form data from the database
    const [rows, fields] = await pool.query('SELECT * FROM form_data');
    res.render('storedData', { formData: rows });
  } catch (error) {
    // Pass the error to Express's error handling middleware
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send(`An error occurred: ${err.message}`);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
