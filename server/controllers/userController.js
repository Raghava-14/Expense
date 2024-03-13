const bcrypt = require('bcrypt');
const { User } = require('../models'); // Adjust path as necessary
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number } = req.body;

    // Basic validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({ message: "Password does not meet complexity requirements." });
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: "Email is already in use." });
    }

    // Create user
    const user = await User.create({ first_name, last_name, email, password_hash: password, phone_number });

    // Success response
    res.status(201).send({ message: "User registered successfully.", userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send({ message: "Server error during user registration." });
  }
};

// Login user
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check for existing user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
  
      // Verify password
      if (!user.validPassword(password)) {
        return res.status(401).send({ message: "Invalid password." });
      }
  
      // Generate JWT Token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
      // Success response
      res.status(200).send({
        message: "Login successful.",
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send({ message: "Server error during user login." });
    }
  };