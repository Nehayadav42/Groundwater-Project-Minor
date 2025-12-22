const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, department, organization } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create new user with role, department, and organization
    const user = await User.create({ 
        name, 
        email, 
        password,
        role: role || 'public',
        department: department || null,
        organization: organization || null
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            organization: user.organization,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Check password
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            organization: user.organization,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Start password reset (log reset link)
// @route   POST /api/users/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const user = await User.findOne({ email });

    // Always respond success to avoid leaking which emails exist
    if (!user) {
        return res.json({ message: 'If an account exists, a reset link has been initiated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expires);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password reset instructions',
            html: `
              <p>Hello ${user.name || ''},</p>
              <p>You (or someone using your email) requested a password reset.</p>
              <p>Click the link below to set a new password. This link is valid for 1 hour:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>If you did not request this, you can safely ignore this email.</p>
            `,
        });
    } catch (err) {
        console.error('Error sending reset email:', err);
        // We still respond success so the client UI doesn’t reveal issues.
    }

    res.json({ message: 'If an account exists, a reset link has been sent to the registered email.' });
});

module.exports = { registerUser, loginUser, forgotPassword };