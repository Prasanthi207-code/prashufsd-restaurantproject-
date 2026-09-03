const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pantryjunction",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function clean(value) {
    return typeof value === "string" ? value.trim() : value;
}

function validEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/", (req, res) => {
    res.send("Restaurant Management Backend is running");
});

app.get("/test", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ success: true, message: "Backend and database are working", database: "connected" });
    } catch (error) {
        res.json({ success: true, message: "Backend is running", database: "disconnected" });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { full_name, email, phone, delivery_address, password } = req.body;
        if (!full_name || !validEmail(email) || !password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Enter a valid name, email and password of at least 6 characters" });
        }
        const normalizedEmail = clean(email).toLowerCase();
        const [existing] = await pool.query("SELECT user_id FROM signup WHERE email = ?", [normalizedEmail]);
        if (existing.length) return res.status(409).json({ success: false, message: "Email already registered" });
        const [result] = await pool.query(
            "INSERT INTO signup (full_name, email, phone, delivery_address, password) VALUES (?, ?, ?, ?, ?)",
            [clean(full_name), normalizedEmail, clean(phone || ""), clean(delivery_address || ""), await bcrypt.hash(password, 12)]
        );
        res.status(201).json({ success: true, message: "Account created successfully", user_id: result.insertId });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
        const [users] = await pool.query("SELECT user_id, full_name, email, phone, delivery_address, password FROM signup WHERE email = ?", [clean(email).toLowerCase()]);
        if (!users.length || !(await bcrypt.compare(password, users[0].password))) return res.status(401).json({ success: false, message: "Incorrect email or password" });
        const user = users[0];
        delete user.password;
        res.json({ success: true, message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

app.get("/profile/:email", async (req, res) => {
    try {
        const [users] = await pool.query("SELECT user_id, full_name, email, phone, delivery_address FROM signup WHERE email = ?", [clean(req.params.email).toLowerCase()]);
        if (!users.length) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.put("/update-profile", async (req, res) => {
    try {
        const { user_id, full_name, email, phone, delivery_address } = req.body;
        if (!user_id || !full_name || !validEmail(email)) return res.status(400).json({ success: false, message: "Valid user ID, name and email are required" });
        const [result] = await pool.query("UPDATE signup SET full_name = ?, email = ?, phone = ?, delivery_address = ? WHERE user_id = ?", [clean(full_name), clean(email).toLowerCase(), clean(phone || ""), clean(delivery_address || ""), user_id]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
});

app.get("/menu", async (req, res) => {
    try {
        const params = [];
        let query = "SELECT m.item_id, m.item_name, c.category_name AS category, m.description, m.price, m.image AS image_url FROM menu_items m JOIN categories c ON c.category_id = m.category_id";
        if (req.query.category) {
            query += " WHERE c.category_name = ?";
            params.push(req.query.category);
        }
        query += " ORDER BY category, item_name";
        const [menu] = await pool.query(query, params);
        res.json({ success: true, menu });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch menu" });
    }
});

app.get("/categories", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT category_id, category_name FROM categories ORDER BY category_name");
        res.json({ success: true, categories: rows.map(row => row.category_name) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
});

app.get("/orders/:user_id", async (req, res) => {
    try {
        const [orders] = await pool.query("SELECT o.order_id, COALESCE(o.email, u.email) AS email, COALESCE(o.phone, u.phone) AS phone, o.total_amount, o.order_date, o.delivery_address, o.status, oi.item_id, oi.quantity, oi.price, m.item_name FROM orders o JOIN signup u ON u.user_id = o.user_id LEFT JOIN order_items oi ON o.order_id = oi.order_id LEFT JOIN menu_items m ON oi.item_id = m.item_id WHERE o.user_id = ? ORDER BY o.order_date DESC", [req.params.user_id]);
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
});

app.put("/orders/:order_id/cancel", async (req, res) => {
    try {
        const [result] = await pool.query("UPDATE orders SET status = 'Cancelled' WHERE order_id = ? AND status NOT IN ('Delivered', 'Cancelled')", [req.params.order_id]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Order cannot be cancelled" });
        res.json({ success: true, message: "Order cancelled successfully", status: "Cancelled" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Order cancellation failed" });
    }
});

app.put("/orders/cancel", async (req, res) => {
    try {
        const { user_email, order_id } = req.body;
        let databaseId = order_id;
        if (!databaseId && user_email) {
            const [orders] = await pool.query("SELECT o.order_id FROM orders o JOIN signup u ON u.user_id = o.user_id WHERE u.email = ? AND o.status NOT IN ('Delivered', 'Cancelled') ORDER BY o.order_date DESC LIMIT 1", [clean(user_email).toLowerCase()]);
            databaseId = orders[0] && orders[0].order_id;
        }
        if (!databaseId) return res.status(404).json({ success: false, message: "No pending database order was found" });
        const [result] = await pool.query("UPDATE orders SET status = 'Cancelled' WHERE order_id = ? AND status NOT IN ('Delivered', 'Cancelled')", [databaseId]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Order cannot be cancelled" });
        res.json({ success: true, message: "Order cancelled successfully", status: "Cancelled", order_id: databaseId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Order cancellation failed" });
    }
});

app.post("/orders", async (req, res) => {
    try {
        const { user_id, user_email, items, total_amount, delivery_address, payment_method } = req.body;
        let resolvedUserId = user_id;
        if (!resolvedUserId && user_email) {
            const [users] = await pool.query("SELECT user_id FROM signup WHERE email = ?", [clean(user_email).toLowerCase()]);
            if (users.length) resolvedUserId = users[0].user_id;
        }
        if (!resolvedUserId) return res.status(400).json({ success: false, message: "A registered user is required" });

        let total = Number(total_amount) || 0;
        if (Array.isArray(items) && items.length) {
            const ids = items.map(item => Number(item.item_id));
            const [menuItems] = await pool.query(`SELECT item_id, price FROM menu_items WHERE item_id IN (${ids.map(() => "?").join(",")})`, ids);
            const prices = Object.fromEntries(menuItems.map(item => [item.item_id, Number(item.price)]));
            if (items.some(item => !prices[Number(item.item_id)] || Number(item.quantity) <= 0)) return res.status(400).json({ success: false, message: "Invalid order items" });
            total = items.reduce((sum, item) => sum + prices[Number(item.item_id)] * Number(item.quantity), 0);
        }
        const [users] = await pool.query("SELECT email, phone FROM signup WHERE user_id = ?", [resolvedUserId]);
        if (!users.length) return res.status(404).json({ success: false, message: "User not found" });
        const [order] = await pool.query("INSERT INTO orders (user_id, email, phone, total_amount, delivery_address, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [resolvedUserId, users[0].email, users[0].phone, total, clean(delivery_address || ""), clean(payment_method || ""), "Pending"]);
        if (Array.isArray(items) && items.length) {
            const ids = items.map(item => Number(item.item_id));
            const [menuItems] = await pool.query(`SELECT item_id, price FROM menu_items WHERE item_id IN (${ids.map(() => "?").join(",")})`, ids);
            const prices = Object.fromEntries(menuItems.map(item => [item.item_id, Number(item.price)]));
            await pool.query("INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ?", [items.map(item => [order.insertId, Number(item.item_id), Number(item.quantity), prices[Number(item.item_id)]])]);
        }
        res.status(201).json({ success: true, message: "Order placed successfully", order_id: order.insertId, total_amount: total });
    } catch (error) {
        console.error("Order error:", error.message);
        res.status(500).json({ success: false, message: "Order placement failed" });
    }
});

app.post("/table-booking", async (req, res) => {
    try {
        const { user_id, booking_date, booking_time, guests, table_number } = req.body;
        if (!user_id || !booking_date || !booking_time || !guests || !table_number) return res.status(400).json({ success: false, message: "All booking details are required" });
        const [existing] = await pool.query("SELECT booking_id FROM table_bookings WHERE table_number = ? AND booking_date = ? AND booking_time = ? AND status != 'Cancelled'", [table_number, booking_date, booking_time]);
        if (existing.length) return res.status(409).json({ success: false, message: "Table already booked for this time" });
        const [users] = await pool.query("SELECT email, phone FROM signup WHERE user_id = ?", [user_id]);
        if (!users.length) return res.status(404).json({ success: false, message: "User not found" });
        const [result] = await pool.query("INSERT INTO table_bookings (user_id, email, phone, booking_date, booking_time, guests, table_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, users[0].email, users[0].phone, booking_date, booking_time, guests, table_number, "Pending"]);
        res.status(201).json({ success: true, message: "Table booked successfully", booking_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Table booking failed" });
    }
});

app.post("/book-table", async (req, res) => {
    try {
        const { user_email, booking_date, booking_time, number_of_guests, special_request } = req.body;
        const [users] = await pool.query("SELECT user_id FROM signup WHERE email = ?", [clean(user_email).toLowerCase()]);
        if (!users.length) return res.status(404).json({ success: false, message: "Please log in before booking a table" });
        const [userDetails] = await pool.query("SELECT email, phone FROM signup WHERE user_id = ?", [users[0].user_id]);
        const [result] = await pool.query("INSERT INTO table_bookings (user_id, email, phone, booking_date, booking_time, guests, table_number, special_request, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [users[0].user_id, userDetails[0].email, userDetails[0].phone, booking_date, booking_time, number_of_guests, 1, clean(special_request || ""), "Pending"]);
        res.status(201).json({ success: true, message: "Table booked successfully", booking_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Table booking failed" });
    }
});

app.get("/table-bookings/:user_id", async (req, res) => {
    try {
        const [bookings] = await pool.query("SELECT * FROM table_bookings WHERE user_id = ? ORDER BY booking_date DESC, booking_time DESC", [req.params.user_id]);
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
});

app.put("/table-bookings/:booking_id/cancel", async (req, res) => {
    try {
        const [result] = await pool.query("UPDATE table_bookings SET status = 'Cancelled' WHERE booking_id = ? AND status != 'Cancelled'", [req.params.booking_id]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Booking cannot be cancelled" });
        res.json({ success: true, message: "Booking cancelled successfully", status: "Cancelled" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Booking cancellation failed" });
    }
});

app.post("/contact-messages", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !validEmail(email) || !message) return res.status(400).json({ success: false, message: "Name, valid email and message are required" });
        const [result] = await pool.query("INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)", [clean(name), clean(email).toLowerCase(), clean(phone || ""), clean(message)]);
        res.status(201).json({ success: true, message: "Message sent successfully", message_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Message could not be saved" });
    }
});

app.listen(port, async () => {
    console.log(`Backend running at http://localhost:${port}`);
    try {
        const connection = await pool.getConnection();
        connection.release();
        console.log("MySQL database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});
