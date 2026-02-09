// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXXf7UxBT9RKhfi-0SZotxIeJvtcaUPGY",
  authDomain: "acc-manager-ntn-real.firebaseapp.com",
  databaseURL: "https://acc-manager-ntn-real-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "acc-manager-ntn-real",
  storageBucket: "acc-manager-ntn-real.firebasestorage.app",
  messagingSenderId: "743367001939",
  appId: "1:743367001939:web:518200a47278311c6603a6",
  measurementId: "G-041D9R4P0C"
};

// Initialize Firebase
let firebaseInitialized = false;
try {
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    console.log('✅ Firebase initialized');
} catch (error) {
    console.error('❌ Firebase init error:', error);
}

// Global State
let currentUser = null;
let masterPassword = '';
let accounts = {};
let currentFilter = 'all';
let totpIntervals = {};

// Auth Functions
function handleLogin() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!firebaseInitialized) {
        showToast('Firebase chưa được cấu hình!', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn') || event.target;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span> Đang đăng nhập...';
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCred) => {
            currentUser = userCred.user;
            masterPassword = password;
            loadAccountsFromFirebase();
        })
        .catch((error) => {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '🔓 Đăng nhập';
            
            if (error.code === 'auth/user-not-found') {
                showToast('Tài khoản không tồn tại!', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showToast('Sai mật khẩu!', 'error');
            } else {
                showToast('Lỗi: ' + error.message, 'error');
            }
        });
}

function handleRegister() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!email || !email.includes('@')) {
        showToast('Email không hợp lệ!', 'error');
        return;
    }
    
    if (!password || password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (!firebaseInitialized) {
        showToast('Firebase chưa được cấu hình!', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerBtn') || event.target;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="loading"></span> Đang đăng ký...';
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCred) => {
            currentUser = userCred.user;
            masterPassword = password;
            accounts = {};
            showToast('Đăng ký thành công!', 'success');
            showApp();
        })
        .catch((error) => {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '✨ Đăng ký';
            
            if (error.code === 'auth/email-already-in-use') {
                showToast('Email đã được sử dụng!', 'error');
            } else if (error.code === 'auth/weak-password') {
                showToast('Mật khẩu quá yếu!', 'error');
            } else {
                showToast('Lỗi: ' + error.message, 'error');
            }
        });
}

function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Clear TOTP intervals
        Object.values(totpIntervals).forEach(interval => clearInterval(interval));
        totpIntervals = {};
        
        if (firebaseInitialized) {
            firebase.auth().signOut();
        }
        
        currentUser = null;
        masterPassword = '';
        accounts = {};
        
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('appScreen').classList.remove('active');
        document.getElementById('authEmail').value = '';
        document.getElementById('authPassword').value = '';
        
        showToast('Đã đăng xuất!', 'success');
    }
}

function loadAccountsFromFirebase() {
    if (!firebaseInitialized || !currentUser) return;
    
    const db = firebase.database();
    const userRef = db.ref('users/' + currentUser.uid + '/accounts');
    
    userRef.once('value')
        .then((snapshot) => {
            const encrypted = snapshot.val();
            if (encrypted) {
                try {
                    const decrypted = CryptoJS.AES.decrypt(encrypted, masterPassword).toString(CryptoJS.enc.Utf8);
                    if (decrypted) {
                        accounts = JSON.parse(decrypted);
                    }
                } catch (error) {
                    console.error('Decrypt error:', error);
                    accounts = {};
                }
            }
            
            showApp();
            initFirebaseSync();
        })
        .catch((error) => {
            console.error('Load error:', error);
            showApp();
        });
}

function initFirebaseSync() {
    if (!firebaseInitialized || !currentUser) return;
    
    const db = firebase.database();
    const userRef = db.ref('users/' + currentUser.uid + '/accounts');
    
    userRef.on('value', (snapshot) => {
        const encrypted = snapshot.val();
        if (encrypted) {
            try {
                const decrypted = CryptoJS.AES.decrypt(encrypted, masterPassword).toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    accounts = JSON.parse(decrypted);
                    renderAccounts();
                }
            } catch (error) {
                console.error('Sync decrypt error:', error);
            }
        }
    });
}

