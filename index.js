const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات عبر الرابط اللي هتحطه في Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- المسارات (Endpoints) ---

// 1. تسجيل الدخول
app.post('/api/login', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0] });
    } else {
      res.status(401).json({ error: 'المستخدم غير موجود' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. تسجيل عملية بيع وتحديث المخزن
app.post('/api/sales', async (req, res) => {
  const client = await pool.connect();
  try {
    const sale = req.body;
    await client.query('BEGIN');

    // إدخال البيعة
    const saleQuery = 'INSERT INTO sales (id, branch_id, cashier_id, total_amount, payment_method) VALUES ($1, $2, $3, $4, $5)';
    await client.query(saleQuery, [sale.id, sale.branchId, sale.cashierId, sale.totalAmount, sale.paymentMethod]);

    // تحديث المخزن لكل منتج في البيعة
    for (const item of sale.items) {
      const updateStockQuery = 'UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2 AND branch_id = $3';
      await client.query(updateStockQuery, [item.quantity, item.productId, sale.branchId]);
      
      const itemQuery = 'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)';
      await client.query(itemQuery, [sale.id, item.productId, item.quantity, item.unitPrice, item.subtotal]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'تم تسجيل البيعة بنجاح' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});