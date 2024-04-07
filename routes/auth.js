const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your User model is in the models directory
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware'); // Import authenticateToken and isAdmin middleware functions

// Signup route
router.post('/signup', async (req, res) => {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Create a new user with the hashed password and other details
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      role: 'user' // Default role; adjust as necessary
    });

    // Save the new user to the database
    await user.save();
    
    // Respond to the client
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Handle potential errors, such as a duplicate username/email
    res.status(500).send(error.message);
  }
});

// Login route
// Login route
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.status(400).send('Invalid credentials');
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Include userId in the response
    res.json({ token, userId: user._id.toString(), role: user.role }); // Convert ObjectId to string if necessary
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// In your authRoutes.js file or wherever you define your authentication-related routesx

router.post('/logout', function(req, res) {
  // Optionally add the token to a blacklist or log the logout action
  // Since JWTs are stateless, there's no need to clear the token server-side for the basic logout functionality
  
  // You could log the user out here or invalidate a refresh token if applicable
  console.log('User logged out');
  
  // Send a response indicating logout was successful
  res.status(200).json({ message: 'Logout successful' });
});








module.exports = router;