function saveToFirebase() {
    if (!firebaseInitialized || !currentUser) return;
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(accounts), masterPassword).toString();
    const db = firebase.database();
    db.ref('users/' + currentUser.uid + '/accounts').set(encrypted);
}

function showApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').classList.add('active');
    renderAccounts();
}

// Account Management
function showAddModal() {
    document.getElementById('modalTitle').textContent = '➕ Thêm tài khoản mới';
    document.getElementById('editId').value = '';
    document.getElementById('service').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('url').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('has2FA').value = 'false';
    document.getElementById('secretKey').value = '';
    document.getElementById('backupCodes').value = '';
    document.getElementById('recoveryInfo').value = '';
    toggle2FA();
    document.getElementById('accountModal').classList.add('active');
}

function showEditModal(id) {
    const account = accounts[id];
    if (!account) return;
    
    document.getElementById('modalTitle').textContent = '✏️ Chỉnh sửa tài khoản';
    document.getElementById('editId').value = id;
    document.getElementById('service').value = account.service || '';
    document.getElementById('username').value = account.username || '';
    document.getElementById('password').value = account.password || '';
    document.getElementById('url').value = account.url || '';
    document.getElementById('notes').value = account.notes || '';
    document.getElementById('has2FA').value = account.has2FA ? 'true' : 'false';
    
    if (account.twoFactorAuth) {
        document.getElementById('twoFAType').value = account.twoFactorAuth.type || 'totp';
        document.getElementById('secretKey').value = account.twoFactorAuth.secretKey || '';
        document.getElementById('backupCodes').value = account.twoFactorAuth.backupCodes || '';
        document.getElementById('recoveryInfo').value = account.twoFactorAuth.recoveryInfo || '';
    }
    
    toggle2FA();
    document.getElementById('accountModal').classList.add('active');
}

function toggle2FA() {
    const has2FA = document.getElementById('has2FA').value === 'true';
    const fields = document.getElementById('twoFAFields');
    if (has2FA) {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

function saveAccount() {
    const editId = document.getElementById('editId').value;
    const service = document.getElementById('service').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!service || !username || !password) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const id = editId || 'acc_' + Date.now();
    const has2FA = document.getElementById('has2FA').value === 'true';
    
    accounts[id] = {
        id,
        service,
        username,
        password,
        url: document.getElementById('url').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        has2FA,
        createdAt: accounts[id]?.createdAt || Date.now(),
        updatedAt: Date.now()
    };
    
    if (has2FA) {
        accounts[id].twoFactorAuth = {
            type: document.getElementById('twoFAType').value,
            secretKey: document.getElementById('secretKey').value.trim(),
            backupCodes: document.getElementById('backupCodes').value.trim(),
            recoveryInfo: document.getElementById('recoveryInfo').value.trim()
        };
    }
    
    saveToFirebase();
    closeModal();
    renderAccounts();
    showToast(editId ? 'Đã cập nhật!' : 'Đã thêm tài khoản!', 'success');
}

function deleteAccount(id) {
    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
        // Clear TOTP interval if exists
        if (totpIntervals[id]) {
            clearInterval(totpIntervals[id]);
            delete totpIntervals[id];
        }
        
        delete accounts[id];
        saveToFirebase();
        renderAccounts();
        showToast('Đã xóa tài khoản!', 'success');
    }
}

