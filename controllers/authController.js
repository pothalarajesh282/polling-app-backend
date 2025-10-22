const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require('sequelize');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'user' } = req.body;

    console.log('Checking for existing user...');
    
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ email }, { username }] 
      }
    });

    console.log("existingUser:", existingUser);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    console.log('Creating new user with role:', role);
    const user = await User.create({
      username,
      email,
      password,
      role  // This now comes from the form
    });
    
    console.log('User created successfully:', user.id, 'Role:', user.role);

    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log('Error in register:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
