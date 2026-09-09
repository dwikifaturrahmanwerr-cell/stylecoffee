const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Konfigurasi Koneksi Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database terhubung!');
});

// 1. Endpoint Login (Mengembalikan data spesifik milik user/toko)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'User tidak ditemukan!' });

        const user = results.get ? results.get(0) : results; // Menyesuaikan driver
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) return res.status(401).json({ message: 'Password salah!' });

        // Berhasil login, kirim data identitas user & store_id-nya
        res.json({
            message: 'Login berhasil',
            userId: user.id,
            username: user.username,
            storeId: user.store_id
        });
    });
});

// 2. Endpoint Mengambil Produk Berdasarkan Toko/User yang Login
app.get('/api/products', (req, res) => {
    const { storeId } = req.query;
    
    const query = 'SELECT * FROM products WHERE store_id = ?';
    db.query(query, [storeId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Endpoint Menyimpan Transaksi Baru dari Perangkat Kasir
app.post('/api/transactions', (req, res) => {
    const { storeId, userId, items, total } = req.body;
    
    const query = 'INSERT INTO transactions (store_id, user_id, items, total, created_at) VALUES (?, ?, ?, ?, NOW())';
    db.query(query, [storeId, userId, JSON.stringify(items), total], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Transaksi berhasil disimpan ke server pusat!', transactionId: results.insertId });
    });
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});
