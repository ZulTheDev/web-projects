'use strict';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Express Setup
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Supabase Configuration
const supabaseUrl = 'https://cswjtvfmczcepiugldbe.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Connected to Supabase");

/* ===================================================
   🔹 AUTHENTICATION ROUTES
=================================================== */

/**
 * ✅ GET: Check if a user is logged in
 */
app.get('/auth/user', async (req, res) => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ user });
});

/**
 * ✅ POST: User Signup
 */
app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "User signed up successfully", data });
});

/**
 * ✅ POST: User Login
 */
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "User logged in successfully", data });
});

/**
 * ✅ POST: User Logout
 */
app.post('/auth/logout', async (req, res) => {
    await supabase.auth.signOut();
    res.json({ message: "User logged out successfully" });
});

/* ===================================================
   🔹 MENU ROUTES
=================================================== */

/**
 * ✅ GET: Fetch all menu items
 */
app.get('/menu', async (req, res) => {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

/**
 * ✅ POST: Add a New Menu Item (Task 1 Solution)
 */
app.post('/menu', async (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
    }

    const { data, error } = await supabase
        .from('menu_items')
        .insert([{ name, description, price }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "Food item added", item: data });
});

/**
 * ✅ DELETE: Remove a menu item
 */
app.delete('/menu/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Menu item deleted successfully" });
});

/* ===================================================
   🔹 ORDER ROUTES
=================================================== */

/**
 * ✅ POST: Create an Order
 */
app.post('/orders', async (req, res) => {
    const { user_id, items } = req.body; // `items` should be an array of menu_item_id & quantity
    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ error: "User ID and items are required" });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
        const { data: menuItem } = await supabase.from('menu_items').select('price').eq('id', item.menu_item_id).single();
        total_amount += menuItem.price * item.quantity;
    }

    // Insert into orders table
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id, total_amount }])
        .select()
        .single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    // Insert order items
    const orderItemsData = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.quantity * total_amount
    }));

    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsData);
    if (orderItemsError) return res.status(500).json({ error: orderItemsError.message });

    res.status(201).json({ message: "Order placed successfully", order });
});

/**
 * ✅ GET: Fetch Order History for a User (Task 2 Solution)
 */
app.get('/orders/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            order_date,
            order_items (
                quantity,
                price,
                menu_items (name)
            )
        `)
        .eq('user_id', user_id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

/**
 * ✅ DELETE: Remove an Order (Task 3 Solution)
 */
app.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;

    // Delete related order_items first
    const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

    if (orderItemsError) return res.status(500).json({ error: orderItemsError.message });

    // Delete order
    const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (orderError) return res.status(500).json({ error: orderError.message });

    res.json({ message: "Order deleted successfully" });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
