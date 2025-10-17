const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'helpus_db'
});

// Default BEP20 Address
const DEFAULT_BEP20 = '0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf';

// Connect to Database
db.connect((err) => {
    if (err) {
        console.log('❌ Database Error:', err.message);
    } else {
        console.log('✅ MySQL Database Connected');
        createTables();
    }
});

// Create Tables
function createTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            referral_code VARCHAR(10) UNIQUE,
            referred_by INT NULL,
            full_name VARCHAR(100),
            email VARCHAR(100),
            bep20_address VARCHAR(255) DEFAULT '${DEFAULT_BEP20}',
            bkash_number VARCHAR(20),
            balance_usd DECIMAL(15,2) DEFAULT 0.00,
            balance_bdt DECIMAL(15,2) DEFAULT 0.00,
            total_invested_usd DECIMAL(15,2) DEFAULT 0.00,
            total_earned_bdt DECIMAL(15,2) DEFAULT 0.00,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS investments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            investment_usd DECIMAL(15,2) NOT NULL,
            daily_profit_bdt DECIMAL(15,2) NOT NULL,
            status ENUM('active', 'completed') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,

        `CREATE TABLE IF NOT EXISTS profits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            investment_id INT NOT NULL,
            amount_bdt DECIMAL(15,2) NOT NULL,
            profit_date DATE NOT NULL,
            status ENUM('credited') DEFAULT 'credited',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (investment_id) REFERENCES investments(id)
        )`,

        `CREATE TABLE IF NOT EXISTS withdrawals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount_bdt DECIMAL(15,2) NOT NULL,
            method ENUM('bkash', 'bep20') NOT NULL,
            account_number VARCHAR(255) NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,

        `CREATE TABLE IF NOT EXISTS deposits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount_usd DECIMAL(15,2) NOT NULL,
            transaction_hash VARCHAR(255),
            status ENUM('pending', 'confirmed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,

        `CREATE TABLE IF NOT EXISTS commissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            from_user_id INT NOT NULL,
            investment_id INT NOT NULL,
            level INT NOT NULL,
            amount_bdt DECIMAL(15,2) NOT NULL,
            status ENUM('credited') DEFAULT 'credited',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (from_user_id) REFERENCES users(id),
            FOREIGN KEY (investment_id) REFERENCES investments(id)
        )`,

        `CREATE TABLE IF NOT EXISTS user_activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            activity_type VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,

        `CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('super_admin', 'admin') DEFAULT 'admin',
            permissions JSON,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            description TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    tables.forEach((sql, index) => {
        db.query(sql, (err) => {
            if (err) {
                console.log(`❌ Table ${index + 1} error:`, err.message);
            } else {
                console.log(`✅ Table ${index + 1} ready`);
            }
        });
    });

    // Default Admin User
    const createDefaultAdmin = `INSERT IGNORE INTO admin_users (username, password, role, permissions) 
    VALUES ('admin', 'admin123', 'super_admin', '["users", "investments", "withdrawals", "profits", "settings"]')`;
    db.query(createDefaultAdmin);
}

// Investment Plans (USD Investment, BDT Profit)
const investmentPlans = [
    { usd: 10, daily_profit_bdt: 70 },
    { usd: 50, daily_profit_bdt: 200 },
    { usd: 100, daily_profit_bdt: 400 },
    { usd: 200, daily_profit_bdt: 800 },
    { usd: 500, daily_profit_bdt: 2000 },
    { usd: 1000, daily_profit_bdt: 4000 },
    { usd: 2000, daily_profit_bdt: 8000 },
    { usd: 5000, daily_profit_bdt: 20000 }
];

// Commission Rates (Your Exact Rates)
const commissionRates = {
    10: { level1: 100, level2: 50 },
    50: { level1: 200, level2: 100 },
    100: { level1: 400, level2: 200 },
    200: { level1: 800, level2: 400 },
    500: { level1: 2000, level2: 1000 },
    1000: { level1: 4000, level2: 2000 },
    2000: { level1: 8000, level2: 4000 },
    5000: { level1: 20000, level2: 10000 }
};

// ==================== USER API ROUTES ====================

