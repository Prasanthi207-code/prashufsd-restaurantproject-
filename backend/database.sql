CREATE DATABASE IF NOT EXISTS pantryjunction;
USE pantryjunction;

CREATE TABLE IF NOT EXISTS signup (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    delivery_address TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    available TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_address TEXT,
    payment_method VARCHAR(40),
    status VARCHAR(40) NOT NULL DEFAULT 'Pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES signup(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    item_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

CREATE TABLE IF NOT EXISTS table_bookings (
    booking_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guests INT UNSIGNED NOT NULL,
    table_number INT UNSIGNED NOT NULL DEFAULT 1,
    special_request TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES signup(user_id) ON DELETE CASCADE
);

INSERT INTO menu_items (item_name, category, description, price)
SELECT 'Paneer Tikka', 'Starters', 'Chargrilled cottage cheese with spices', 220.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Paneer Tikka');

INSERT INTO menu_items (item_name, category, description, price)
SELECT 'Butter Chicken', 'Main Course', 'Creamy tomato chicken curry', 320.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Butter Chicken');

INSERT INTO menu_items (item_name, category, description, price)
SELECT 'Veg Biryani', 'Main Course', 'Fragrant basmati rice with vegetables', 240.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Veg Biryani');

INSERT INTO menu_items (item_name, category, description, price)
SELECT 'Gulab Jamun', 'Desserts', 'Warm syrup-soaked milk dumplings', 120.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Gulab Jamun');
