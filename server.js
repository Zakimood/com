const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 60 * 1000, // 30 minutes
        sameSite: 'lax'
    }
}));

// In-memory user storage (for demo purposes)
const users = new Map();

// Hash password function
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function validatePassword(password) {
    return password.length >= 8;
}

// ==================== API ROUTES ====================

// Register endpoint
app.post('/api/register', (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, password, confirmPassword } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !address || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters long' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        // Check if user already exists
        if (users.has(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // Create user
        users.set(email, {
            firstName,
            lastName,
            email,
            phone,
            address,
            password: hashPassword(password),
            createdAt: new Date().toISOString(),
            accounts: {
                checking: {
                    balance: 455432.10,
                    number: '****1234',
                    type: 'Checking'
                },
                savings: {
                    balance: 15678.90,
                    number: '****5678',
                    type: 'Savings'
                }
            },
            transactions: [
                {
                    id: 'T001',
                    date: '2024-03-15',
                    description: 'Transfer to Sarah Johnson',
                    amount: -250.00,
                    type: 'transfer',
                    status: 'completed'
                },
                {
                    id: 'T002',
                    date: '2024-03-14',
                    description: 'Salary Deposit - ABC Corp',
                    amount: 3500.00,
                    type: 'deposit',
                    status: 'completed'
                },
                {
                    id: 'T003',
                    date: '2024-03-12',
                    description: 'Online Purchase - Amazon',
                    amount: -89.99,
                    type: 'payment',
                    status: 'completed'
                }
            ]
        });

        res.json({ 
            success: true, 
            message: 'Registration successful! Please login.' 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Check if user exists
        const user = users.get(username);
        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Set session
        req.session.user = username;
        req.session.lastAccess = Date.now();

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error logging out' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Get user profile
app.get('/api/user/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    const user = users.get(req.session.user);
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    // Remove sensitive data
    const { password, ...userData } = user;
    res.json({ 
        success: true, 
        data: userData 
    });
});

// Get account summary
app.get('/api/accounts/summary', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    const user = users.get(req.session.user);
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    res.json({ 
        success: true, 
        data: {
            accounts: user.accounts,
            totalBalance: Object.values(user.accounts).reduce((sum, acc) => sum + acc.balance, 0)
        }
    });
});

// Get transactions
app.get('/api/transactions', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    const user = users.get(req.session.user);
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    const { filter, search } = req.query;
    let transactions = [...user.transactions];

    // Apply filters (demo)
    if (filter && filter !== 'all') {
        transactions = transactions.filter(t => t.type === filter);
    }

    if (search) {
        transactions = transactions.filter(t => 
            t.description.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.json({ 
        success: true, 
        data: transactions 
    });
});

// Make transfer
app.post('/api/transfer', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const { recipientName, bankName, accountNumber, amount, description } = req.body;

        // Validation
        if (!recipientName || !bankName || !accountNumber || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount must be greater than 0' 
            });
        }

        const user = users.get(req.session.user);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check sufficient funds (checking account)
        if (user.accounts.checking.balance < amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient funds' 
            });
        }

        // Process transfer (demo)
        user.accounts.checking.balance -= parseFloat(amount);

        // Create transaction record
        const transaction = {
            id: `T${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Transfer to ${recipientName}`,
            amount: -parseFloat(amount),
            type: 'transfer',
            status: 'completed',
            reference: `TRX-${Date.now()}`
        };

        user.transactions.unshift(transaction);

        res.json({ 
            success: true, 
            message: 'Transfer completed successfully',
            data: {
                transaction,
                newBalance: user.accounts.checking.balance
            }
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing transfer' 
        });
    }
});

// Update profile
app.put('/api/user/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const { firstName, lastName, phone, address } = req.body;
        const user = users.get(req.session.user);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        res.json({ 
            success: true, 
            message: 'Profile updated successfully' 
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile' 
        });
    }
});

// Change password
app.put('/api/user/password', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = users.get(req.session.user);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify current password
        if (user.password !== hashPassword(currentPassword)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Validate new password
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 8 characters long' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'New passwords do not match' 
            });
        }

        // Update password
        user.password = hashPassword(newPassword);

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error changing password' 
        });
    }
});

// Admin: Get all users (demo)
app.get('/api/admin/users', (req, res) => {
    // Simple admin check (demo only)
    if (!req.session.user || req.session.user !== 'admin@nexusbank.com') {
        return res.status(403).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }

    const userList = Array.from(users.entries()).map(([email, user]) => {
        const { password, ...userData } = user;
        return { email, ...userData };
    });

    res.json({ 
        success: true, 
        data: userList 
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==================== FRONTEND ROUTES ====================

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/transfer', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'transfer.html'));
});

app.get('/transactions', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'transactions.html'));
});

app.get('/settings', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/admin', (req, res) => {
    // Simple admin check (demo only)
    if (!req.session.user || req.session.user !== 'admin@nexusbank.com') {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👤 Demo admin: admin@nexusbank.com / Admin123!`);
});