function showViewModal(id) {
    const account = accounts[id];
    if (!account) return;
    
    document.getElementById('viewTitle').textContent = `🔍 ${account.service}`;
    
    let html = `
        <div class="view-field">
            <div class="view-label">Dịch vụ</div>
            <div class="view-value">${escapeHtml(account.service)}</div>
        </div>
        <div class="view-field">
            <div class="view-label">Username</div>
            <div class="view-value">${escapeHtml(account.username)}</div>
        </div>
        <div class="view-field">
            <div class="view-label">Mật khẩu</div>
            <div class="view-value">
                <span id="viewPass_${id}">••••••••</span>
                <button class="btn-small" onclick="toggleViewPassword('${id}', '${escapeHtml(account.password)}')">👁️</button>
                <button class="btn-small" onclick="copyText('${escapeHtml(account.password)}')">📋</button>
            </div>
        </div>
    `;
    
    if (account.url) {
        html += `
            <div class="view-field">
                <div class="view-label">URL</div>
                <div class="view-value">
                    <a href="${escapeHtml(account.url)}" target="_blank" style="color: var(--accent-cyan)">${escapeHtml(account.url)}</a>
                </div>
            </div>
        `;
    }
    
    if (account.notes) {
        html += `
            <div class="view-field">
                <div class="view-label">Ghi chú</div>
                <div class="view-value">${escapeHtml(account.notes)}</div>
            </div>
        `;
    }
    
    if (account.has2FA && account.twoFactorAuth) {
        html += `
            <div class="divider" style="margin: 20px 0; height: 1px; background: rgba(0,240,255,0.2);"></div>
            <div class="view-field">
                <div class="view-label">🔐 Bảo mật 2 lớp</div>
                <div class="view-value">Đã bật</div>
            </div>
            <div class="view-field">
                <div class="view-label">Loại 2FA</div>
                <div class="view-value">${get2FATypeName(account.twoFactorAuth.type)}</div>
            </div>
        `;
        
        if (account.twoFactorAuth.secretKey) {
            html += `
                <div class="view-field">
                    <div class="view-label">Secret Key</div>
                    <div class="view-value">
                        ${escapeHtml(account.twoFactorAuth.secretKey)}
                        <button class="btn-small" onclick="copyText('${escapeHtml(account.twoFactorAuth.secretKey)}')">📋</button>
                    </div>
                </div>
                <div id="totp_${id}" class="totp-display">
                    <div class="totp-code" id="totpCode_${id}">------</div>
                    <div class="totp-timer" id="totpTimer_${id}">Generating...</div>
                </div>
            `;
        }
        
        if (account.twoFactorAuth.backupCodes) {
            html += `
                <div class="view-field">
                    <div class="view-label">Backup Codes</div>
                    <div class="view-value" style="font-family: 'JetBrains Mono', monospace; white-space: pre-wrap;">${escapeHtml(account.twoFactorAuth.backupCodes)}</div>
                </div>
            `;
        }
        
        if (account.twoFactorAuth.recoveryInfo) {
            html += `
                <div class="view-field">
                    <div class="view-label">Recovery Info</div>
                    <div class="view-value">${escapeHtml(account.twoFactorAuth.recoveryInfo)}</div>
                </div>
            `;
        }
    }
    
    html += `
        <div style="margin-top: 24px; display: flex; gap: 12px;">
            <button class="btn" onclick="showEditModal('${id}')">✏️ Chỉnh sửa</button>
            <button class="btn btn-secondary" onclick="deleteAccount('${id}'); closeViewModal();">🗑️ Xóa</button>
        </div>
    `;
    
    document.getElementById('viewContent').innerHTML = html;
    document.getElementById('viewModal').classList.add('active');
    
    // Start TOTP generation if available
    if (account.has2FA && account.twoFactorAuth && account.twoFactorAuth.secretKey) {
        startTOTPGeneration(id, account.twoFactorAuth.secretKey);
    }
}

function startTOTPGeneration(id, secret) {
    // Clear existing interval
    if (totpIntervals[id]) {
        clearInterval(totpIntervals[id]);
    }
    
    function updateTOTP() {
        try {
            // Simple TOTP generation (30 second window)
            const epoch = Math.floor(Date.now() / 1000);
            const counter = Math.floor(epoch / 30);
            const timeLeft = 30 - (epoch % 30);
            
            // Generate TOTP code (simplified - you may want to use OTPAuth library for production)
            const code = generateSimpleTOTP(secret, counter);
            
            const codeEl = document.getElementById(`totpCode_${id}`);
            const timerEl = document.getElementById(`totpTimer_${id}`);
            
            if (codeEl) codeEl.textContent = code;
            if (timerEl) timerEl.textContent = `⏱️ ${timeLeft}s`;
        } catch (error) {
            console.error('TOTP generation error:', error);
        }
    }
    
    updateTOTP();
    totpIntervals[id] = setInterval(updateTOTP, 1000);
}

