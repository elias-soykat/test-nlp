-- Insert random products into the products table
DO $$
DECLARE
    categories TEXT[] := ARRAY[
        'Mobile Devices', 
        'Computers', 
        'Home Entertainment', 
        'Audio', 
        'Wearable Tech', 
        'Gaming', 
        'Photography', 
        'Networking', 
        'Smart Home', 
        'Accessories'
    ];
    base_names TEXT[] := ARRAY[
        'Smartphone', 'Laptop', 'Tablet', 'Smart TV', 'Headphones', 'Bluetooth Speaker', 
        'Smartwatch', 'Gaming Console', 'Camera', 'Wireless Router', 'Drone', 
        'Smart Light', 'VR Headset', 'Smart Thermostat', 'Smart Lock', 
        'Power Bank', 'Fitness Tracker', 'Portable SSD', 'Wireless Mouse', 'Keyboard'
    ];
BEGIN
    -- Insert 10,000 random products
    FOR i IN 1..10000 LOOP
        INSERT INTO products (product_name, category, price)
        VALUES (
            base_names[FLOOR(1 + RANDOM() * 20)], -- Randomly pick a base name
            categories[FLOOR(1 + RANDOM() * 10)], -- Randomly pick a category
            ROUND(CAST((50 + RANDOM() * 1500) AS NUMERIC), 2) -- Random price between $50 and $1500
        );
    END LOOP;
END $$;

-- Generate and insert random sales data into the sales table
DO $$
DECLARE
    i INTEGER;
    product_id INTEGER;
    quantity INTEGER;
    sale_amount NUMERIC;
    sale_date TIMESTAMP;
BEGIN
    FOR i IN 1..10000 LOOP
        product_id := FLOOR(1 + RANDOM() * 10000); -- Random product_id between 1 and 10,000
        quantity := FLOOR(1 + RANDOM() * 20); -- Random quantity between 1 and 20
        sale_amount := ROUND(CAST(quantity * (50 + RANDOM() * 1500) AS NUMERIC), 2); -- Adjusted price range for electronics
        sale_date := NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30); -- Random date within the last 30 days

        INSERT INTO sales (product_id, quantity, sale_amount, sale_date)
        VALUES (product_id, quantity, sale_amount, sale_date);
    END LOOP;
END $$;
