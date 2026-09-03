USE pantryjunction;

ALTER TABLE orders
    ADD COLUMN email VARCHAR(100) NULL AFTER user_id,
    ADD COLUMN phone VARCHAR(20) NULL AFTER email;

ALTER TABLE table_bookings
    ADD COLUMN email VARCHAR(100) NULL AFTER user_id,
    ADD COLUMN phone VARCHAR(20) NULL AFTER email;

CREATE TABLE IF NOT EXISTS contact_messages (
    message_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE menu_items duplicate_item
JOIN menu_items original_item
  ON original_item.item_name = duplicate_item.item_name
 AND original_item.item_id < duplicate_item.item_id
SET duplicate_item.category_id = original_item.category_id;

UPDATE order_items oi
JOIN menu_items duplicate_item ON duplicate_item.item_id = oi.item_id
JOIN menu_items original_item
  ON original_item.item_name = duplicate_item.item_name
 AND original_item.item_id < duplicate_item.item_id
SET oi.item_id = original_item.item_id;

DELETE duplicate_item
FROM menu_items duplicate_item
JOIN menu_items original_item
  ON original_item.item_name = duplicate_item.item_name
 AND original_item.item_id < duplicate_item.item_id;

UPDATE menu_items m
JOIN categories duplicate_category ON duplicate_category.category_id = m.category_id
JOIN categories original_category
  ON original_category.category_name = duplicate_category.category_name
 AND original_category.category_id < duplicate_category.category_id
SET m.category_id = original_category.category_id;

DELETE duplicate_category
FROM categories duplicate_category
JOIN categories original_category
  ON original_category.category_name = duplicate_category.category_name
 AND original_category.category_id < duplicate_category.category_id;

ALTER TABLE menu_items ADD UNIQUE KEY unique_menu_item_name (item_name);
ALTER TABLE categories ADD UNIQUE KEY unique_category_name (category_name);
