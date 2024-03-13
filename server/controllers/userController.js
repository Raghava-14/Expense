const bcrypt = require('bcryptjs');
const { User } = require('../models'); // Adjust path as necessary
const jwt = require('jsonwebtoken');

// Register new user
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ first_name, last_name, email, password_hash: hashedPassword, phone_number });

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
  
      // Directly compare the plaintext passwords
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
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
  

  //View user info
  exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you store user ID in req.user during JWT verification

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }, // Exclude password_hash from the response
        });

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        res.send(user);
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).send({ message: "Error fetching user information." });
    }
};

//Update user info
exports.updateUserInfo = async (req, res) => {
    try {
        const { first_name, last_name, phone_number } = req.body;

        // Find the user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Update user information
        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.phone_number = phone_number || user.phone_number;

        await user.save();

        res.send({ message: "User information updated successfully." });
    } catch (error) {
        console.error("Error updating user information:", error);
        res.status(500).send({ message: "Server error." });
    }
};

//Update user password
exports.updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify current password with bcrypt
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).send({ message: "Current password is incorrect." });
        }

        //Old password cannot be euql to new password
        if (currentPassword === newPassword) {
            return res.status(400).send({ message: "New password cannot be same as old password." });
        }

        // Validate the new password against your criteria
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).send({ message: "New Password does not meet complexity requirements." });
        }


        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    
        // Update password
        user.password_hash = hashedNewPassword;
        await user.save();

        res.send({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating user password:", error);
        res.status(500).send({ message: "Server error." });
    }
};


//Update user email
exports.updateUserEmail = async (req, res) => {
    try {
        const { newEmail } = req.body;
        // Ensure new email is not already in use
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
            return res.status(400).send({ message: "Email already in use." });
        }

        // Ideally, send a verification email to the newEmail address here
        // For demonstration, let's assume it's directly updated

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        user.email = newEmail;
        await user.save();

        res.send({ message: "Email update successful. Please verify your new email." });
    } catch (error) {
        console.error("Error updating user email:", error);
        res.status(500).send({ message: "Server error." });
    }
};

//Delete user
exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have the user's ID from the JWT token

        // Find and delete the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        await user.destroy();
        res.send({ message: "User account deleted successfully." });
    } catch (error) {
        console.error("Error deleting user account:", error);
        res.status(500).send({ message: "Server error." });
    }
};