// Test API
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '🚀 HelpUs Investment Server Running!',
        bep20_address: DEFAULT_BEP20,
        timestamp: new Date().toISOString()
    });
});

// Get Investment Plans
app.get('/api/plans', (req, res) => {
    const plans = investmentPlans.map((plan, index) => ({
        id: index + 1,
        name: `$${plan.usd} Plan`,
        investment_usd: plan.usd,
        daily_profit_bdt: plan.daily_profit_bdt,
        description: `Invest $${plan.usd} USDT, earn ৳${plan.daily_profit_bdt} daily`
    }));
    
    res.json({ success: true, plans });
});

// User Registration
app.post('/api/register', (req, res) => {
    const { username, phone, password, full_name, email, referral_code } = req.body;
    
    if (!username || !phone || !password) {
        return res.json({ success: false, message: 'Username, phone and password required' });
    }

    const user_referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    let referred_by = null;

    if (referral_code) {
        const refSql = 'SELECT id FROM users WHERE referral_code = ?';
        db.query(refSql, [referral_code], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Referral check failed' });
            }
            if (result.length > 0) {
                referred_by = result[0].id;
            }
            completeRegistration();
        });
    } else {
        completeRegistration();
    }

    function completeRegistration() {
        const sql = `INSERT INTO users (username, phone, password, referral_code, full_name, email, referred_by) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [username, phone, password, user_referral_code, full_name, email, referred_by], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.message.includes('username')) {
                        return res.json({ success: false, message: 'Username already exists' });
                    } else if (err.message.includes('phone')) {
                        return res.json({ success: false, message: 'Phone already registered' });
                    }
                }
                res.json({ success: false, message: 'Registration failed', error: err.message });
            } else {
                res.json({ 
                    success: true, 
                    message: 'Registration successful!',
                    user: {
                        id: result.insertId,
                        username: username,
                        referral_code: user_referral_code
                    }
                });
            }
        });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
        return res.json({ success: false, message: 'Phone and password required' });
    }

    const sql = `SELECT id, username, phone, full_name, email, referral_code,
                        balance_usd, balance_bdt, total_invested_usd, total_earned_bdt,
                        bep20_address, bkash_number
                 FROM users WHERE phone = ? AND password = ? AND status = 'active'`;
    
    db.query(sql, [phone, password], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Login failed', error: err.message });
        } else if (result.length > 0) {
            res.json({ success: true, message: 'Login successful!', user: result[0] });
        } else {
            res.json({ success: false, message: 'Invalid phone or password' });
        }
    });
});

// Get User Dashboard
app.get('/api/dashboard/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const userSql = `SELECT id, username, phone, full_name, email, referral_code,
                            balance_usd, balance_bdt, total_invested_usd, total_earned_bdt,
                            bep20_address, bkash_number
                     FROM users WHERE id = ?`;
    
    db.query(userSql, [userId], (err, userResult) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching dashboard' });
        }
        
        if (userResult.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const user = userResult[0];
        
        // Get active investments
        const investmentSql = `SELECT COUNT(*) as active_investments, 
                                      COALESCE(SUM(investment_usd), 0) as active_investment_usd
                               FROM investments WHERE user_id = ? AND status = 'active'`;
        
        db.query(investmentSql, [userId], (err, invResult) => {
            if (err) {
                return res.json({ success: false, message: 'Error fetching investments' });
            }
            
            // Get pending withdrawals
            const withdrawalSql = `SELECT COALESCE(SUM(amount_bdt), 0) as pending_withdrawals 
                                   FROM withdrawals WHERE user_id = ? AND status = 'pending'`;
            
            db.query(withdrawalSql, [userId], (err, wdResult) => {
                if (err) {
                    return res.json({ success: false, message: 'Error fetching withdrawals' });
                }
                
                // Get today's profit
                const today = new Date().toISOString().split('T')[0];
                const profitSql = `SELECT COALESCE(SUM(amount_bdt), 0) as today_profit 
                                   FROM profits WHERE user_id = ? AND profit_date = ?`;
                
                db.query(profitSql, [userId, today], (err, profitResult) => {
                    if (err) {
                        return res.json({ success: false, message: 'Error fetching profits' });
                    }
                    
                    // Get total commission
                    const commissionSql = `SELECT COALESCE(SUM(amount_bdt), 0) as total_commission 
                                           FROM commissions WHERE user_id = ?`;
                    
                    db.query(commissionSql, [userId], (err, commissionResult) => {
                        const dashboardData = {
                            user: {
                                id: user.id,
                                username: user.username,
                                balance_usd: parseFloat(user.balance_usd),
                                balance_bdt: parseFloat(user.balance_bdt),
                                total_invested_usd: parseFloat(user.total_invested_usd),
                                total_earned_bdt: parseFloat(user.total_earned_bdt),
                                referral_code: user.referral_code,
                                bep20_address: user.bep20_address,
                                bkash_number: user.bkash_number
                            },
                            stats: {
                                active_investments: invResult[0].active_investments,
                                active_investment_usd: parseFloat(invResult[0].active_investment_usd),
                                pending_withdrawals: parseFloat(wdResult[0].pending_withdrawals),
                                today_profit: parseFloat(profitResult[0].today_profit),
                                total_commission: parseFloat(commissionResult[0].total_commission)
                            }
                        };
                        
                        res.json({ success: true, data: dashboardData });
                    });
                });
            });
        });
    });
});

// Calculate Commission Function
function calculateCommissions(investorId, referrerId, investmentUSD, investmentId) {
    if (!referrerId) return;
    
    const commissionRate = commissionRates[investmentUSD];
    if (!commissionRate) return;
    
    // Level 1 Commission
    const level1Commission = commissionRate.level1;
    const updateSql = `UPDATE users SET balance_bdt = balance_bdt + ? WHERE id = ?`;
    
    db.query(updateSql, [level1Commission, referrerId], (err) => {
        if (!err) {
            const commissionSql = `INSERT INTO commissions (user_id, from_user_id, investment_id, level, amount_bdt) 
                                   VALUES (?, ?, ?, 1, ?)`;
            db.query(commissionSql, [referrerId, investorId, investmentId, level1Commission]);
        }
    });
    
    // Level 2 Commission
    const level2RefSql = 'SELECT referred_by FROM users WHERE id = ?';
    db.query(level2RefSql, [referrerId], (err, result) => {
        if (!err && result.length > 0 && result[0].referred_by) {
            const level2Referrer = result[0].referred_by;
            const level2Commission = commissionRate.level2;
            
            db.query(updateSql, [level2Commission, level2Referrer], (err) => {
                if (!err) {
                    const commissionSql = `INSERT INTO commissions (user_id, from_user_id, investment_id, level, amount_bdt) 
                                           VALUES (?, ?, ?, 2, ?)`;
                    db.query(commissionSql, [level2Referrer, investorId, investmentId, level2Commission]);
                }
            });
        }
    });
}

// Make Investment
app.post('/api/invest', (req, res) => {
    const { user_id, plan_id } = req.body;
    
    if (!user_id || !plan_id) {
        return res.json({ success: false, message: 'User ID and Plan ID required' });
    }
    
    const plan = investmentPlans[plan_id - 1];
    if (!plan) {
        return res.json({ success: false, message: 'Invalid plan' });
    }
    
    const balanceSql = 'SELECT balance_usd, referred_by FROM users WHERE id = ?';
    db.query(balanceSql, [user_id], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Balance check failed' });
        }
        
        if (result.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const userBalance = parseFloat(result[0].balance_usd);
        const referred_by = result[0].referred_by;
        const investmentAmount = plan.usd;
        
        if (userBalance < investmentAmount) {
            return res.json({ success: false, message: 'Insufficient USDT balance' });
        }
        
        // Start transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.json({ success: false, message: 'Transaction failed' });
            }
            
            // Deduct from balance
            const updateSql = `UPDATE users 
                              SET balance_usd = balance_usd - ?, 
                                  total_invested_usd = total_invested_usd + ? 
                              WHERE id = ?`;
            
            db.query(updateSql, [investmentAmount, investmentAmount, user_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.json({ success: false, message: 'Balance update failed' });
                    });
                }
                
                // Create investment
                const investmentSql = `INSERT INTO investments 
                                      (user_id, investment_usd, daily_profit_bdt) 
                                      VALUES (?, ?, ?)`;
                
                db.query(investmentSql, [user_id, investmentAmount, plan.daily_profit_bdt], (err, invResult) => {
                    if (err) {
                        return db.rollback(() => {
                            res.json({ success: false, message: 'Investment creation failed' });
                        });
                    }
                    
                    // Calculate commissions
                    calculateCommissions(user_id, referred_by, investmentAmount, invResult.insertId);
                    
                    // Commit transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.json({ success: false, message: 'Transaction failed' });
                            });
                        }
                        
                        res.json({ 
                            success: true, 
                            message: 'Investment successful!', 
                            investment: {
                                id: invResult.insertId,
                                investment_usd: investmentAmount,
                                daily_profit_bdt: plan.daily_profit_bdt
                            }
                        });
                    });
                });
            });
        });
    });
});

// Request Withdrawal
app.post('/api/withdraw', (req, res) => {
    const { user_id, amount_bdt, method, account_number } = req.body;
    
    if (!user_id || !amount_bdt || !method || !account_number) {
        return res.json({ success: false, message: 'All fields required' });
    }
    
    const withdrawalAmount = parseFloat(amount_bdt);
    
    if (withdrawalAmount < 500) {
        return res.json({ success: false, message: 'Minimum withdrawal 500 BDT' });
    }
    
    if (withdrawalAmount > 25000) {
        return res.json({ success: false, message: 'Maximum withdrawal 25,000 BDT' });
    }
    
    const balanceSql = 'SELECT balance_bdt FROM users WHERE id = ?';
    db.query(balanceSql, [user_id], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Balance check failed' });
        }
        
        if (result.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const userBalance = parseFloat(result[0].balance_bdt);
        
        if (userBalance < withdrawalAmount) {
            return res.json({ success: false, message: 'Insufficient BDT balance' });
        }
        
        // Start transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.json({ success: false, message: 'Transaction failed' });
            }
            
            // Deduct balance
            const updateSql = 'UPDATE users SET balance_bdt = balance_bdt - ? WHERE id = ?';
            db.query(updateSql, [withdrawalAmount, user_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.json({ success: false, message: 'Balance update failed' });
                    });
                }
                
                // Create withdrawal request
                const withdrawalSql = `INSERT INTO withdrawals (user_id, amount_bdt, method, account_number) 
                                       VALUES (?, ?, ?, ?)`;
                
                db.query(withdrawalSql, [user_id, withdrawalAmount, method, account_number], (err, wdResult) => {
                    if (err) {
                        return db.rollback(() => {
                            res.json({ success: false, message: 'Withdrawal request failed' });
                        });
                    }
                    
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.json({ success: false, message: 'Transaction failed' });
                            });
                        }
                        
                        res.json({ 
                            success: true, 
                            message: 'Withdrawal request submitted!', 
                            withdrawal: {
                                id: wdResult.insertId,
                                amount_bdt: withdrawalAmount,
                                method: method,
                                status: 'pending'
                            }
                        });
                    });
                });
            });
        });
    });
});

// Update Profile
app.post('/api/profile/update', (req, res) => {
    const { user_id, full_name, email, bkash_number } = req.body;
    
    if (!user_id) {
        return res.json({ success: false, message: 'User ID required' });
    }
    
    const sql = `UPDATE users SET full_name = ?, email = ?, bkash_number = ? WHERE id = ?`;
    
    db.query(sql, [full_name, email, bkash_number, user_id], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Profile update failed' });
        } else {
            res.json({ success: true, message: 'Profile updated successfully' });
        }
    });
});

// Get User Investments
app.get('/api/investments/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const sql = `SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC`;
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching investments' });
        } else {
            res.json({ success: true, investments: result });
        }
    });
});

// Get User Withdrawals
app.get('/api/withdrawals/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const sql = `SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC`;
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching withdrawals' });
        } else {
            res.json({ success: true, withdrawals: result });
        }
    });
});

// Get User Commissions
app.get('/api/commissions/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const sql = `SELECT c.*, u.username as from_username, i.investment_usd
                 FROM commissions c 
                 JOIN users u ON c.from_user_id = u.id 
                 JOIN investments i ON c.investment_id = i.id
                 WHERE c.user_id = ? 
                 ORDER BY c.created_at DESC`;
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching commissions' });
        } else {
            res.json({ success: true, commissions: result });
        }
    });
});

// Deposit Request
app.post('/api/deposit', (req, res) => {
    const { user_id, amount_usd, transaction_hash } = req.body;
    
    if (!user_id || !amount_usd || !transaction_hash) {
        return res.json({ success: false, message: 'All fields required' });
    }
    
    const sql = `INSERT INTO deposits (user_id, amount_usd, transaction_hash) 
                 VALUES (?, ?, ?)`;
    
    db.query(sql, [user_id, amount_usd, transaction_hash], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Deposit request failed' });
        } else {
            res.json({ 
                success: true, 
                message: 'Deposit request submitted!', 
                deposit: {
                    id: result.insertId,
                    amount_usd: amount_usd,
                    status: 'pending'
                }
            });
        }
    });
});

// ==================== ADMIN API ROUTES ====================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = `SELECT id, username, role, permissions FROM admin_users 
                 WHERE username = ? AND password = ? AND status = 'active'`;
    
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Admin login failed' });
        } else if (result.length > 0) {
            res.json({ 
                success: true, 
                message: 'Admin login successful!',
                admin: result[0]
            });
        } else {
            res.json({ success: false, message: 'Invalid admin credentials' });
        }
    });
});

// Get Admin Dashboard Stats
app.get('/api/admin/dashboard', (req, res) => {
    const statsSql = `
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
            (SELECT COUNT(*) FROM investments WHERE status = 'active') as active_investments,
            (SELECT COALESCE(SUM(investment_usd), 0) FROM investments) as total_investment_usd,
            (SELECT COALESCE(SUM(amount_bdt), 0) FROM withdrawals WHERE status = 'pending') as pending_withdrawals,
            (SELECT COALESCE(SUM(amount_bdt), 0) FROM profits WHERE DATE(profit_date) = CURDATE()) as today_profits,
            (SELECT COALESCE(SUM(amount_bdt), 0) FROM commissions) as total_commissions
    `;
    
    db.query(statsSql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching stats' });
        } else {
            res.json({ success: true, stats: result[0] });
        }
    });
});

// Get All Users
app.get('/api/admin/users', (req, res) => {
    const sql = `SELECT id, username, phone, full_name, email, referral_code,
                        balance_usd, balance_bdt, total_invested_usd, total_earned_bdt,
                        status, created_at
                 FROM users ORDER BY created_at DESC`;
    
    db.query(sql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching users' });
        } else {
            res.json({ success: true, users: result });
        }
    });
});

// Get User Details
app.get('/api/admin/users/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const userSql = `SELECT * FROM users WHERE id = ?`;
    const investmentsSql = `SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC`;
    const withdrawalsSql = `SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC`;
    
    db.query(userSql, [userId], (err, userResult) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching user' });
        }
        
        db.query(investmentsSql, [userId], (err, invResult) => {
            if (err) {
                return res.json({ success: false, message: 'Error fetching investments' });
            }
            
            db.query(withdrawalsSql, [userId], (err, wdResult) => {
                if (err) {
                    return res.json({ success: false, message: 'Error fetching withdrawals' });
                }
                
                res.json({ 
                    success: true, 
                    user: userResult[0],
                    investments: invResult,
                    withdrawals: wdResult
                });
            });
        });
    });
});

// Update User Status
app.post('/api/admin/users/update-status', (req, res) => {
    const { user_id, status } = req.body;
    
    const sql = `UPDATE users SET status = ? WHERE id = ?`;
    
    db.query(sql, [status, user_id], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'User update failed' });
        } else {
            res.json({ success: true, message: `User ${status} successfully` });
        }
    });
});

// Get All Investments
app.get('/api/admin/investments', (req, res) => {
    const sql = `SELECT i.*, u.username, u.phone 
                 FROM investments i 
                 JOIN users u ON i.user_id = u.id 
                 ORDER BY i.created_at DESC`;
    
    db.query(sql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching investments' });
        } else {
            res.json({ success: true, investments: result });
        }
    });
});

// Get Pending Withdrawals
app.get('/api/admin/withdrawals/pending', (req, res) => {
    const sql = `SELECT w.*, u.username, u.phone, u.bkash_number
                 FROM withdrawals w 
                 JOIN users u ON w.user_id = u.id 
                 WHERE w.status = 'pending' 
                 ORDER BY w.created_at DESC`;
    
    db.query(sql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching withdrawals' });
        } else {
            res.json({ success: true, withdrawals: result });
        }
    });
});

// Approve/Reject Withdrawal
app.post('/api/admin/withdrawals/update', (req, res) => {
    const { withdrawal_id, status, admin_notes } = req.body;
    
    const updateSql = `UPDATE withdrawals SET status = ?, admin_notes = ? WHERE id = ?`;
    
    db.query(updateSql, [status, admin_notes, withdrawal_id], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Withdrawal update failed' });
        } else {
            // If rejected, return money to user balance
            if (status === 'rejected') {
                const getAmountSql = `SELECT user_id, amount_bdt FROM withdrawals WHERE id = ?`;
                db.query(getAmountSql, [withdrawal_id], (err, wdResult) => {
                    if (!err && wdResult.length > 0) {
                        const returnSql = `UPDATE users SET balance_bdt = balance_bdt + ? WHERE id = ?`;
                        db.query(returnSql, [wdResult[0].amount_bdt, wdResult[0].user_id]);
                    }
                });
            }
            
            res.json({ success: true, message: `Withdrawal ${status} successfully` });
        }
    });
});

// Get All Commissions
app.get('/api/admin/commissions', (req, res) => {
    const sql = `SELECT c.*, u.username as receiver, u2.username as from_user, i.investment_usd
                 FROM commissions c 
                 JOIN users u ON c.user_id = u.id 
                 JOIN users u2 ON c.from_user_id = u2.id
                 JOIN investments i ON c.investment_id = i.id
                 ORDER BY c.created_at DESC`;
    
    db.query(sql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching commissions' });
        } else {
            res.json({ success: true, commissions: result });
        }
    });
});

// Get System Analytics
app.get('/api/admin/analytics', (req, res) => {
    const analyticsSql = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as users_7days,
            (SELECT COALESCE(SUM(investment_usd), 0) FROM investments WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as investment_7days,
            (SELECT COALESCE(SUM(amount_bdt), 0) FROM profits WHERE DATE(profit_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as profits_7days,
            (SELECT COALESCE(SUM(amount_bdt), 0) FROM withdrawals WHERE status = 'approved' AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as withdrawals_7days
    `;
    
    db.query(analyticsSql, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error fetching analytics' });
        } else {
            res.json({ success: true, analytics: result[0] });
        }
    });
});

// Add Manual Profit
app.post('/api/admin/profits/add', (req, res) => {
    const { user_id, investment_id, amount_bdt, profit_date } = req.body;
    
    const sql = `INSERT INTO profits (user_id, investment_id, amount_bdt, profit_date) 
                 VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [user_id, investment_id, amount_bdt, profit_date || new Date().toISOString().split('T')[0]], (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Profit addition failed' });
        } else {
            // Update user balance
            const updateSql = `UPDATE users SET balance_bdt = balance_bdt + ?, total_earned_bdt = total_earned_bdt + ? WHERE id = ?`;
            db.query(updateSql, [amount_bdt, amount_bdt, user_id], (err) => {
                if (err) {
                    res.json({ success: false, message: 'Profit added but balance update failed' });
                } else {
                    res.json({ success: true, message: 'Profit added successfully' });
                }
            });
        }
    });
});

// ==================== START SERVER ====================

const PORT = 5000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 HELPUS INVESTMENT SERVER STARTED!');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔗 BEP20: ${DEFAULT_BEP20}`);
    console.log('='.repeat(60));
});