import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { sendEmail, getEmailTemplate } from "./src/services/emailService.ts";

dotenv.config();
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASS;
const adminEmail = process.env.ADMIN_EMAIL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "edureserve-secret-key-2026";

// Initialize Database
const db = new Database("edureserve.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mobile TEXT,
    grade TEXT,
    role TEXT DEFAULT 'student',
    status TEXT DEFAULT 'Active',
    student_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    student_grade TEXT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    size TEXT,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    rejection_reason TEXT,
    status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS reset_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    sizes TEXT NOT NULL, -- JSON string of size levels
    status TEXT DEFAULT 'Available'
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    entity_type TEXT,
    entity_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Helper to seed inventory if not exists
const seedInventory = () => {
  const row = db.prepare("SELECT count(*) as count FROM inventory").get();
  if (row.count === 0) {
    const initialInventory = [
      { name: 'Pre-School Blouse', category: 'Pre-School', gender: 'Female', sizes: { S: 15, M: 22, L: 8 } },
      { name: 'Pre-School Skirt', category: 'Pre-School', gender: 'Female', sizes: { S: 10, M: 10, L: 5 } },
      { name: 'Pre-School PE Shirt', category: 'Pre-School', gender: 'Female', sizes: { S: 20, M: 20, L: 10 } },
      { name: 'Pre-School PE Pants', category: 'Pre-School', gender: 'Female', sizes: { S: 20, M: 20, L: 10 } },
      { name: 'Pre-School Ribbon', category: 'Pre-School', gender: 'Female', sizes: { Standard: 50 } },
      { name: 'Pre-School ID Lace', category: 'Pre-School', gender: 'General', sizes: { Standard: 50 } },
      { name: 'Pre-School Polo', category: 'Pre-School', gender: 'Male', sizes: { S: 15, M: 22, L: 8 } },
      { name: 'Pre-School Shorts', category: 'Pre-School', gender: 'Male', sizes: { S: 10, M: 10, L: 5 } },
      { name: 'Pre-School PE Shirt', category: 'Pre-School', gender: 'Male', sizes: { S: 20, M: 20, L: 10 } },
      { name: 'Pre-School PE Pants', category: 'Pre-School', gender: 'Male', sizes: { S: 20, M: 20, L: 10 } },
      { name: 'Pre-School Ribbon', category: 'Pre-School', gender: 'Male', sizes: { Standard: 50 } },
      { name: 'Grade School Long Sleeves', category: 'Grade School', gender: 'Female', sizes: { S: 25, M: 30, L: 15 } },
      { name: 'Grade School Pencil Skirt', category: 'Grade School', gender: 'Female', sizes: { S: 15, M: 15, L: 10 } },
      { name: 'Grade School Vest', category: 'Grade School', gender: 'Female', sizes: { S: 10, M: 10, L: 5 } },
      { name: 'Grade School PE Shirt', category: 'Grade School', gender: 'Female', sizes: { S: 25, M: 25, L: 15 } },
      { name: 'Grade School PE Pants', category: 'Grade School', gender: 'Female', sizes: { S: 25, M: 25, L: 15 } },
      { name: 'Grade School Neck Tie', category: 'Grade School', gender: 'Female', sizes: { Standard: 50 } },
      { name: 'Grade School ID Lace', category: 'Grade School', gender: 'General', sizes: { Standard: 50 } },
      { name: 'Grade School Polo', category: 'Grade School', gender: 'Male', sizes: { S: 25, M: 30, L: 15 } },
      { name: 'Grade School Pants', category: 'Grade School', gender: 'Male', sizes: { S: 15, M: 15, L: 10 } },
      { name: 'Grade School Vest', category: 'Grade School', gender: 'Male', sizes: { S: 10, M: 10, L: 5 } },
      { name: 'Grade School PE Shirt', category: 'Grade School', gender: 'Male', sizes: { S: 25, M: 25, L: 15 } },
      { name: 'Grade School PE Pants', category: 'Grade School', gender: 'Male', sizes: { S: 25, M: 25, L: 15 } },
      { name: 'Grade School Neck Tie', category: 'Grade School', gender: 'Male', sizes: { Standard: 50 } },
      { name: 'High School Long Sleeves', category: 'High School', gender: 'Female', sizes: { S: 20, M: 25, L: 15 } },
      { name: 'High School Pencil Skirt', category: 'High School', gender: 'Female', sizes: { S: 15, M: 15, L: 10 } },
      { name: 'High School PE Shirt', category: 'High School', gender: 'Female', sizes: { S: 30, M: 40, L: 20 } },
      { name: 'High School PE Pants', category: 'High School', gender: 'Female', sizes: { S: 30, M: 40, L: 20 } },
      { name: 'High School Neck Tie', category: 'High School', gender: 'Female', sizes: { Standard: 50 } },
      { name: 'High School ID Lace', category: 'High School', gender: 'General', sizes: { Standard: 50 } },
      { name: 'High School Polo', category: 'High School', gender: 'Male', sizes: { S: 20, M: 25, L: 15 } },
      { name: 'High School Pants', category: 'High School', gender: 'Male', sizes: { S: 15, M: 15, L: 10 } },
      { name: 'High School PE Shirt', category: 'High School', gender: 'Male', sizes: { S: 30, M: 40, L: 20 } },
      { name: 'High School PE Pants', category: 'High School', gender: 'Male', sizes: { S: 30, M: 40, L: 20 } },
      { name: 'High School Neck Tie', category: 'High School', gender: 'Male', sizes: { Standard: 50 } },
    ];

    const insert = db.prepare("INSERT INTO inventory (name, category, gender, sizes, status) VALUES (?, ?, ?, ?, ?)");
    initialInventory.forEach(item => {
      insert.run(item.name, item.category, item.gender, JSON.stringify(item.sizes), 'Available');
    });
  }
};
seedInventory();

// Helper to seed admin if not exists
const seedAdmin = () => {
  const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@asiatech.edu.ph");
  if (!admin) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (name, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)")
      .run("Admin User", "admin@asiatech.edu.ph", hashedPassword, "admin", "ADM-2025-001");
  } else if (admin.role !== 'admin') {
    // If user exists but is not an admin, elevate them
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run("admin@asiatech.edu.ph");
  }
};
seedAdmin();