function generateSimpleTOTP(secret, counter) {
    // This is a simplified version - for production use OTPAuth library
    // Generate 6-digit code based on secret and counter
    try {
        const hash = CryptoJS.HmacSHA1(counter.toString(), secret);
        const offset = parseInt(hash.toString().substr(-1), 16);
        const binary = parseInt(hash.toString().substr(offset * 2, 8), 16) & 0x7fffffff;
        const code = (binary % 1000000).toString().padStart(6, '0');
        return code;
    } catch {
        return '------';
    }
}

function get2FATypeName(type) {
    const types = {
        'totp': '📱 Authenticator App',
        'sms': '💬 SMS OTP',
        'email': '📧 Email OTP',
        'backup': '💾 Backup Codes'
    };
    return types[type] || type;
}

function toggleViewPassword(id, password) {
    const el = document.getElementById(`viewPass_${id}`);
    if (el.textContent === '••••••••') {
        el.textContent = password;
    } else {
        el.textContent = '••••••••';
    }
}

function closeModal() {
    document.getElementById('accountModal').classList.remove('active');
}

function closeViewModal() {
    // Clear all TOTP intervals when closing view modal
    Object.values(totpIntervals).forEach(interval => clearInterval(interval));
    totpIntervals = {};
    document.getElementById('viewModal').classList.remove('active');
}

function renderAccounts() {
    const container = document.getElementById('accountsList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = Object.values(accounts).filter(acc => {
        const matchesSearch = !searchTerm || 
            acc.service.toLowerCase().includes(searchTerm) ||
            acc.username.toLowerCase().includes(searchTerm);
        
        const matchesFilter = currentFilter === 'all' ||
            (currentFilter === '2fa' && acc.has2FA) ||
            (currentFilter === 'no2fa' && !acc.has2FA);
        
        return matchesSearch && matchesFilter;
    });
    
    // Sort by service name
    filtered.sort((a, b) => a.service.localeCompare(b.service));
    
    // Update stats
    const total = Object.keys(accounts).length;
    const with2FA = Object.values(accounts).filter(a => a.has2FA).length;
    document.getElementById('totalAccounts').textContent = total;
    document.getElementById('totalWith2FA').textContent = with2FA;
    document.getElementById('totalWithout2FA').textContent = total - with2FA;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">Không có tài khoản nào</div>';
        return;
    }
    
    container.innerHTML = filtered.map(acc => `
        <div class="account-card" onclick="showViewModal('${acc.id}')">
            <div class="account-header">
                <div>
                    <div class="account-service">${escapeHtml(acc.service)}</div>
                    <div class="account-username">${escapeHtml(acc.username)}</div>
                </div>
                ${acc.has2FA ? '<span class="badge-2fa">🔐 2FA</span>' : ''}
            </div>
        </div>
    `).join('');
}

function filterAccounts() {
    renderAccounts();
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderAccounts();
}

// Password Generator
let generatedPassword = '';

function showGeneratorModal() {
    generatePassword();
    document.getElementById('generatorModal').classList.add('active');
}

function closeGeneratorModal() {
    document.getElementById('generatorModal').classList.remove('active');
}

function updateLength() {
    const length = document.getElementById('length').value;
    document.getElementById('lengthValue').textContent = length;
}

function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const upper = document.getElementById('upper').checked;
    const lower = document.getElementById('lower').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;
    
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (chars.length === 0) {
        showToast('Chọn ít nhất 1 loại ký tự!', 'error');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    generatedPassword = password;
    document.getElementById('generatedPassword').textContent = password;
}

function copyGenerated() {
    copyText(generatedPassword);
}

function generateAndFillPassword() {
    const length = 16;
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('password').value = password;
    showToast('Đã tạo mật khẩu ngẫu nhiên!', 'success');
}

// Utilities
function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Đã copy!', 'success');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Đã copy!', 'success');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--bg-card);
        border: 2px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent-cyan)'};
        border-radius: 12px;
        padding: 16px 24px;
        color: var(--text-primary);
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        z-index: 9999;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(() => {
            console.log('✅ Service Worker registered');
        }).catch(err => console.log('❌ SW registration failed:', err));
    });
}

// Initialize
console.log('🔐 Acc Manager NTN loaded');
