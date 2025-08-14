const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to read the user data
const getUsers = () => {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
};

// Helper function to write the user data
const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// --- API Endpoints ---

// User Registration
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();

    // Check if the email already exists
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user and save to the database
    const newUser = { email, password: hashedPassword };
    users.push(newUser);
    saveUsers(users);

    console.log(`New user registered: ${email}`);
    res.status(201).json({ message: 'User registered successfully!' });
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // In a real app, a session token would be created here.
    console.log(`User logged in: ${email}`);
    res.status(200).json({ message: 'Login successful!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});