// Migration: Add new columns if they don't exist
const migrations = [
  "ALTER TABLE users ADD COLUMN first_name TEXT",
  "ALTER TABLE users ADD COLUMN last_name TEXT",
  "ALTER TABLE users ADD COLUMN username TEXT",
  "ALTER TABLE users ADD COLUMN grade TEXT",
  "ALTER TABLE inventory ADD COLUMN status TEXT DEFAULT 'Available'",
  "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN verification_code TEXT",
  "ALTER TABLE users ADD COLUMN verification_expires_at TEXT",
  "UPDATE inventory SET category = 'Pre-School' WHERE name LIKE 'Pre-School%' AND category = 'Accessories'",
  "UPDATE inventory SET category = 'Grade School' WHERE name LIKE 'Grade School%' AND category = 'Accessories'",
  "UPDATE inventory SET category = 'High School' WHERE name LIKE 'High School%' AND category = 'Accessories'",
  "UPDATE inventory SET name = 'Grade School Pencil Skirt' WHERE name = 'Grade School Skirt' AND category = 'Grade School'",
  "UPDATE inventory SET gender = 'General' WHERE name LIKE '%ID Lace%'",
  "DELETE FROM inventory WHERE id NOT IN (SELECT MIN(id) FROM inventory GROUP BY name, category, gender)"
];

