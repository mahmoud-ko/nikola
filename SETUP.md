# دليل تثبيت وإعداد AURUM Hotel System

## الأخطاء التي تم إصلاحها

### 1. مشكلة الذكاء الاصطناعي (AI Concierge)
- **السبب**: `AIConciergeController.php` لم يكن يستورد `Database.php`
- **الإصلاح**: أضفنا `require_once 'Database.php'` وحسّنا استخراج مفتاح API

### 2. مشكلة تسجيل الدخول والتسجيل
- **السبب**: `api.php` كان يطلب ملفات بأسماء خاطئة مثل `HotelsController.php` بينما الملف اسمه `hotels.php`
- **الإصلاح**: صححنا جميع أسماء الملفات في `api.php`

### 3. مشكلة مسارات require_once
- **السبب**: ملفات مثل `bookings.php`, `analytics.php`, `owner-properties.php` كانت تستورد من مجلدات غير موجودة (`../middleware/`, `../utils/`, `../config/`)
- **الإصلاح**: صححنا جميع المسارات لتشير إلى نفس المجلد `__DIR__ . '/...'`

### 4. مشكلة AuthMiddleware
- **الإصلاح**: حسّنا استخراج JWT token ليعمل مع كل أنواع السيرفرات (Apache/Nginx)

### 5. مشكلة Database.php
- **الإصلاح**: أضفنا دعم ملف `.env` للإعدادات الحساسة

---

## طريقة التثبيت

### الخطوة 1: إعداد قاعدة البيانات
```sql
CREATE DATABASE hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### الخطوة 2: إعداد ملف .env
```bash
cp .env.example .env
# ثم عدّل القيم في .env
```

محتوى ملف `.env`:
```
DB_HOST=localhost
DB_NAME=hotel_management
DB_USER=root
DB_PASS=your_password

GROQ_API_KEY=your_groq_api_key_here
```

### الخطوة 3: الحصول على مفتاح Groq API (للذكاء الاصطناعي)
1. اذهب إلى https://console.groq.com
2. أنشئ حساب مجاني
3. أنشئ API key
4. ضعه في ملف `.env`

### الخطوة 4: رفع الملفات على الاستضافة
- ارفع جميع الملفات إلى المجلد الجذر أو مجلد `public_html`
- تأكد أن PHP 8.0+ مفعّل
- تأكد أن `mod_rewrite` مفعّل (للـ .htaccess)

---

## حسابات تجريبية جاهزة
| النوع | البريد | كلمة المرور |
|-------|--------|-------------|
| نزيل | guest@aurum.com | guest123 |
| مالك | owner@aurum.com | owner123 |

---

## ملاحظة أمان
- لا ترفع ملف `.env` على GitHub
- غيّر كلمات المرور التجريبية قبل النشر الفعلي
- الملف `.env` محمي من الوصول العام بـ `.htaccess`
