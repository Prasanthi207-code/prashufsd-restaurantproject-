USE pantryjunction;

INSERT INTO categories (category_name, description)
SELECT 'starters', 'Starters and appetizers'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'starters');
INSERT INTO categories (category_name, description)
SELECT 'main', 'Main course dishes'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'main');
INSERT INTO categories (category_name, description)
SELECT 'sides', 'Side dishes and breads'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'sides');
INSERT INTO categories (category_name, description)
SELECT 'dessert', 'Desserts and sweets'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'dessert');
INSERT INTO categories (category_name, description)
SELECT 'drinks', 'Juices and beverages'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'drinks');

INSERT INTO menu_items (category_id, item_name, description, price, image)
SELECT c.category_id, x.item_name, x.description, x.price, ''
FROM categories c
JOIN (
    SELECT 'starters' category_name, 'Paneer Tikka' item_name, 'Grilled cottage cheese marinated with spices.' description, 200.00 price
    UNION ALL SELECT 'starters', 'Samosa', 'Crispy pastries filled with spiced potatoes.', 80.00
    UNION ALL SELECT 'starters', 'Onion Pakora', 'Crispy onion fritters with Indian spices.', 100.00
    UNION ALL SELECT 'starters', 'Spring Rolls', 'Golden fried rolls filled with vegetables.', 120.00
    UNION ALL SELECT 'starters', 'Tandoori Chicken', 'Smoky charred chicken from the tandoor.', 320.00
    UNION ALL SELECT 'starters', 'Kadai Paneer', 'Spicy paneer with bell peppers and kadai masala.', 240.00
    UNION ALL SELECT 'main', 'Chicken Biryani', 'Fragrant basmati rice with tender chicken.', 250.00
    UNION ALL SELECT 'main', 'Butter Chicken', 'Rich tomato-based curry with buttery chicken.', 280.00
    UNION ALL SELECT 'main', 'Masala Dosa', 'Crispy rice crepe with spiced potato filling.', 120.00
    UNION ALL SELECT 'main', 'Chicken Tikka', 'Marinated chicken grilled to smoky perfection.', 350.00
    UNION ALL SELECT 'main', 'Dal Makhani', 'Creamy black lentils with butter and spices.', 180.00
    UNION ALL SELECT 'main', 'Rogan Josh', 'Slow-cooked lamb with Kashmiri spices.', 350.00
    UNION ALL SELECT 'main', 'Fish Curry', 'Coastal-style curry in tangy spices and coconut.', 300.00
    UNION ALL SELECT 'main', 'Prawn Masala', 'Prawns in rich spiced tomato gravy.', 360.00
    UNION ALL SELECT 'main', 'Malai Kofta', 'Creamy curry with paneer and potato dumplings.', 220.00
    UNION ALL SELECT 'main', 'Vegetable Pulao', 'Fragrant rice with garden vegetables and spices.', 140.00
    UNION ALL SELECT 'main', 'Veg Lasagna', 'Layers of pasta, vegetables, and creamy cheese.', 160.00
    UNION ALL SELECT 'sides', 'Chole Bhature', 'Chickpea curry with fluffy fried bread.', 150.00
    UNION ALL SELECT 'sides', 'Aloo Gobi', 'Potatoes and cauliflower with Indian spices.', 140.00
    UNION ALL SELECT 'sides', 'Naan', 'Soft flatbread baked in tandoor.', 50.00
    UNION ALL SELECT 'sides', 'Garlic Bread', 'Toasted bread brushed with butter and garlic.', 80.00
    UNION ALL SELECT 'sides', 'Raita', 'Cool yogurt with cucumber and spices.', 60.00
    UNION ALL SELECT 'dessert', 'Gulab Jamun', 'Milk-solid balls soaked in rose syrup.', 80.00
    UNION ALL SELECT 'dessert', 'Ice Cream Sundae', 'Creamy dessert with premium toppings.', 90.00
    UNION ALL SELECT 'dessert', 'Kheer', 'Creamy rice pudding with cardamom and nuts.', 90.00
    UNION ALL SELECT 'dessert', 'Jalebi', 'Spiral sweets soaked in sugar syrup.', 70.00
    UNION ALL SELECT 'dessert', 'Rasmalai', 'Soft cheese dumplings in condensed milk.', 100.00
    UNION ALL SELECT 'dessert', 'Mango Mousse', 'Light airy mango dessert with whipped cream.', 110.00
    UNION ALL SELECT 'drinks', 'Strawberry Juice', 'Refreshing juice from fresh strawberries.', 60.00
    UNION ALL SELECT 'drinks', 'Mixed Fruit Juice', 'A refreshing blend of seasonal fruits.', 60.00
    UNION ALL SELECT 'drinks', 'Masala Chai', 'Fragrant tea brewed with spices.', 60.00
    UNION ALL SELECT 'drinks', 'Fruit Smoothie', 'Blend of seasonal fruits and yogurt.', 60.00
) x ON x.category_name = c.category_name
WHERE NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.item_name = x.item_name);

SELECT m.item_id, c.category_name, m.item_name, m.price
FROM menu_items m
JOIN categories c ON c.category_id = m.category_id
ORDER BY c.category_name, m.item_name;