migrations.forEach(sql => {
  try {
    db.prepare(sql).run();
  } catch (e) {
    // Column already exists
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  };

  const createAuditLog = (userId: number, action: string, details: string, entityType?: string, entityId?: string) => {
    try {
      db.prepare("INSERT INTO audit_logs (user_id, action, details, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)")
        .run(userId, action, details, entityType || null, entityId || null);
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  };

  // Auth APIs
  app.post("/api/auth/register", async (req, res) => {
    const { firstName, lastName, username, email, password, mobile, role, grade } = req.body;
    
    // Safety check: absolutely prohibit registration for administrative roles
    if (role === 'admin') {
      return res.status(403).json({ message: "Registration of administrative roles is not allowed via this form." });
    }

    // Student domain check: only allow official asiatech.edu.ph emails for students
    if (role === 'student') {
      const isOfficial = email.endsWith('@asiatech.edu.ph');
      const studentIdMatch = email.match(/^1-\d+/);
      if (!isOfficial || !studentIdMatch) {
        return res.status(403).json({ message: "Students must use their institutional email" });
      }
    }
    
    // Check if email already exists
    const existingUser = db.prepare("SELECT email FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ message: "Account already exists. Please log in." });
    }
    
    // Check if username already exists
    if (username) {
      const existingUsername = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const emailPrefix = email.split('@')[0];
      const studentId = role === 'admin' ? `ADM-2025-${Math.floor(100 + Math.random() * 900)}` : emailPrefix;
      const fullName = `${firstName} ${lastName}`;
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      
      const result = db.prepare("INSERT INTO users (first_name, last_name, username, name, email, password, mobile, role, student_id, grade, is_verified, verification_code, verification_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(firstName, lastName, username, fullName, email, hashedPassword, mobile, role || 'student', studentId, grade, 0, verificationCode, verificationExpiresAt);
      
      const newUserId = result.lastInsertRowid as number;
      createAuditLog(newUserId, "USER_REGISTER", `Account registered: ${fullName} (${email})`, "user", newUserId.toString());
      
      const user = { id: newUserId, email, name: fullName, originalName: username, role: role || 'student', grade };
      
      // Send verification email
      try {
        const emailContent = `
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Thank you for registering with EduReserve. Please verify your email address to activate your account.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #385723;">
            <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <h2 style="margin: 10px 0 0 0; color: #385723; font-size: 36px; letter-spacing: 5px;">${verificationCode}</h2>
          </div>
          <p>This code will expire in 24 hours.</p>
        `;

        await sendEmail({
          to: email,
          subject: "EduReserve - Email Verification",
          html: getEmailTemplate("Verify Your Email", emailContent)
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      res.json({ 
        success: true, 
        message: "Registration successful. Please check your email for a verification code.",
        needsVerification: true,
        email
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    const { email, code } = req.body;
    
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date(user.verification_expires_at) < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please register again or request a new code." });
    }

    try {
      db.prepare("UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE email = ?").run(email);
      
      const tokenUser = { id: user.id, email: user.email, name: user.name, role: user.role, grade: user.grade };
      const token = jwt.sign(tokenUser, JWT_SECRET);
      
      res.json({ success: true, message: "Email verified successfully", token, user: tokenUser });
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Email not found" });
    }

    if (!user.is_verified && user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: "Email verification required. Please check your email or verify your account.",
        needsVerification: true,
        email: user.email
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Your password is incorrect" });
    }

    // Strict Admin Email Check: Only allow the official admin email to login with admin privileges
    if (user.role === 'admin' && user.email !== 'admin@asiatech.edu.ph') {
      return res.status(403).json({ success: false, message: "Access denied. Unauthorized administrative account." });
    }

    // Strict Student Domain Check: Ensure student accounts are using institutional emails
    if (user.role === 'student') {
      const isOfficial = user.email.endsWith('@asiatech.edu.ph');
      const studentIdMatch = user.email.match(/^1-\d+/);
      if (!isOfficial || !studentIdMatch) {
         return res.status(403).json({ success: false, message: "Students must use their institutional email" });
      }
    }

    const tokenUser = { id: user.id, email: user.email, name: user.name, role: user.role, grade: user.grade };
    const token = jwt.sign(tokenUser, JWT_SECRET);
    
    res.json({ success: true, token, user: tokenUser });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log(`Password reset requested for email: ${email}`);
    
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: "Invalid Email" });
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    const targetEmail = user.email;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    db.prepare("DELETE FROM reset_codes WHERE email = ?").run(targetEmail);
    db.prepare("INSERT INTO reset_codes (email, code, expires_at) VALUES (?, ?, ?)")
      .run(targetEmail, code, expiresAt);
    console.log(`Generated reset code ${code} for ${targetEmail}, expires at ${expiresAt}`);

    try {
      const emailContent = `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You have requested to reset your password for your EduReserve account.</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #385723;">
          <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <h2 style="margin: 10px 0 0 0; color: #385723; font-size: 36px; letter-spacing: 5px;">${code}</h2>
        </div>
        <p>This code will expire in 15 minutes. If you did not request this reset, please ignore this email.</p>
      `;

      await sendEmail({
        to: targetEmail,
        subject: "EduReserve - Password Reset Verification Code",
        html: getEmailTemplate("Password Reset Request", emailContent)
      });

      res.json({ success: true, message: `Verification code sent to your email` });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    
    const resetEntry: any = db.prepare("SELECT * FROM reset_codes WHERE email = ? AND code = ?").get(email, code);
    
    if (!resetEntry) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date(resetEntry.expires_at) < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hashedPassword, email);
      db.prepare("DELETE FROM reset_codes WHERE email = ?").run(email);

      res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Profile API
  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const user: any = db.prepare("SELECT id, name, email, mobile, role, status, student_id, grade, created_at FROM users WHERE id = ?").get(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get stats
    const stats: any = db.prepare("SELECT COUNT(*) as total FROM reservations WHERE user_id = ?").get(req.user.id);
    
    res.json({ 
      ...user, 
      uid: user.id,
      reservations_count: stats.total 
    });
  });

  // Profile Update APIs
  app.patch("/api/profile/update", authenticateToken, (req: any, res) => {
    const { name, grade } = req.body;
    
    try {
      if (name) {
        db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
      }
      if (grade) {
        db.prepare("UPDATE users SET grade = ? WHERE id = ?").run(grade, req.user.id);
      }
      
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/profile/change-password", authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
      const user: any = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id);
      
      const isCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id);
      
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Reservations APIs
  app.get("/api/reservations", authenticateToken, (req: any, res) => {
    let query = "SELECT * FROM reservations";
    let params = [];
    
    if (req.user.role !== 'admin') {
      query += " WHERE user_id = ?";
      params.push(req.user.id);
    }
    
    const reservations = db.prepare(query).all(...params);
    res.json(reservations);
  });

  app.post("/api/reserve", authenticateToken, async (req: any, res) => {
    const { 
      category, 
      gender, 
      set, 
      individualItem, 
      size, 
      quantity,
      studentGrade
    } = req.body;

    const itemName = individualItem || set;
    const reservationId = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      // Stock management
      const inventoryItem: any = db.prepare("SELECT * FROM inventory WHERE name = ? AND category = ?").get(itemName, category);
      if (!inventoryItem) {
        console.error(`Reservation failed: Item "${itemName}" not found in category "${category}"`);
        return res.status(404).json({ message: `Inventory mismatch: "${itemName}" was not found.` });
      }

      const sizes = JSON.parse(inventoryItem.sizes);
      let requestedSize = size || 'Standard';
      
      // Map full names from frontend to short keys in database (S, M, L)
      if (requestedSize === 'Small') requestedSize = 'S';
      else if (requestedSize === 'Medium') requestedSize = 'M';
      else if (requestedSize === 'Large') requestedSize = 'L';
      
      const availableStock = sizes[requestedSize] || 0;
      
      if (availableStock < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Only ${availableStock} left for size ${requestedSize === 'Standard' ? 'Standard' : (requestedSize === 'S' ? 'Small' : requestedSize === 'M' ? 'Medium' : 'Large')}.` });
      }

      // Deduct stock
      sizes[requestedSize] -= quantity;
      db.prepare("UPDATE inventory SET sizes = ? WHERE id = ?").run(JSON.stringify(sizes), inventoryItem.id);

      db.prepare(`
        INSERT INTO reservations (id, user_id, student_name, student_grade, item_name, category, gender, size, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(reservationId, req.user.id, req.user.name, studentGrade, itemName, category, gender, requestedSize, quantity);

      createAuditLog(
        req.user.id, 
        "RESERVATION_CREATE", 
        `New reservation created: ${reservationId} - ${itemName} (${requestedSize}) x${quantity}`,
        "reservation",
        reservationId
      );

      // Create In-App Notification for User
      db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
        .run(req.user.id, `Your reservation for ${itemName} has been received.`);

      // Create In-App Notification for Admins
      const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
      admins.forEach((admin: any) => {
        db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
          .run(admin.id, `New reservation ${reservationId} received from ${req.user.name}.`);
      });

      // Send Confirmation Email
      const emailContent = `
        <p>Hello <strong>${req.user.name}</strong>,</p>
        <p>Your reservation for EduReserve has been received successfully. Please wait for admin approval.</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #385723;">
          <p style="margin: 5px 0;"><strong>Reservation ID:</strong> <span style="color: #385723; font-weight: bold;">${reservationId}</span></p>
          <p style="margin: 5px 0;"><strong>Student Name:</strong> ${req.user.name}</p>
          <p style="margin: 5px 0;"><strong>Grade Level:</strong> ${studentGrade || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Item:</strong> ${itemName}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 5px 0;"><strong>Size:</strong> ${size || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity}</p>
        </div>
        <p>You will receive another notification once your reservation status is updated.</p>
      `;

      const emailBody = getEmailTemplate("Reservation Received", emailContent);

      await sendEmail({
        to: req.user.email, 
        subject: `EduReserve - Reservation Received (${reservationId})`, 
        html: emailBody
      });

      // Notify Admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const adminContent = `
          <p>A new reservation has been submitted and is awaiting your review.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #385723;">
            <p style="margin: 5px 0;"><strong>Reservation ID:</strong> ${reservationId}</p>
            <p style="margin: 5px 0;"><strong>Student:</strong> ${req.user.name}</p>
            <p style="margin: 5px 0;"><strong>Item:</strong> ${itemName}</p>
            <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity}</p>
          </div>
          <p><a href="${process.env.APP_URL || '#'}" style="display: inline-block; background: #385723; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a></p>
        `;
        await sendEmail({
          to: adminEmail,
          subject: `New Reservation Alert - ${reservationId}`,
          html: getEmailTemplate("New Reservation Submitted", adminContent)
        });
      }

      res.json({ 
        success: true, 
        message: "Reservation successful! Confirmation email sent.",
        reservationId
      });
    } catch (error) {
      console.error("Reservation error:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  app.patch("/api/reservations/:id", authenticateToken, async (req: any, res) => {
    const { status, reason } = req.body;
    const { id } = req.params;
    
    try {
      // Get reservation and user details first
      const reservation: any = db.prepare(`
        SELECT r.*, u.email, u.name as user_name 
        FROM reservations r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
      `).get(id);

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      // If status becomes 'Rejected' and it wasn't already rejected or cancelled, return stock
      if (status === 'Rejected' && reservation.status !== 'Rejected' && reservation.status !== 'Cancelled') {
        const inventoryItem: any = db.prepare("SELECT * FROM inventory WHERE name = ? AND category = ? AND gender = ?").get(reservation.item_name, reservation.category, reservation.gender);
        if (inventoryItem) {
          const sizes = JSON.parse(inventoryItem.sizes);
          const sizeKey = reservation.size || 'Standard';
          sizes[sizeKey] += reservation.quantity;
          db.prepare("UPDATE inventory SET sizes = ? WHERE id = ?").run(JSON.stringify(sizes), inventoryItem.id);
        }
      }

      db.prepare("UPDATE reservations SET status = ?, rejection_reason = ?, status_updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(status, reason || null, id);

      createAuditLog(
        req.user.id, 
        "STATUS_UPDATE", 
        `Updated reservation ${id} status to ${status}${reason ? ` (Reason: ${reason})` : ''}`,
        "reservation",
        id
      );

      // Create In-App Notification
      let notifMessage = `Your reservation ${id} status has been updated to ${status}.`;
      if (status === 'Rejected' && reason) {
        notifMessage = `Your reservation ${id} has been Rejected. Reason: ${reason}`;
      }
      
      db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
        .run(reservation.user_id, notifMessage);

      // Send status update email
      if (reservation) {
        const emailContent = `
          <p>Hello <strong>${reservation.user_name}</strong>,</p>
          <p>The status of your reservation <strong>${id}</strong> has been updated to:</p>
          <div style="background: #e2efda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #385723;">
            <h3 style="margin: 0; color: #385723; text-transform: uppercase; font-size: 24px;">${status}</h3>
          </div>
          ${status === 'Rejected' && reason ? `<p style="padding: 15px; background: #fff1f2; border-radius: 8px; border: 1px solid #fda4af; color: #be123c;"><strong>Reason for Rejection:</strong> ${reason}</p>` : ''}
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Item:</strong> ${reservation.item_name}</p>
            <p style="margin: 5px 0;"><strong>Size:</strong> ${reservation.size || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Quantity:</strong> ${reservation.quantity}</p>
          </div>
          ${status === 'Ready for Pickup' ? '<p style="color: #385723; font-weight: bold; font-size: 18px; text-align: center;">You can now visit the school office to pick up your items.</p>' : ''}
        `;

        const emailBody = getEmailTemplate("Reservation Status Updated", emailContent);

        await sendEmail({
          to: reservation.email, 
          subject: `EduReserve - Status Update (${id})`, 
          html: emailBody
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Update reservation error:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });

  app.delete("/api/reservations/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    
    try {
      const reservation: any = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      // For students, only allow cancelling pending reservations
      if (req.user.role !== 'admin') {
        if (reservation.user_id !== req.user.id || reservation.status !== 'Pending') {
          return res.status(403).json({ message: "Cannot cancel this reservation" });
        }
      }
      
      // Return stock if it was not already cancelled or rejected
      if (reservation.status !== 'Cancelled' && reservation.status !== 'Rejected') {
        const inventoryItem: any = db.prepare("SELECT * FROM inventory WHERE name = ? AND category = ? AND gender = ?").get(reservation.item_name, reservation.category, reservation.gender);
        if (inventoryItem) {
          const sizes = JSON.parse(inventoryItem.sizes);
          const sizeKey = reservation.size || 'Standard';
          sizes[sizeKey] += reservation.quantity;
          db.prepare("UPDATE inventory SET sizes = ? WHERE id = ?").run(JSON.stringify(sizes), inventoryItem.id);
        }
      }

      db.prepare("UPDATE reservations SET status = 'Cancelled', status_updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(id);

      createAuditLog(
        req.user.id, 
        "CANCEL_RESERVATION", 
        `Cancelled reservation ${id}`,
        "reservation",
        id
      );

      // Create In-App Notification
      db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
        .run(reservation.user_id, `Your reservation for ${reservation.item_name} has been cancelled.`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Cancel error:", error);
      res.status(500).json({ message: "Failed to cancel reservation" });
    }
  });

  // Inventory APIs
  app.get("/api/inventory", authenticateToken, (req, res) => {
    const inventory = db.prepare("SELECT * FROM inventory").all();
    const formattedInventory = inventory.map((item: any) => ({
      ...item,
      sizes: JSON.parse(item.sizes)
    }));
    res.json(formattedInventory);
  });

  app.put("/api/inventory/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    const { name, category, gender, sizes, status } = req.body;
    db.prepare("UPDATE inventory SET name = ?, category = ?, gender = ?, sizes = ?, status = ? WHERE id = ?")
      .run(name, category, gender, JSON.stringify(sizes), status || 'Available', id);

    createAuditLog(
      req.user.id, 
      "INVENTORY_UPDATE", 
      `Updated inventory item ${name} (ID: ${id}) stocks/details`,
      "inventory",
      id
    );
    res.json({ success: true });
  });

  app.post("/api/inventory", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { name, category, gender, sizes, status } = req.body;
    const result = db.prepare("INSERT INTO inventory (name, category, gender, sizes, status) VALUES (?, ?, ?, ?, ?)")
      .run(name, category, gender, JSON.stringify(sizes), status || 'Available');
    
    createAuditLog(
      req.user.id, 
      "INVENTORY_ADD", 
      `Added new inventory item: ${name} (ID: ${result.lastInsertRowid})`,
      "inventory",
      result.lastInsertRowid.toString()
    );
    res.json({ success: true, id: result.lastInsertRowid });
  });

  // Admin Student APIs
  app.get("/api/admin/students", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const students = db.prepare("SELECT id, name, email, mobile as phone, grade, status, is_verified, created_at as joined FROM users WHERE role = 'student'").all();
    res.json(students);
  });

  app.patch("/api/admin/students/:id/status", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { status } = req.body;
    const { id } = req.params;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, id);

    createAuditLog(
      req.user.id, 
      "STUDENT_STATUS_UPDATE", 
      `Updated student (ID: ${id}) status to ${status}`,
      "student",
      id
    );
    res.json({ success: true });
  });

  app.patch("/api/admin/students/:id/verify", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    db.prepare("UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?").run(id);

    createAuditLog(
      req.user.id, 
      "STUDENT_VERIFY", 
      `Manually verified student account (ID: ${id})`,
      "student",
      id
    );
    res.json({ success: true });
  });

  app.delete("/api/admin/students/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    createAuditLog(
      req.user.id, 
      "STUDENT_DELETE", 
      `Deleted student account (ID: ${id})`,
      "student",
      id
    );
    res.json({ success: true });
  });

  // Notifications APIs
  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    db.prepare("UPDATE notifications SET status = 'Read' WHERE id = ? AND user_id = ?").run(id, req.user.id);
    res.json({ success: true });
  });

  // Audit Logs API
  app.get("/api/admin/audit-logs", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const logs = db.prepare(`
      SELECT al.*, u.name as admin_name 
      FROM audit_logs al 
      JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC
    `).all();
    res.json(logs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
