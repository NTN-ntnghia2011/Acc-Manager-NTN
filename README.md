# 🔐 Acc Manager NTN

**Ứng dụng quản lý mật khẩu an toàn với mã hóa AES-256, TOTP generator và đồng bộ Firebase**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://accmanager-ntn.pages.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange)](https://firebase.google.com/)

---

## ✨ Tính Năng

- 🔐 **Mã hóa AES-256** - Bảo mật tuyệt đối
- 👤 **Email/Password Auth** - Đăng ký/đăng nhập riêng biệt
- 🔑 **Lưu thông tin 2FA** - Secret keys, backup codes
- 📱 **TOTP Generator** - Tạo mã OTP như Google Authenticator
- 🎲 **Password Generator** - Tạo mật khẩu mạnh
- 📊 **Dashboard** - Thống kê tổng quan
- 🔍 **Search & Filter** - Tìm kiếm nhanh
- ☁️ **Firebase Sync** - Đồng bộ realtime
- 📴 **Offline Mode** - Hoạt động không cần mạng
- 🎨 **Beautiful UI** - Giao diện cyberpunk hiện đại
- 📱 **PWA** - Cài đặt như app thật

---

## 🚀 Demo

**Link:** [https://acc-manager-ntn.pages.dev/](https://accmanager-ntn.pages.dev/)

---

## 📦 Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/NTN-ntnghia2011/Acc-Manager-NTN.git
cd Acc-Manager-NTN
```

### 2. Deploy

**Cloudflare Pages:**

1. Vào [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repository
3. Deploy settings:
   - Build command: (trống)
   - Build output: `/`
4. Deploy!

**Netlify:**

1. Vào [Netlify](https://app.netlify.com)
2. Import from GitHub
3. Deploy!

**Hoặc test local:**

```bash
python -m http.server 8000
# Mở http://localhost:8000
```

---

## 🔧 Cấu Trúc

```
acc-manager-ntn/
├── index.html          # Giao diện chính
├── styles.css          # CSS styling
├── app.js              # Logic + Firebase
├── manifest.json       # PWA config
├── sw.js              # Service Worker
├── _redirects         # Redirects
├── sitemap.xml        # SEO
├── robots.txt         # SEO
└── README.md          # Documentation
```

---

## 🔐 Bảo Mật

### Mã Hóa:

```javascript
// Dữ liệu được mã hóa AES-256
const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(accounts), 
  masterPassword
).toString();
```

### Firebase Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 📖 Hướng Dẫn Sử Dụng

### Đăng Ký:

1. Nhập email và mật khẩu
2. Click "✨ Đăng ký"
3. ✅ Tài khoản được tạo!

### Thêm Tài Khoản:

1. Click "➕ Thêm"
2. Điền thông tin
3. Bật 2FA nếu có
4. Nhập Secret Key
5. Lưu backup codes
6. ✅ Hoàn tất!

### Xem TOTP Code:

1. Click vào tài khoản có 2FA
2. ✅ Mã OTP tự động hiển thị!
3. Tự động refresh mỗi 30s

---

## 🎨 Tính Năng Nổi Bật

### 1. TOTP Generator

- Tạo mã OTP 6 số
- Tự động refresh mỗi 30s
- Đếm ngược thời gian
- Copy nhanh

### 2. Password Generator

- Độ dài tùy chỉnh (8-32)
- Chữ hoa, thường, số, ký tự đặc biệt
- Password strength meter
- Copy ngay

### 3. Dashboard

- Tổng số tài khoản
- Số tài khoản có 2FA
- Số tài khoản cần thêm 2FA
- Filter nhanh

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Firebase (Realtime Database + Auth)
- **Encryption:** CryptoJS (AES-256)
- **TOTP:** Native implementation
- **Hosting:** Cloudflare Pages / Netlify
- **PWA:** Service Worker, Manifest

---

## 📱 Cài Đặt Như App

### Android:

1. Mở link trên Chrome
2. Menu → "Add to Home screen"
3. ✅ Icon trên màn hình!

### iOS:

1. Mở link trên Safari
2. Share → "Add to Home Screen"
3. ✅ App như thật!

### Desktop:

1. Mở link trên Chrome
2. Thanh địa chỉ có icon ➕
3. Click "Install"
4. ✅ Desktop app!

---

## 📊 Performance

- ⚡ **First Paint:** < 1s
- 🌍 **CDN:** Cloudflare Edge
- 📦 **Size:** ~80KB total
- 🔄 **Sync:** < 500ms

---

## ⚠️ Lưu Ý

- 🔒 **GHI NHỚ mật khẩu đăng nhập** - Không thể khôi phục!
- 💾 **Backup backup codes** - Lưu an toàn
- 🔐 **Secret keys bảo mật** - Không chia sẻ
- 🌐 **HTTPS only** - PWA chỉ hoạt động trên HTTPS

---

## 📄 License

MIT License

---

## 👨‍💻 Tác Giả

**Nguyen Trong Nghia**

- GitHub: [@NTN-ntnghia2011](https://github.com/NTN-ntnghia2011)
- Email: nguyentrongnghia2011ntn@gmail.com

---

## 🙏 Credits

- [Firebase](https://firebase.google.com/)
- [CryptoJS](https://cryptojs.gitbook.io/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 📞 Support

⭐ Star repo nếu bạn thấy hữu ích!

📧 [Create Issue](https://github.com/NTN-ntnghia2011/Acc-Manager-NTN/issues) nếu có vấn đề!

---

<p align="center">Made with ❤️ by Nguyen Trong Nghia</p>
