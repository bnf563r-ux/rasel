const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// مسار ملف قاعدة البيانات
const DB_PATH = path.join(__dirname, 'data', 'database.json');

// التأكد من وجود مجلد data وملف database.json
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, messages: [] }));
}

// قراءة قاعدة البيانات
function readDB() {
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data);
}

// كتابة قاعدة البيانات
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// تسجيل مستخدم جديد
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    
    if (db.users[username]) {
        return res.status(400).json({ error: 'اسم المستخدم موجود مسبقًا' });
    }
    
    db.users[username] = {
        password: password,
        createdAt: new Date().toISOString()
    };
    db.messages[username] = db.messages[username] || [];
    
    writeDB(db);
    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح' });
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    
    if (!db.users[username] || db.users[username].password !== password) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    
    res.json({ success: true, username: username });
});

// البحث عن مستخدم
app.post('/api/search', (req, res) => {
    const { username } = req.body;
    const db = readDB();
    
    if (db.users[username]) {
        res.json({ found: true, username: username });
    } else {
        res.json({ found: false });
    }
});

// إرسال رسالة
app.post('/api/send', (req, res) => {
    const { from, to, message } = req.body;
    const db = readDB();
    
    if (!db.users[to]) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    const newMessage = {
        id: Date.now(),
        from: from,
        to: to,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    db.messages = db.messages || {};
    db.messages[to] = db.messages[to] || [];
    db.messages[to].push(newMessage);
    
    // حفظ نسخة للمرسل أيضًا (محادثة)
    db.messages[from] = db.messages[from] || [];
    db.messages[from].push({ ...newMessage, to: from });
    
    writeDB(db);
    res.json({ success: true });
});

// جلب الرسائل لمستخدم
app.post('/api/messages', (req, res) => {
    const { username } = req.body;
    const db = readDB();
    
    const userMessages = db.messages[username] || [];
    res.json({ messages: userMessages });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
