/**
 * ====================================================================
 * KASIRPRO POS - STYLE COFFE & STYLE FOOD (BANDUNG)
 * SISTEM KASIR & POINT OF SALE RESMI
 * ====================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
  const Sound = {
    ctx: null,
    enabled: true,

    init() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    },

    playTone(freq, type, duration, delay = 0) {
      if (!this.enabled) return;
      if (!this.ctx) this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
          // ignore
        }
      }, delay);
    },

    beep() {
      // Barcode scan beep
      this.playTone(1800, 'sine', 0.08);
    },

    success() {
      // Pleasant cash register chime
      this.playTone(587.33, 'sine', 0.1, 0);   // D5
      this.playTone(880, 'sine', 0.2, 100);    // A5
    },

    error() {
      // Warning buzz
      this.playTone(220, 'square', 0.2);
    }
  };

  // --- STORAGE KEYS & INITIAL DATA (STYLE COFFE & STYLE FOOD) ---
  const STORAGE_KEYS = {
    VERSION: 'style_coffe_v3_max',
    USERS: 'style_coffe_registered_users',
    PRODUCTS: 'style_coffe_products',
    TRANSACTIONS: 'style_coffe_transactions',
    STOCK_LOGS: 'style_coffe_stock_logs',
    SETTINGS: 'style_coffe_settings',
    AUTH: 'style_coffe_auth',
    THEME: 'style_coffe_theme',
    LAST_DATE: 'style_coffe_last_active_date',
    HELD_ORDERS: 'style_coffe_held_orders'
  };

  const DEFAULT_SETTINGS = {
    storeName: 'Style Coffe & Style Food',
    storeSlogan: 'Coffee, Food & Good Vibes',
    storeAddress: 'Jl.Budi Cilember No 120, Kota Bandung',
    storePhone: '082130486085',
    printerWidth: '58mm',
    taxRate: 11,
    taxEnabled: true,
    receiptFooter: 'Terima kasih atas kunjungan Anda di Style Coffe & Style Food!\nFollow IG kami: @stylecoffe.food'
  };

  // Registered Accounts (Strict Auth)
  const DEFAULT_USERS = [
    {
      username: 'kasir1',
      name: 'Kasir Style Coffe',
      role: 'kasir',
      password: '123456'
    },
    {
      username: 'owner',
      name: 'Bpk. Owner Style Coffe',
      role: 'owner',
      password: 'owner123'
    },
    {
      username: 'admin',
      name: 'Admin Style Coffe',
      role: 'admin',
      password: 'admin123'
    }
  ];

  // ONLY MAKANAN & MINUMAN (SEMBAKO REMOVED)
  const DEFAULT_PRODUCTS = [
    // --- MINUMAN (KOPI & MINUMAN SEGAR) ---
    {
      id: 'prod-001',
      barcode: 'SC-001',
      name: 'Style Kopi Susu Gula Aren 250ml',
      category: 'Minuman',
      cost: 8000,
      price: 18000,
      stock: 50,
      minStock: 10,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-002',
      barcode: 'SC-002',
      name: 'Espresso Style Coffe Double Shot',
      category: 'Minuman',
      cost: 6000,
      price: 15000,
      stock: 40,
      minStock: 8,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-003',
      barcode: 'SC-003',
      name: 'Cafe Latte Creamy Style',
      category: 'Minuman',
      cost: 9000,
      price: 20000,
      stock: 35,
      minStock: 8,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-004',
      barcode: 'SC-004',
      name: 'Matcha Green Tea Latte Dingin',
      category: 'Minuman',
      cost: 10000,
      price: 22000,
      stock: 30,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-005',
      barcode: 'SC-005',
      name: 'Teh Tarik Dingin Segar',
      category: 'Minuman',
      cost: 5000,
      price: 12000,
      stock: 60,
      minStock: 10,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-006',
      barcode: 'SC-006',
      name: 'Lemon Tea Dingin Premium',
      category: 'Minuman',
      cost: 5000,
      price: 12000,
      stock: 45,
      minStock: 10,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80'
    },

    // --- MAKANAN (FOOD, TOAST & SNACKS) ---
    {
      id: 'prod-007',
      barcode: 'SF-001',
      name: 'Mie Goreng Style Food Spesial',
      category: 'Makanan',
      cost: 11000,
      price: 22000,
      stock: 35,
      minStock: 6,
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-008',
      barcode: 'SF-002',
      name: 'Nasi Goreng Spesial Style Food',
      category: 'Makanan',
      cost: 13000,
      price: 25000,
      stock: 30,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-009',
      barcode: 'SF-003',
      name: 'Roti Bakar Cokelat Keju Melt',
      category: 'Makanan',
      cost: 8000,
      price: 16000,
      stock: 25,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-010',
      barcode: 'SF-004',
      name: 'Croissant Butter Artisan',
      category: 'Makanan',
      cost: 10000,
      price: 20000,
      stock: 15,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'prod-011',
      barcode: 'SF-005',
      name: 'Kentang Goreng Crispy (French Fries)',
      category: 'Makanan',
      cost: 7000,
      price: 15000,
      stock: 40,
      minStock: 8,
      image: 'kntg.jpeg'
    },
    {
      id: 'prod-012',
      barcode: 'SF-006',
      name: 'Rice Bowl Ayam Sambal Matah',
      category: 'Makanan',
      cost: 15000,
      price: 28000,
      stock: 20,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'
    }
  ];

  function generateSampleTransactions() {
    const now = new Date();
    const trxs = [];

    // Transactions for YESTERDAY (so history has past data, today starts fresh!)
    const yesterday = new Date(now.getTime() - 86400000);
    const dStrY = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;

    trxs.push({
      id: `TRX-${dStrY}-0001`,
      invoiceNo: `TRX-${dStrY}-0001`,
      timestamp: yesterday.toISOString(),
      cashier: 'Kasir Style Coffe',
      items: [
        { id: 'prod-001', name: 'Style Kopi Susu Gula Aren 250ml', price: 18000, cost: 8000, qty: 2, barcode: 'SC-001', subtotal: 36000 },
        { id: 'prod-009', name: 'Roti Bakar Cokelat Keju Melt', price: 16000, cost: 8000, qty: 1, barcode: 'SF-003', subtotal: 16000 }
      ],
      subtotal: 52000,
      discount: 0,
      tax: 5720,
      grandTotal: 57720,
      paymentMethod: 'TUNAI',
      paidAmount: 60000,
      change: 2280
    });

    trxs.push({
      id: `TRX-${dStrY}-0002`,
      invoiceNo: `TRX-${dStrY}-0002`,
      timestamp: new Date(yesterday.getTime() + 7200000).toISOString(),
      cashier: 'Kasir Style Coffe',
      items: [
        { id: 'prod-007', name: 'Mie Goreng Style Food Spesial', price: 22000, cost: 11000, qty: 1, barcode: 'SF-001', subtotal: 22000 },
        { id: 'prod-005', name: 'Teh Tarik Dingin Segar', price: 12000, cost: 5000, qty: 1, barcode: 'SC-005', subtotal: 12000 }
      ],
      subtotal: 34000,
      discount: 0,
      tax: 3740,
      grandTotal: 37740,
      paymentMethod: 'QRIS',
      paidAmount: 37740,
      change: 0
    });

    return trxs;
  }

  // --- STATE CONTAINER ---
  const State = {
    registeredUsers: [],
    products: [],
    transactions: [],
    stockLogs: [],
    settings: { ...DEFAULT_SETTINGS },
    currentUser: null,
    cart: [],
    selectedCategory: 'all',
    searchQuery: '',
    activeView: 'pos',
    lastActiveDate: '',
    orderType: 'dine_in',
    customerName: '',
    deliveryFee: 0,
    heldOrders: [],

    init() {
      const currentVer = localStorage.getItem(STORAGE_KEYS.VERSION);
      const isNewVersion = currentVer !== STORAGE_KEYS.VERSION;

      // 1. Registered Users
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers && !isNewVersion) {
        this.registeredUsers = JSON.parse(savedUsers);
      } else {
        this.registeredUsers = [...DEFAULT_USERS];
        this.saveUsers();
      }

      // 2. Settings (Style Coffe & Style Food Bandung)
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings && !isNewVersion) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
      }

      // 3. Products (Strictly Makanan & Minuman, no sembako)
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts && !isNewVersion) {
        this.products = JSON.parse(savedProducts);
      } else {
        this.products = [...DEFAULT_PRODUCTS];
        this.saveProducts();
      }
      const friesProd = this.products.find(p => p.id === 'prod-011');
      if (friesProd && friesProd.image !== 'kntg.jpeg') {
        friesProd.image = 'kntg.jpeg';
        this.saveProducts();
      }

      // 4. Transactions
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions && !isNewVersion) {
        this.transactions = JSON.parse(savedTransactions);
      } else {
        this.transactions = generateSampleTransactions();
        this.saveTransactions();
      }

      // 5. Stock Logs
      const savedLogs = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      if (savedLogs && !isNewVersion) {
        this.stockLogs = JSON.parse(savedLogs);
      } else {
        this.stockLogs = [
          {
            id: 'log-1',
            timestamp: new Date().toISOString(),
            productId: 'prod-001',
            productName: 'Style Kopi Susu Gula Aren 250ml',
            barcode: 'SC-001',
            type: 'IN',
            qty: 50,
            finalStock: 50,
            notes: 'Stok awal bahan kafe',
            user: 'Admin Style Coffe'
          }
        ];
        this.saveStockLogs();
      }

      // 6. Held Orders (Parkir Transaksi)
      const savedHeld = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
      if (savedHeld) {
        try { this.heldOrders = JSON.parse(savedHeld); } catch (e) { this.heldOrders = []; }
      } else {
        this.heldOrders = [];
      }

      localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_KEYS.VERSION);

      // Check current day for automatic day-change reset
      const todayDateStr = new Date().toISOString().slice(0, 10);
      const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
      if (lastDate && lastDate !== todayDateStr) {
        // A new day has started! Reset cart and active today's counters fresh
        this.cart = [];
      }
      this.lastActiveDate = todayDateStr;
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, todayDateStr);

      // Check auth session
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          if (authData.exp && Date.now() < authData.exp) {
            this.currentUser = authData.user;
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
        }
      }

      // Theme
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'theme-light';
      document.body.className = savedTheme;
      this.updateThemeIcons(savedTheme);
    },

    saveUsers() {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.registeredUsers));
    },
    saveProducts() {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    },
    saveSettings() {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    },
    saveTransactions() {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    },
    saveStockLogs() {
      localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(this.stockLogs));
    },
    saveHeldOrders() {
      localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(this.heldOrders));
    },

    updateThemeIcons(theme) {
      const isDark = theme === 'theme-dark';
      const iconDark = document.getElementById('icon-theme-dark');
      const iconLight = document.getElementById('icon-theme-light');
      if (iconDark) iconDark.classList.toggle('hidden', isDark);
      if (iconLight) iconLight.classList.toggle('hidden', !isDark);
    }
  };

  // --- HELPERS ---
  const formatRupiah = (number) => {
    return 'Rp ' + Number(number || 0).toLocaleString('id-ID');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  function renderBarcodeSvg(svgElement, codeString) {
    if (!svgElement) return;
    svgElement.innerHTML = '';
    const code = String(codeString || '0000000000');
    let x = 10;
    const height = 30;

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const width = (charCode % 3) + 1;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', '#000000');
      svgElement.appendChild(rect);

      x += width + (i % 2 === 0 ? 2 : 1);
    }
  }

  // --- AUTHENTICATION & STRICT REGISTRATION ---
  const Auth = {
    generateMockJwt(user) {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: user.username,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 3600)
      }));
      const signature = btoa('style_coffe_bandung_secret_signature');
      return `${header}.${payload}.${signature}`;
    },

    register(fullName, username, password, role) {
      const cleanUname = username.trim().toLowerCase();
      const exists = State.registeredUsers.find(u => u.username.toLowerCase() === cleanUname);
      if (exists) {
        Sound.error();
        showToast(`Username "${username}" sudah terdaftar! Gunakan username lain.`, 'error');
        return false;
      }

      if (password.length < 4) {
        Sound.error();
        showToast('Kata sandi minimal 4 karakter!', 'warning');
        return false;
      }

      const newUser = {
        username: cleanUname,
        name: fullName.trim(),
        role: role,
        password: password
      };

      State.registeredUsers.push(newUser);
      State.saveUsers();

      Sound.success();
      showToast(`Pendaftaran berhasil! Akun "${cleanUname}" telah terdaftar sebagai ${role.toUpperCase()}. Silakan masuk.`, 'success');

      // Switch to Login tab and fill credentials
      const tabLogin = document.getElementById('tab-btn-login');
      if (tabLogin) tabLogin.click();
      document.getElementById('login-username').value = cleanUname;
      document.getElementById('login-password').value = password;
      document.getElementById('login-role').value = role;
      return true;
    },

    login(username, password, role) {
      const cleanUname = (username || '').trim().toLowerCase();

      if (!cleanUname || !password) {
        Sound.error();
        showToast('Mohon masukkan nama pengguna dan kata sandi!', 'warning');
        return false;
      }

      if (!role) {
        Sound.error();
        showToast('Silakan pilih hak akses (role) Anda terlebih dahulu!', 'warning');
        return false;
      }

      // STRICT CHECK: User MUST be in registeredUsers!
      const user = State.registeredUsers.find(u => u.username.toLowerCase() === cleanUname);

      if (!user) {
        Sound.error();
        showToast(`Pengguna "${username}" BELUM TERDAFTAR! Setiap pengguna wajib mendaftar terlebih dahulu.`, 'error');
        return false;
      }

      if (user.password !== password) {
        Sound.error();
        showToast('Kata sandi yang Anda masukkan salah!', 'error');
        return false;
      }

      if (user.role.toLowerCase() !== role.toLowerCase()) {
        Sound.error();
        showToast(`Hak akses tidak sesuai! Akun ini terdaftar sebagai "${user.role.toUpperCase()}", bukan "${role.toUpperCase()}".`, 'warning');
        return false;
      }

      // Validated!
      const token = this.generateMockJwt(user);
      const sessionData = {
        user,
        token,
        exp: Date.now() + (24 * 3600 * 1000)
      };

      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(sessionData));
      State.currentUser = user;

      this.applyUserRoleUI();
      document.getElementById('view-login').classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');

      Sound.success();
      showToast(`Selamat bertugas di Style Coffe, ${user.name}! (${user.role.toUpperCase()})`, 'success');
      UI.switchView('pos');
      return true;
    },

    logout() {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      State.currentUser = null;
      const userInp = document.getElementById('login-username');
      const passInp = document.getElementById('login-password');
      const roleInp = document.getElementById('login-role');
      if (userInp) userInp.value = '';
      if (passInp) passInp.value = '';
      if (roleInp) roleInp.selectedIndex = 0;
      document.getElementById('app-container').classList.add('hidden');
      document.getElementById('view-login').classList.remove('hidden');
      showToast('Sesi kasir telah ditutup.', 'info');
    },

    applyUserRoleUI() {
      const user = State.currentUser;
      if (!user) return;

      document.getElementById('current-user-name').textContent = user.name;
      document.getElementById('current-avatar').textContent = user.name.charAt(0).toUpperCase();

      const roleBadge = document.getElementById('current-role-badge');
      roleBadge.textContent = user.role.toUpperCase();
      roleBadge.className = `role-badge badge-${user.role}`;

      const navProducts = document.getElementById('nav-products');
      const navStock = document.getElementById('nav-stock');
      const navSettings = document.getElementById('nav-settings');

      if (user.role === 'kasir') {
        if (navProducts) navProducts.style.display = 'none';
        if (navStock) navStock.style.display = 'none';
        if (navSettings) navSettings.style.display = 'none';
      } else {
        if (navProducts) navProducts.style.display = 'flex';
        if (navStock) navStock.style.display = 'flex';
        if (navSettings) navSettings.style.display = 'flex';
      }
    }
  };

  // --- UI CONTROLLER ---
  const UI = {
    init() {
      this.bindEvents();
      this.startClock();
      this.checkDayChange();
      this.renderCategories();
      this.renderPosProducts();
      this.setOrderType(State.orderType || 'dine_in', true);
      this.updateCartUI();
      this.updateHeldCountBadge();
      this.updateStockAlerts();
      this.renderProductsTable();
      this.renderStockView();
      this.renderReportsView();
      this.populateSettingsForm();

      if (State.currentUser) {
        Auth.applyUserRoleUI();
        document.getElementById('view-login').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
      } else {
        const userInp = document.getElementById('login-username');
        const passInp = document.getElementById('login-password');
        const roleInp = document.getElementById('login-role');
        if (userInp) userInp.value = '';
        if (passInp) passInp.value = '';
        if (roleInp) roleInp.selectedIndex = 0;
      }
    },

    startClock() {
      const clockEl = document.getElementById('live-clock');
      const update = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (clockEl) clockEl.textContent = `${timeStr} WIB`;

        const todayDate = now.toISOString().slice(0, 10);
        if (State.lastActiveDate && State.lastActiveDate !== todayDate) {
          this.checkDayChange();
        }
      };
      update();
      setInterval(update, 1000);
    },

    checkDayChange() {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (State.lastActiveDate && State.lastActiveDate !== todayStr) {
        State.lastActiveDate = todayStr;
        localStorage.setItem(STORAGE_KEYS.LAST_DATE, todayStr);
        State.cart = [];
        this.updateCartUI();
        this.renderReportsView('today');
        showToast('Hari baru telah dimulai. Halaman POS siap untuk transaksi hari ini!', 'info');
      }
    },

    switchView(viewName) {
      State.activeView = viewName;
      document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));

      const targetPanel = document.getElementById(`view-${viewName}`);
      const targetNav = document.getElementById(`nav-${viewName}`);

      if (targetPanel) targetPanel.classList.add('active');
      if (targetNav) targetNav.classList.add('active');

      if (viewName === 'pos') {
        this.renderPosProducts();
        const searchInp = document.getElementById('pos-search-input');
        if (searchInp) searchInp.focus();
      } else if (viewName === 'products') {
        this.renderProductsTable();
      } else if (viewName === 'stock') {
        this.renderStockView();
      } else if (viewName === 'reports') {
        this.renderReportsView();
      }
    },

    // --- ORDER TYPE CONTROLLER (DINE IN, TAKE AWAY, DELIVERY) ---
    setOrderType(type, silent = false) {
      State.orderType = type;

      // Update button active state
      document.querySelectorAll('.btn-order-type').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
      });

      const inputCustomer = document.getElementById('cart-customer-name');
      const chipsContainer = document.getElementById('quick-table-chips');
      const iconWrap = document.getElementById('customer-type-icon-wrap');
      const deliveryRow = document.getElementById('cart-delivery-row');
      const deliveryFeeInput = document.getElementById('cart-delivery-fee');

      if (type === 'dine_in') {
        if (inputCustomer) {
          inputCustomer.placeholder = 'Nomor Meja (misal: Meja 04)';
        }
        if (iconWrap) {
          iconWrap.innerHTML = `
            <svg id="customer-type-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><path d="M8 12h8M12 8v8"></path>
            </svg>
          `;
        }
        if (chipsContainer) {
          chipsContainer.innerHTML = `
            <button type="button" class="table-chip" data-val="Meja 01">M1</button>
            <button type="button" class="table-chip" data-val="Meja 02">M2</button>
            <button type="button" class="table-chip" data-val="Meja 03">M3</button>
            <button type="button" class="table-chip" data-val="Meja 04">M4</button>
            <button type="button" class="table-chip" data-val="Meja 05">M5</button>
            <button type="button" class="table-chip" data-val="Meja VIP">VIP</button>
          `;
        }
        if (deliveryRow) deliveryRow.classList.add('hidden');
        if (deliveryFeeInput) deliveryFeeInput.value = 0;
        State.deliveryFee = 0;
        if (!silent) {
          Sound.beep();
          showToast('Tipe Pesanan: Dine In (Makan di Tempat)', 'info');
        }
      } else if (type === 'take_away') {
        if (inputCustomer) {
          inputCustomer.placeholder = 'Nama Pelanggan / Catatan Bungkus (misal: Kak Budi)';
        }
        if (iconWrap) {
          iconWrap.innerHTML = `
            <svg id="customer-type-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          `;
        }
        if (chipsContainer) {
          chipsContainer.innerHTML = `
            <button type="button" class="table-chip" data-val="Bungkus">🛍️ Bungkus</button>
            <button type="button" class="table-chip" data-val="Pick Up">⏱️ Pick Up</button>
            <button type="button" class="table-chip" data-val="Tanpa Sedotan">🚫 Sedotan</button>
            <button type="button" class="table-chip" data-val="Pisah Sambal">🌶️ Pisah Sambal</button>
            <button type="button" class="table-chip" data-val="Bawa Sendiri">📦 Bawa Sendiri</button>
          `;
        }
        if (deliveryRow) deliveryRow.classList.add('hidden');
        if (deliveryFeeInput) deliveryFeeInput.value = 0;
        State.deliveryFee = 0;
        if (!silent) {
          Sound.beep();
          showToast('Tipe Pesanan: Take Away (Bungkus / Bawa Pulang)', 'info');
        }
      } else if (type === 'delivery') {
        if (inputCustomer) {
          inputCustomer.placeholder = 'Nama Pelanggan & Alamat / No. WA (misal: Bu Rina - Jl. Budi No 12)';
        }
        if (iconWrap) {
          iconWrap.innerHTML = `
            <svg id="customer-type-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18.5" cy="17.5" r="3.5"></circle>
              <circle cx="5.5" cy="17.5" r="3.5"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
            </svg>
          `;
        }
        if (chipsContainer) {
          chipsContainer.innerHTML = `
            <button type="button" class="table-chip" data-val="GoFood">🛵 GoFood</button>
            <button type="button" class="table-chip" data-val="GrabFood">🟢 GrabFood</button>
            <button type="button" class="table-chip" data-val="ShopeeFood">🟠 ShopeeFood</button>
            <button type="button" class="table-chip" data-val="Kurir Toko">🏠 Kurir Toko</button>
            <button type="button" class="table-chip" data-val="Order WA">💬 Order WA</button>
          `;
        }
        if (deliveryRow) deliveryRow.classList.remove('hidden');
        if (!silent) {
          Sound.beep();
          showToast('Tipe Pesanan: Delivery (Pesan Antar)', 'info');
        }
      }

      this.bindChipClicks();
      this.calculateCartTotals();
    },

    bindChipClicks() {
      const inputCustomer = document.getElementById('cart-customer-name');
      document.querySelectorAll('#quick-table-chips .table-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const val = chip.getAttribute('data-val');
          if (!inputCustomer) return;

          if (State.orderType === 'dine_in') {
            inputCustomer.value = val;
          } else {
            const currentVal = inputCustomer.value.trim();
            if (!currentVal) {
              inputCustomer.value = val;
            } else if (!currentVal.includes(val)) {
              inputCustomer.value = `${currentVal} (${val})`;
            }
          }
          document.querySelectorAll('#quick-table-chips .table-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          Sound.beep();
        });
      });
    },

    // --- PARKIR PESANAN (HOLD ORDERS) ---
    updateHeldCountBadge() {
      const badge = document.getElementById('held-count-badge');
      const btnViewHeld = document.getElementById('btn-view-held');
      const count = State.heldOrders ? State.heldOrders.length : 0;
      if (badge) {
        badge.textContent = `${count} Parkir`;
        badge.style.background = count > 0 ? 'var(--color-primary)' : '';
        badge.style.color = count > 0 ? '#fff' : '';
      }
      if (btnViewHeld) {
        btnViewHeld.classList.remove('hidden');
        if (count > 0) {
          btnViewHeld.classList.add('btn-primary');
          btnViewHeld.classList.remove('btn-outline-primary');
        } else {
          btnViewHeld.classList.remove('btn-primary');
          btnViewHeld.classList.add('btn-outline-primary');
        }
      }
    },

    holdCurrentCart() {
      if (State.cart.length === 0) {
        if (State.heldOrders.length > 0) {
          this.openHeldOrdersModal();
        } else {
          Sound.error();
          showToast('Keranjang masih kosong, tidak ada pesanan untuk diparkir.', 'warning');
        }
        return;
      }

      const totals = this.calculateCartTotals();
      const orderType = State.orderType || 'dine_in';
      const custRaw = (document.getElementById('cart-customer-name')?.value || '').trim();
      const defaultName = orderType === 'take_away' ? 'Bungkus' : (orderType === 'delivery' ? 'Pesan Antar' : 'Meja 01');

      const heldItem = {
        id: 'held-' + Date.now(),
        timestamp: new Date().toISOString(),
        orderType: orderType,
        customer: custRaw || defaultName,
        cart: JSON.parse(JSON.stringify(State.cart)),
        deliveryFee: totals.deliveryFee || 0,
        subtotal: totals.subtotal,
        grandTotal: totals.grandTotal
      };

      State.heldOrders.push(heldItem);
      State.saveHeldOrders();
      this.updateHeldCountBadge();

      POS.clearCart();
      Sound.success();
      showToast(`Pesanan "${heldItem.customer}" berhasil diparkir!`, 'success');
    },

    openHeldOrdersModal() {
      this.renderHeldOrders();
      const modal = document.getElementById('modal-held-orders');
      if (modal) modal.classList.remove('hidden');
    },

    closeHeldOrdersModal() {
      const modal = document.getElementById('modal-held-orders');
      if (modal) modal.classList.add('hidden');
    },

    renderHeldOrders() {
      const container = document.getElementById('held-orders-container');
      if (!container) return;
      container.innerHTML = '';

      if (State.heldOrders.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Tidak ada pesanan yang sedang diparkir saat ini.</p>
          </div>
        `;
        return;
      }

      State.heldOrders.forEach(h => {
        const itemSummaries = h.cart.map(i => `${i.name} (${i.qty}x)`).join(', ');
        const icon = h.orderType === 'take_away' ? '🛍️' : (h.orderType === 'delivery' ? '🛵' : '🍽️');
        const card = document.createElement('div');
        card.className = 'held-order-card';
        card.innerHTML = `
          <div class="held-card-left">
            <h4>${icon} ${h.customer} <span class="badge-tag badge-${h.orderType}">${h.orderType.replace('_', ' ').toUpperCase()}</span></h4>
            <p>${itemSummaries}</p>
            <small>${formatDate(h.timestamp)} • <strong>${formatRupiah(h.grandTotal)}</strong></small>
          </div>
          <div class="held-card-actions">
            <button type="button" class="btn btn-xs btn-primary" onclick="window.KasirApp.restoreHeldOrder('${h.id}')">
              Ambil Pesanan
            </button>
            <button type="button" class="btn btn-xs btn-outline-danger" onclick="window.KasirApp.deleteHeldOrder('${h.id}')">
              Hapus
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    },

    restoreHeldOrder(heldId) {
      const idx = State.heldOrders.findIndex(h => h.id === heldId);
      if (idx === -1) return;

      if (State.cart.length > 0) {
        if (!confirm('Keranjang saat ini berisi pesanan. Ganti dengan pesanan parkir ini?')) {
          return;
        }
      }

      const h = State.heldOrders[idx];
      State.cart = JSON.parse(JSON.stringify(h.cart));
      this.setOrderType(h.orderType || 'dine_in', true);
      const custInp = document.getElementById('cart-customer-name');
      if (custInp) custInp.value = h.customer || '';
      const delInp = document.getElementById('cart-delivery-fee');
      if (delInp && h.deliveryFee) delInp.value = h.deliveryFee;

      State.heldOrders.splice(idx, 1);
      State.saveHeldOrders();
      this.updateHeldCountBadge();
      this.closeHeldOrdersModal();

      this.updateCartUI();
      Sound.success();
      showToast(`Pesanan "${h.customer}" berhasil dimuat kembali ke keranjang!`, 'success');
    },

    deleteHeldOrder(heldId) {
      if (confirm('Hapus pesanan parkir ini?')) {
        State.heldOrders = State.heldOrders.filter(h => h.id !== heldId);
        State.saveHeldOrders();
        this.updateHeldCountBadge();
        this.renderHeldOrders();
        showToast('Pesanan parkir telah dihapus.', 'info');
      }
    },

    // --- KEYBOARD SHORTCUTS MODAL ---
    openShortcutsModal() {
      Sound.beep();
      const modal = document.getElementById('modal-shortcuts');
      if (modal) modal.classList.remove('hidden');
    },
    closeShortcutsModal() {
      Sound.beep();
      const modal = document.getElementById('modal-shortcuts');
      if (modal) modal.classList.add('hidden');
    },

    // --- POS CATALOG (ONLY MAKANAN & MINUMAN) ---
    renderCategories() {
      const categories = ['Semua', 'Makanan', 'Minuman'];
      const container = document.getElementById('pos-category-tabs');
      if (!container) return;
      container.innerHTML = '';

      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-cat ${State.selectedCategory === cat ? 'active' : ''}`;
        btn.textContent = cat === 'Semua' ? 'Semua Menu' : cat;
        btn.addEventListener('click', () => {
          Sound.beep();
          State.selectedCategory = cat;
          this.renderCategories();
          this.renderPosProducts();
        });
        container.appendChild(btn);
      });
    },

    renderPosProducts() {
      const grid = document.getElementById('pos-products-grid');
      if (!grid) return;
      grid.innerHTML = '';

      let list = State.products;

      if (State.selectedCategory && State.selectedCategory !== 'Semua' && State.selectedCategory !== 'all') {
        list = list.filter(p => p.category.toLowerCase() === State.selectedCategory.toLowerCase());
      }

      if (State.searchQuery.trim()) {
        const q = State.searchQuery.toLowerCase().trim();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q));
      }

      if (list.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>Tidak ada menu yang sesuai dengan pencarian.</p>
          </div>
        `;
        return;
      }

      list.forEach(p => {
        const isOutOfStock = p.stock <= 0;
        const isLowStock = p.stock > 0 && p.stock <= p.minStock;

        const card = document.createElement('div');
        card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;

        let badgeHtml = '';
        if (isOutOfStock) {
          badgeHtml = '<span class="card-stock-badge out">Habis</span>';
        } else if (isLowStock) {
          badgeHtml = `<span class="card-stock-badge low">Sisa ${p.stock}</span>`;
        } else {
          badgeHtml = `<span class="card-stock-badge">Porsi ${p.stock}</span>`;
        }

        card.innerHTML = `
          <div class="card-img-wrap">
            ${badgeHtml}
            <img src="${p.image}" alt="${p.name}" loading="lazy" class="prod-card-img">
          </div>
          <div class="card-info">
            <h4>${p.name}</h4>
            <div class="card-sku"><span class="badge-tag">${p.category}</span></div>
          </div>
          <div class="card-bottom">
            <span class="card-price">${formatRupiah(p.price)}</span>
            <button type="button" class="btn-quick-add" title="Tambah ke Pesanan" ${isOutOfStock ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        `;

        const imgEl = card.querySelector('.prod-card-img');
        if (imgEl) {
          imgEl.addEventListener('error', function() {
            if (p.id === 'prod-011' && !this.dataset.step) {
              this.dataset.step = '1';
              this.src = 'kntg.jpeg';
              return;
            }
            if (p.id === 'prod-011' && this.dataset.step === '1') {
              this.dataset.step = '2';
              this.src = 'kntg.jpg';
              return;
            }
            this.style.display = 'none';
            const imgWrap = this.parentElement;
            if (imgWrap && !imgWrap.querySelector('.img-fallback-icon')) {
              const fb = document.createElement('div');
              fb.className = 'img-fallback-icon';
              fb.innerHTML = `
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted)">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                </svg>
              `;
              imgWrap.appendChild(fb);
            }
          });
        }

        const quickAddBtn = card.querySelector('.btn-quick-add');
        if (quickAddBtn) {
          quickAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isOutOfStock) {
              POS.addToCart(p.id);
            } else {
              Sound.error();
              showToast(`Porsi menu "${p.name}" habis! Silakan lakukan restock di Manajemen Stok.`, 'warning');
            }
          });
        }

        card.addEventListener('click', () => {
          if (!isOutOfStock) {
            POS.addToCart(p.id);
          } else {
            Sound.error();
            showToast(`Porsi menu "${p.name}" habis! Silakan lakukan restock di Manajemen Stok.`, 'warning');
          }
        });

        grid.appendChild(card);
      });
    },

    // --- CART UI ---
    updateCartUI() {
      const container = document.getElementById('cart-items-container');
      const countBadge = document.getElementById('cart-item-count');
      const btnPay = document.getElementById('btn-open-payment');
      const mobileFloatBar = document.getElementById('mobile-cart-float-bar');
      const mobileFloatCount = document.getElementById('mobile-float-count');
      const mobileFloatTotal = document.getElementById('mobile-float-total');
      const posCartPanel = document.getElementById('pos-cart-panel');

      const totalItems = State.cart.reduce((sum, item) => sum + item.qty, 0);
      if (countBadge) countBadge.textContent = `${totalItems} item`;

      if (State.cart.length === 0) {
        if (mobileFloatBar) mobileFloatBar.classList.add('hidden');
        if (posCartPanel) posCartPanel.classList.remove('mobile-active');

        if (container) {
          container.innerHTML = `
            <div class="empty-cart-state">
              <div class="empty-cart-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <p class="empty-title">Keranjang Masih Kosong</p>
              <p class="empty-subtitle">Pilih kopi atau makanan dari katalog menu di sebelah kiri.</p>
            </div>
          `;
        }
        if (btnPay) btnPay.disabled = true;
      } else {
        if (mobileFloatBar) {
          mobileFloatBar.classList.remove('hidden');
          if (mobileFloatCount) mobileFloatCount.textContent = `${totalItems} porsi`;
        }

        if (container) {
          container.innerHTML = '';
          State.cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
              <div class="cart-item-top">
                <div>
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-price-unit">${formatRupiah(item.price)} / porsi</div>
                </div>
                <button class="btn-remove-item" title="Hapus pesanan" data-id="${item.id}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
              <div class="cart-item-bottom">
                <div class="qty-control">
                  <button class="btn-qty" data-action="dec" data-id="${item.id}">−</button>
                  <input type="number" class="input-qty" value="${item.qty}" min="1" max="${item.maxStock}" data-id="${item.id}">
                  <button class="btn-qty" data-action="inc" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-subtotal">${formatRupiah(item.price * item.qty)}</div>
              </div>
            `;

            itemEl.querySelector('.btn-remove-item').addEventListener('click', (e) => {
              e.stopPropagation();
              Sound.beep();
              POS.removeFromCart(item.id);
            });

            itemEl.querySelectorAll('.btn-qty').forEach(btn => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                Sound.beep();
                const action = btn.getAttribute('data-action');
                if (action === 'inc') POS.updateQty(item.id, item.qty + 1);
                if (action === 'dec') POS.updateQty(item.id, item.qty - 1);
              });
            });

            const inputQty = itemEl.querySelector('.input-qty');
            inputQty.addEventListener('change', (e) => {
              const val = parseInt(e.target.value, 10);
              POS.updateQty(item.id, isNaN(val) || val < 1 ? 1 : val);
            });

            container.appendChild(itemEl);
          });
        }
        if (btnPay) btnPay.disabled = false;
      }

      const totals = this.calculateCartTotals();
      if (mobileFloatTotal && totals) {
        mobileFloatTotal.textContent = formatRupiah(totals.grandTotal);
      }
    },

    calculateCartTotals() {
      const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const subtotalEl = document.getElementById('cart-subtotal');
      if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);

      const discTypeEl = document.getElementById('cart-discount-type');
      const discValEl = document.getElementById('cart-discount-value');
      const discountType = discTypeEl ? discTypeEl.value : 'percent';
      const discountVal = discValEl ? (parseFloat(discValEl.value) || 0) : 0;
      let discountNominal = 0;

      if (discountType === 'percent') {
        discountNominal = (subtotal * Math.min(discountVal, 100)) / 100;
      } else {
        discountNominal = Math.min(discountVal, subtotal);
      }

      const discNominalEl = document.getElementById('cart-discount-nominal');
      if (discNominalEl) discNominalEl.textContent = `-${formatRupiah(discountNominal)}`;

      const afterDiscount = Math.max(0, subtotal - discountNominal);

      const taxToggleEl = document.getElementById('cart-tax-toggle');
      const taxToggle = taxToggleEl ? taxToggleEl.checked : true;
      const taxRate = parseFloat(State.settings.taxRate) || 0;
      const taxRateEl = document.getElementById('cart-tax-rate');
      if (taxRateEl) taxRateEl.textContent = taxRate;

      let taxNominal = 0;
      if (taxToggle && taxRate > 0) {
        taxNominal = Math.round((afterDiscount * taxRate) / 100);
      }
      const taxNominalEl = document.getElementById('cart-tax-nominal');
      if (taxNominalEl) taxNominalEl.textContent = formatRupiah(taxNominal);

      // Delivery Fee (Ongkir)
      const delInput = document.getElementById('cart-delivery-fee');
      const deliveryFee = State.orderType === 'delivery' ? (parseFloat(delInput?.value) || 0) : 0;
      State.deliveryFee = deliveryFee;

      const grandTotal = afterDiscount + taxNominal + deliveryFee;
      const grandTotalEl = document.getElementById('cart-grand-total');
      if (grandTotalEl) grandTotalEl.textContent = formatRupiah(grandTotal);

      return { subtotal, discount: discountNominal, tax: taxNominal, deliveryFee, grandTotal };
    },

    // --- STOCK & ALERT BADGES ---
    updateStockAlerts() {
      const lowStockItems = State.products.filter(p => p.stock <= p.minStock);
      const count = lowStockItems.length;

      const navCounter = document.getElementById('stock-alert-counter');
      const menuBadge = document.getElementById('stock-menu-badge');
      const banner = document.getElementById('low-stock-banner');
      const bannerText = document.getElementById('low-stock-banner-text');

      if (count > 0) {
        if (navCounter) { navCounter.textContent = count; navCounter.classList.remove('hidden'); }
        if (menuBadge) { menuBadge.textContent = count; menuBadge.classList.remove('hidden'); }
        if (banner) {
          banner.classList.remove('hidden');
          if (bannerText) bannerText.textContent = `Ada ${count} menu Style Coffe & Food yang stoknya menipis. Segera lakukan restock.`;
        }
      } else {
        if (navCounter) navCounter.classList.add('hidden');
        if (menuBadge) menuBadge.classList.add('hidden');
        if (banner) banner.classList.add('hidden');
      }

      const totalProdEl = document.getElementById('kpi-total-products');
      if (totalProdEl) totalProdEl.textContent = `${State.products.length} Menu`;
      const inventoryVal = State.products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
      const invValEl = document.getElementById('kpi-total-inventory-value');
      if (invValEl) invValEl.textContent = formatRupiah(inventoryVal);
      const lowStockEl = document.getElementById('kpi-low-stock-count');
      if (lowStockEl) lowStockEl.textContent = `${count} Menu`;
    },

    // --- PRODUCT MANAGEMENT (CRUD) TABLE ---
    renderProductsTable() {
      const tbody = document.getElementById('products-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const searchQ = (document.getElementById('filter-product-search')?.value || '').toLowerCase().trim();
      const catFilter = document.getElementById('filter-product-category')?.value || 'all';
      const statusFilter = document.getElementById('filter-product-stock-status')?.value || 'all';

      let list = State.products.filter(p => {
        if (catFilter !== 'all' && p.category.toLowerCase() !== catFilter.toLowerCase()) return false;
        if (searchQ && !p.name.toLowerCase().includes(searchQ) && !p.barcode.toLowerCase().includes(searchQ)) return false;
        if (statusFilter === 'safe' && p.stock <= p.minStock) return false;
        if (statusFilter === 'low' && (p.stock > p.minStock || p.stock <= 0)) return false;
        if (statusFilter === 'empty' && p.stock > 0) return false;
        return true;
      });

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 24px; color: var(--text-muted);">Tidak ada menu yang sesuai filter.</td></tr>`;
        return;
      }

      list.forEach(p => {
        const marginNominal = p.price - p.cost;
        const marginPercent = p.cost > 0 ? Math.round((marginNominal / p.cost) * 100) : 0;

        let statusBadge = '';
        if (p.stock <= 0) {
          statusBadge = '<span class="status-badge empty">● Habis (0)</span>';
        } else if (p.stock <= p.minStock) {
          statusBadge = `<span class="status-badge low">● Menipis (${p.stock})</span>`;
        } else {
          statusBadge = `<span class="status-badge safe">● Aman (${p.stock})</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <img src="${p.image}" class="table-product-thumb" alt="${p.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'42\\' height=\\'42\\'><rect width=\\'42\\' height=\\'42\\' fill=\\'%23e2e8f0\\'/></svg>'">
          </td>
          <td><code>${p.barcode}</code></td>
          <td><strong>${p.name}</strong></td>
          <td><span class="badge-tag">${p.category}</span></td>
          <td>${formatRupiah(p.cost)}</td>
          <td><strong style="color: var(--color-primary);">${formatRupiah(p.price)}</strong></td>
          <td>${formatRupiah(marginNominal)} <small style="color: var(--color-success);">(+${marginPercent}%)</small></td>
          <td><strong>${p.stock}</strong> porsi <small style="color: var(--text-muted);">(Min: ${p.minStock})</small></td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon-sm" title="Edit Menu" onclick="window.KasirApp.openEditProductModal('${p.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-icon-sm delete" title="Hapus Menu" onclick="window.KasirApp.deleteProduct('${p.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },

    // --- STOCK MANAGEMENT & AUDIT LOGS ---
    renderStockView() {
      const tbodyStatus = document.getElementById('stock-status-table-body');
      if (tbodyStatus) {
        tbodyStatus.innerHTML = '';
        State.products.forEach(p => {
          let statusBadge = '';
          if (p.stock <= 0) {
            statusBadge = '<span class="status-badge empty">● Habis</span>';
          } else if (p.stock <= p.minStock) {
            statusBadge = `<span class="status-badge low">● Menipis (<= ${p.minStock})</span>`;
          } else {
            statusBadge = '<span class="status-badge safe">● Aman</span>';
          }

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><code>${p.barcode}</code></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge-tag">${p.category}</span></td>
            <td><strong style="font-size: 14px;">${p.stock}</strong> porsi</td>
            <td>${p.minStock} porsi</td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">
              <div class="action-btn-group">
                <button class="btn btn-xs btn-outline-success" onclick="window.KasirApp.openAdjustStockModal('${p.id}', 'IN')">
                  + Restock
                </button>
                <button class="btn btn-xs btn-outline-danger" onclick="window.KasirApp.openAdjustStockModal('${p.id}', 'OUT')">
                  − Koreksi
                </button>
              </div>
            </td>
          `;
          tbodyStatus.appendChild(tr);
        });
      }

      const tbodyLogs = document.getElementById('stock-logs-table-body');
      if (tbodyLogs) {
        tbodyLogs.innerHTML = '';
        const logFilter = (document.getElementById('filter-stock-log-search')?.value || '').toLowerCase().trim();
        const filteredLogs = State.stockLogs.filter(l => {
          if (!logFilter) return true;
          return l.productName.toLowerCase().includes(logFilter) ||
                 l.barcode.toLowerCase().includes(logFilter) ||
                 (l.notes && l.notes.toLowerCase().includes(logFilter));
        });

        if (filteredLogs.length === 0) {
          tbodyLogs.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Belum ada riwayat mutasi stok.</td></tr>`;
        } else {
          filteredLogs.slice().reverse().forEach(log => {
            const isPlus = log.qty > 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${formatDate(log.timestamp)}</td>
              <td><strong>${log.productName}</strong> <small>(<code>${log.barcode}</code>)</small></td>
              <td><span class="badge-tag ${isPlus ? 'badge-kasir' : 'badge-admin'}">${log.type}</span></td>
              <td><strong style="color: ${isPlus ? 'var(--color-success)' : 'var(--color-danger)'};">${isPlus ? '+' : ''}${log.qty}</strong></td>
              <td>${log.finalStock} porsi</td>
              <td>${log.notes || '-'}</td>
              <td>${log.user || 'Sistem'}</td>
            `;
            tbodyLogs.appendChild(tr);
          });
        }
      }
    },

    // --- REPORTS & HISTORICAL DAILY REKAP ---
    renderReportsView(period = 'today') {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      let filteredTrx = State.transactions;

      const periodTextEl = document.getElementById('report-period-text');
      if (period === 'today') {
        filteredTrx = State.transactions.filter(t => t.timestamp.startsWith(todayStr));
        if (periodTextEl) periodTextEl.textContent = 'Hari Ini (Otomatis Reset Setiap Hari)';
      } else if (period === 'yesterday') {
        const y = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
        filteredTrx = State.transactions.filter(t => t.timestamp.startsWith(y));
        if (periodTextEl) periodTextEl.textContent = 'Periode Kemarin';
      } else if (period === 'week') {
        const pastWeek = new Date(now.getTime() - 7 * 86400000);
        filteredTrx = State.transactions.filter(t => new Date(t.timestamp) >= pastWeek);
        if (periodTextEl) periodTextEl.textContent = '7 Hari Terakhir';
      } else if (period === 'month') {
        const monthStr = now.toISOString().slice(0, 7);
        filteredTrx = State.transactions.filter(t => t.timestamp.startsWith(monthStr));
        if (periodTextEl) periodTextEl.textContent = 'Bulan Ini';
      } else {
        if (periodTextEl) periodTextEl.textContent = 'Semua Riwayat Transaksi';
      }

      const totalRevenue = filteredTrx.reduce((sum, t) => sum + t.grandTotal, 0);
      const totalOrders = filteredTrx.length;
      const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      let totalItemsSold = 0;
      let totalCost = 0;
      const productSalesMap = {};

      filteredTrx.forEach(t => {
        t.items.forEach(item => {
          totalItemsSold += item.qty;
          totalCost += (item.cost || 0) * item.qty;

          if (!productSalesMap[item.name]) {
            productSalesMap[item.name] = { qty: 0, revenue: 0 };
          }
          productSalesMap[item.name].qty += item.qty;
          productSalesMap[item.name].revenue += item.subtotal;
        });
      });

      const grossProfit = Math.max(0, totalRevenue - totalCost);

      const revEl = document.getElementById('report-total-revenue');
      if (revEl) revEl.textContent = formatRupiah(totalRevenue);
      const ordersEl = document.getElementById('report-total-orders');
      if (ordersEl) ordersEl.textContent = `${totalOrders} Transaksi`;
      const avgEl = document.getElementById('report-avg-order');
      if (avgEl) avgEl.textContent = `Rata-rata: ${formatRupiah(avgOrder)} / nota`;
      const profitEl = document.getElementById('report-gross-profit');
      if (profitEl) profitEl.textContent = formatRupiah(grossProfit);
      const soldEl = document.getElementById('report-items-sold');
      if (soldEl) soldEl.textContent = `${totalItemsSold} Porsi`;

      // Top 5 Menu Terlaris
      const topProductsList = document.getElementById('top-products-list');
      if (topProductsList) {
        topProductsList.innerHTML = '';
        const sortedProducts = Object.entries(productSalesMap)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 5);

        if (sortedProducts.length === 0) {
          topProductsList.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">Belum ada pesanan pada periode ini.</p>';
        } else {
          sortedProducts.forEach(([name, data], idx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'top-product-item';
            itemDiv.innerHTML = `
              <div class="top-prod-info">
                <span class="rank-badge">${idx + 1}</span>
                <span class="top-prod-name">${name}</span>
              </div>
              <div class="top-prod-sales">${data.qty} porsi <small style="color: var(--text-muted);">(${formatRupiah(data.revenue)})</small></div>
            `;
            topProductsList.appendChild(itemDiv);
          });
        }
      }

      this.renderDailyRekapTable();
      this.renderTransactionsHistory();
    },

    // Daily Rekap Table: Groups all transactions by day
    renderDailyRekapTable() {
      const tbody = document.getElementById('daily-rekap-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const dateMap = {};
      State.transactions.forEach(t => {
        const dStr = t.timestamp.slice(0, 10);
        if (!dateMap[dStr]) {
          dateMap[dStr] = { count: 0, qty: 0, revenue: 0, cost: 0 };
        }
        dateMap[dStr].count += 1;
        dateMap[dStr].revenue += t.grandTotal;
        t.items.forEach(i => {
          dateMap[dStr].qty += i.qty;
          dateMap[dStr].cost += (i.cost || 0) * i.qty;
        });
      });

      const sortedDates = Object.keys(dateMap).sort().reverse();
      const todayStr = new Date().toISOString().slice(0, 10);

      if (sortedDates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 18px; color: var(--text-muted);">Belum ada riwayat harian.</td></tr>';
        return;
      }

      sortedDates.forEach(dStr => {
        const data = dateMap[dStr];
        const isToday = dStr === todayStr;
        const profit = Math.max(0, data.revenue - data.cost);

        const dObj = new Date(dStr + 'T00:00:00');
        const formattedDateStr = dObj.toLocaleDateString('id-ID', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong>${formattedDateStr}</strong>
            ${isToday ? '<span class="badge-tag badge-kasir" style="margin-left: 6px;">Hari Ini</span>' : ''}
          </td>
          <td>${data.count} nota</td>
          <td>${data.qty} porsi</td>
          <td><strong style="color: var(--color-primary);">${formatRupiah(data.revenue)}</strong></td>
          <td style="color: var(--color-success); font-weight: 700;">${formatRupiah(profit)}</td>
        `;
        tbody.appendChild(tr);
      });
    },

    renderTransactionsHistory() {
      const tbody = document.getElementById('transactions-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const searchQ = (document.getElementById('filter-history-search')?.value || '').toLowerCase().trim();
      const filtered = State.transactions.filter(t => {
        if (!searchQ) return true;
        return t.invoiceNo.toLowerCase().includes(searchQ) || t.cashier.toLowerCase().includes(searchQ);
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Belum ada riwayat transaksi nota.</td></tr>';
        return;
      }

      filtered.slice().reverse().forEach(trx => {
        const itemSummaries = trx.items.map(i => `${i.name} (${i.qty}x)`).join(', ');
        const orderIcon = trx.orderType === 'take_away' ? '🛍️' : (trx.orderType === 'delivery' ? '🛵' : '🍽️');
        const orderBadge = `<span class="badge-tag badge-${trx.orderType || 'dine_in'}">${orderIcon} ${trx.orderTypeLabel || 'Dine In'}</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${trx.invoiceNo}</strong><br><small style="color: var(--text-muted);">${trx.customer || '-'}</small></td>
          <td>${formatDate(trx.timestamp)}</td>
          <td>${trx.cashier}</td>
          <td><small style="color: var(--text-secondary);">${itemSummaries}</small></td>
          <td>${orderBadge}<br><span class="badge-tag" style="margin-top: 4px;">${trx.paymentMethod}</span></td>
          <td><strong style="color: var(--color-primary);">${formatRupiah(trx.grandTotal)}</strong></td>
          <td style="text-align: right;">
            <button class="btn btn-xs btn-outline-primary" onclick="window.KasirApp.viewReceiptModal('${trx.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Struk</span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },

    populateSettingsForm() {
      const s = State.settings;
      const sName = document.getElementById('set-store-name');
      if (sName) sName.value = s.storeName || '';
      const sSlogan = document.getElementById('set-store-slogan');
      if (sSlogan) sSlogan.value = s.storeSlogan || '';
      const sAddr = document.getElementById('set-store-address');
      if (sAddr) sAddr.value = s.storeAddress || '';
      const sPhone = document.getElementById('set-store-phone');
      if (sPhone) sPhone.value = s.storePhone || '';
      const sWidth = document.getElementById('set-printer-width');
      if (sWidth) sWidth.value = s.printerWidth || '58mm';
      const sTax = document.getElementById('set-tax-rate');
      if (sTax) sTax.value = s.taxRate || 11;
      const sFoot = document.getElementById('set-receipt-footer');
      if (sFoot) sFoot.value = s.receiptFooter || '';

      const storeTitleBadge = document.getElementById('store-title-badge');
      if (storeTitleBadge) storeTitleBadge.textContent = s.storeAddress;
    },

    // --- BIND ALL DOM EVENTS ---
    bindEvents() {
      // 1. Auth Tabs: Login vs Register
      const tabLogin = document.getElementById('tab-btn-login');
      const tabReg = document.getElementById('tab-btn-register');
      const formLogin = document.getElementById('login-form');
      const formReg = document.getElementById('register-form');

      if (tabLogin && tabReg && formLogin && formReg) {
        tabLogin.addEventListener('click', () => {
          tabLogin.classList.add('active');
          tabReg.classList.remove('active');
          formLogin.classList.remove('hidden');
          formReg.classList.add('hidden');
        });

        tabReg.addEventListener('click', () => {
          tabReg.classList.add('active');
          tabLogin.classList.remove('active');
          formReg.classList.remove('hidden');
          formLogin.classList.add('hidden');
        });

        // Login Form Submit (STRICT CHECK)
        formLogin.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = document.getElementById('login-username').value;
          const password = document.getElementById('login-password').value;
          const role = document.getElementById('login-role').value;
          Auth.login(username, password, role);
        });

        // Register Form Submit
        formReg.addEventListener('submit', (e) => {
          e.preventDefault();
          const fullName = document.getElementById('reg-fullname').value;
          const username = document.getElementById('reg-username').value;
          const role = document.getElementById('reg-role').value;
          const password = document.getElementById('reg-password').value;
          Auth.register(fullName, username, password, role);
        });
      }



      // Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          Sound.beep();
          Auth.logout();
        });
      }

      // Theme toggle
      const btnTheme = document.getElementById('btn-toggle-theme');
      if (btnTheme) {
        btnTheme.addEventListener('click', () => {
          Sound.beep();
          const current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
          const next = current === 'theme-dark' ? 'theme-light' : 'theme-dark';
          document.body.className = next;
          localStorage.setItem(STORAGE_KEYS.THEME, next);
          State.updateThemeIcons(next);
        });
      }

      // Sound toggle
      const btnSound = document.getElementById('btn-toggle-sound');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          Sound.enabled = !Sound.enabled;
          if (Sound.enabled) Sound.beep();
          const onIcon = document.getElementById('icon-sound-on');
          const offIcon = document.getElementById('icon-sound-off');
          if (onIcon) onIcon.classList.toggle('hidden', !Sound.enabled);
          if (offIcon) offIcon.classList.toggle('hidden', Sound.enabled);
          showToast(Sound.enabled ? 'Suara kasir diaktifkan' : 'Suara kasir dibisukan', 'info');
        });
      }

      // Fullscreen Toggle
      const btnFullscreen = document.getElementById('btn-toggle-fullscreen');
      if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
          Sound.beep();
          if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch((err) => {
                showToast('Layar penuh diblokir browser: ' + err.message, 'info');
              });
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        });
      }

      document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        const enterIcon = document.getElementById('icon-fs-enter');
        const exitIcon = document.getElementById('icon-fs-exit');
        if (enterIcon) enterIcon.classList.toggle('hidden', isFs);
        if (exitIcon) exitIcon.classList.toggle('hidden', !isFs);
        showToast(isFs ? 'Mode Layar Penuh (Fullscreen POS) Aktif' : 'Keluar dari Layar Penuh', 'info');
      });

      // Navigation Tabs
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
          Sound.beep();
          const view = link.getAttribute('data-view');
          this.switchView(view);
          document.body.classList.remove('mobile-sidebar-open');
        });
      });

      // Mobile Sidebar Controls
      const btnMobileSidebar = document.getElementById('btn-mobile-sidebar-toggle');
      const btnCloseMobileSidebar = document.getElementById('btn-close-mobile-sidebar');
      const sidebarBackdrop = document.getElementById('sidebar-backdrop');
      if (btnMobileSidebar) {
        btnMobileSidebar.addEventListener('click', () => {
          Sound.beep();
          document.body.classList.toggle('mobile-sidebar-open');
        });
      }
      if (btnCloseMobileSidebar) {
        btnCloseMobileSidebar.addEventListener('click', () => {
          Sound.beep();
          document.body.classList.remove('mobile-sidebar-open');
        });
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
          document.body.classList.remove('mobile-sidebar-open');
        });
      }

      // Mobile Cart Drawer Controls
      const btnOpenMobileCart = document.getElementById('btn-open-mobile-cart');
      const btnCloseMobileCart = document.getElementById('btn-close-mobile-cart');
      const posCartPanel = document.getElementById('pos-cart-panel');
      if (btnOpenMobileCart && posCartPanel) {
        btnOpenMobileCart.addEventListener('click', () => {
          Sound.beep();
          posCartPanel.classList.add('mobile-active');
        });
      }
      if (btnCloseMobileCart && posCartPanel) {
        btnCloseMobileCart.addEventListener('click', () => {
          Sound.beep();
          posCartPanel.classList.remove('mobile-active');
        });
      }

      const btnAlert = document.getElementById('btn-stock-alert');
      if (btnAlert) {
        btnAlert.addEventListener('click', () => {
          Sound.beep();
          this.switchView('stock');
        });
      }

      // POS Search
      const posSearch = document.getElementById('pos-search-input');
      const posClear = document.getElementById('pos-search-clear');
      if (posSearch) {
        posSearch.addEventListener('input', (e) => {
          State.searchQuery = e.target.value;
          if (posClear) posClear.classList.toggle('hidden', !State.searchQuery);
          this.renderPosProducts();
        });
      }
      if (posClear && posSearch) {
        posClear.addEventListener('click', () => {
          posSearch.value = '';
          State.searchQuery = '';
          posClear.classList.add('hidden');
          this.renderPosProducts();
          posSearch.focus();
        });
      }

      // Barcode Enter Trigger
      const barcodeInput = document.getElementById('pos-barcode-input');
      if (barcodeInput) {
        barcodeInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const code = barcodeInput.value.trim();
            if (code) {
              POS.scanBarcode(code);
              barcodeInput.value = '';
            }
          }
        });
      }

      // Cart Controls
      const btnClearCart = document.getElementById('btn-clear-cart');
      if (btnClearCart) {
        btnClearCart.addEventListener('click', () => {
          if (State.cart.length === 0) return;
          if (confirm('Kosongkan semua pesanan dalam keranjang saat ini?')) {
            POS.clearCart();
          }
        });
      }

      const cartDiscType = document.getElementById('cart-discount-type');
      if (cartDiscType) cartDiscType.addEventListener('change', () => this.calculateCartTotals());
      const cartDiscVal = document.getElementById('cart-discount-value');
      if (cartDiscVal) cartDiscVal.addEventListener('input', () => this.calculateCartTotals());
      const cartTaxToggle = document.getElementById('cart-tax-toggle');
      if (cartTaxToggle) cartTaxToggle.addEventListener('change', () => this.calculateCartTotals());

      // Order Type Selector (Dine In, Take Away, Delivery)
      document.querySelectorAll('.btn-order-type').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          this.setOrderType(type);
        });
      });

      const custNameInput = document.getElementById('cart-customer-name');
      if (custNameInput) {
        custNameInput.addEventListener('input', (e) => {
          State.customerName = e.target.value;
        });
      }

      const delFeeInput = document.getElementById('cart-delivery-fee');
      if (delFeeInput) {
        delFeeInput.addEventListener('input', () => {
          this.calculateCartTotals();
        });
      }

      this.bindChipClicks();

      // Open Payment Modal
      const btnPay = document.getElementById('btn-open-payment');
      if (btnPay) btnPay.addEventListener('click', () => POS.openPaymentModal());

      // Global Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'F1') {
          e.preventDefault();
          UI.openShortcutsModal();
        } else if (e.key === 'F2') {
          e.preventDefault();
          const searchInp = document.getElementById('pos-search-input');
          if (searchInp) searchInp.focus();
        } else if (e.key === 'F3') {
          e.preventDefault();
          const barInp = document.getElementById('pos-barcode-input');
          if (barInp) barInp.focus();
        } else if (e.key === 'F4' && State.activeView === 'pos' && State.cart.length > 0) {
          e.preventDefault();
          POS.openPaymentModal();
        } else if (e.key === 'F7' && State.activeView === 'pos') {
          e.preventDefault();
          UI.holdCurrentCart();
        } else if (e.key === 'F8' && State.activeView === 'pos') {
          e.preventDefault();
          if (State.cart.length > 0 && confirm('Kosongkan semua pesanan dalam keranjang saat ini?')) {
            POS.clearCart();
          }
        } else if (e.key === 'F9' && State.activeView === 'pos') {
          e.preventDefault();
          UI.openHeldOrdersModal();
        } else if (e.key === 'Escape') {
          // Close active modals
          POS.closePaymentModal();
          POS.closeReceiptModal();
          UI.closeProductModal();
          UI.closeStockAdjustModal();
          UI.closeHeldOrdersModal();
          UI.closeShortcutsModal();
        }
      });

      // 3 PAYMENT METHODS ONLY: Tunai, QRIS, Transfer (EDC Removed)
      document.querySelectorAll('.payment-method-selector-3 .method-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.payment-method-selector-3 .method-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.method-content').forEach(c => c.classList.remove('active'));

          tab.classList.add('active');
          const m = tab.getAttribute('data-method');
          const content = document.getElementById(`method-content-${m}`);
          if (content) content.classList.add('active');

          POS.currentPaymentMethod = m;
          POS.updatePaymentAmounts();
        });
      });

      // Quick Cash Bills
      const btnCashExact = document.getElementById('btn-cash-exact');
      if (btnCashExact) {
        btnCashExact.addEventListener('click', () => {
          const total = POS.currentGrandTotal || 0;
          const cashInp = document.getElementById('payment-cash-input');
          if (cashInp) cashInp.value = total;
          POS.updatePaymentAmounts();
        });
      }

      document.querySelectorAll('.btn-quick-cash[data-val]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = parseInt(btn.getAttribute('data-val'), 10);
          const cashInp = document.getElementById('payment-cash-input');
          if (cashInp) cashInp.value = val;
          POS.updatePaymentAmounts();
        });
      });

      const cashInput = document.getElementById('payment-cash-input');
      if (cashInput) {
        cashInput.addEventListener('input', () => POS.updatePaymentAmounts());
        cashInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            POS.finalizeTransaction();
          }
        });
      }

      // Copy Bank Account Number Button
      const btnCopyAcc = document.getElementById('btn-copy-acc');
      if (btnCopyAcc) {
        btnCopyAcc.addEventListener('click', () => {
          const accNum = document.getElementById('transfer-acc-number').textContent;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(accNum).then(() => {
              const textEl = document.getElementById('copy-acc-text');
              if (textEl) textEl.textContent = 'Tersalin!';
              showToast(`No. Rekening ${accNum} berhasil disalin ke clipboard.`, 'success');
              setTimeout(() => { if (textEl) textEl.textContent = 'Salin No. Rek'; }, 2000);
            }).catch(() => {
              showToast(`Nomor Rekening: ${accNum}`, 'info');
            });
          } else {
            showToast(`Nomor Rekening: ${accNum}`, 'info');
          }
        });
      }

      const btnClosePay = document.getElementById('btn-close-payment');
      if (btnClosePay) btnClosePay.addEventListener('click', () => { Sound.beep(); POS.closePaymentModal(); });
      const btnCancelPay = document.getElementById('btn-cancel-payment');
      if (btnCancelPay) btnCancelPay.addEventListener('click', () => { Sound.beep(); POS.closePaymentModal(); });
      const btnConfirmPay = document.getElementById('btn-confirm-payment');
      if (btnConfirmPay) btnConfirmPay.addEventListener('click', () => POS.finalizeTransaction());

      // Thermal Receipt Modal
      const btnCloseRec = document.getElementById('btn-close-receipt');
      if (btnCloseRec) btnCloseRec.addEventListener('click', () => { Sound.beep(); POS.closeReceiptModal(); });
      const btnDoneRec = document.getElementById('btn-done-receipt');
      if (btnDoneRec) btnDoneRec.addEventListener('click', () => { Sound.beep(); POS.closeReceiptModal(); });
      const btnPrint = document.getElementById('btn-trigger-print');
      if (btnPrint) btnPrint.addEventListener('click', () => { Sound.beep(); window.print(); });

      // Paper Width Switch (58mm vs 80mm)
      document.querySelectorAll('.btn-paper-width').forEach(btn => {
        btn.addEventListener('click', () => {
          Sound.beep();
          const width = btn.getAttribute('data-width');
          document.querySelectorAll('.btn-paper-width').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          State.settings.printerWidth = width;
          State.saveSettings();
          const setWidthSel = document.getElementById('set-printer-width');
          if (setWidthSel) setWidthSel.value = width;

          const paperCust = document.getElementById('thermal-receipt-paper');
          if (paperCust) {
            paperCust.classList.remove('width-58mm', 'width-80mm');
            paperCust.classList.add(`width-${width}`);
          }
          const paperKit = document.getElementById('kitchen-ticket-paper');
          if (paperKit) {
            paperKit.classList.remove('width-58mm', 'width-80mm');
            paperKit.classList.add(`width-${width}`);
          }
          showToast(`Lebar kertas cetak diatur ke ${width}`, 'info');
        });
      });

      // Receipt Type Tabs (Struk Pelanggan vs Tiket Dapur)
      const tabCustomer = document.getElementById('tab-receipt-customer');
      const tabKitchen = document.getElementById('tab-receipt-kitchen');
      const paperCustomer = document.getElementById('thermal-receipt-paper');
      const paperKitchen = document.getElementById('kitchen-ticket-paper');
      const btnPrintKitchen = document.getElementById('btn-print-kitchen-ticket');
      const btnPrintLabel = document.getElementById('btn-print-label');

      if (tabCustomer && tabKitchen && paperCustomer && paperKitchen) {
        tabCustomer.addEventListener('click', () => {
          Sound.beep();
          tabCustomer.classList.add('active');
          tabKitchen.classList.remove('active');
          paperCustomer.classList.remove('hidden');
          paperKitchen.classList.add('hidden');
          if (btnPrintLabel) btnPrintLabel.textContent = 'Cetak Struk Kasir';
        });

        tabKitchen.addEventListener('click', () => {
          Sound.beep();
          tabKitchen.classList.add('active');
          tabCustomer.classList.remove('active');
          paperKitchen.classList.remove('hidden');
          paperCustomer.classList.add('hidden');
          if (btnPrintLabel) btnPrintLabel.textContent = 'Cetak Tiket Dapur';
        });
      }

      if (btnPrintKitchen) {
        btnPrintKitchen.addEventListener('click', () => {
          Sound.beep();
          if (tabKitchen) tabKitchen.click();
          setTimeout(() => window.print(), 120);
        });
      }

      // Held Orders Modal & Buttons
      const btnHoldCart = document.getElementById('btn-hold-cart');
      if (btnHoldCart) {
        btnHoldCart.addEventListener('click', () => {
          Sound.beep();
          this.holdCurrentCart();
        });
      }
      const btnViewHeld = document.getElementById('btn-view-held');
      if (btnViewHeld) {
        btnViewHeld.addEventListener('click', () => {
          Sound.beep();
          this.openHeldOrdersModal();
        });
      }
      const btnCloseHeld = document.getElementById('btn-close-held-orders');
      if (btnCloseHeld) {
        btnCloseHeld.addEventListener('click', () => {
          Sound.beep();
          this.closeHeldOrdersModal();
        });
      }
      const btnDoneHeld = document.getElementById('btn-done-held-orders');
      if (btnDoneHeld) {
        btnDoneHeld.addEventListener('click', () => {
          Sound.beep();
          this.closeHeldOrdersModal();
        });
      }

      // Shortcuts Modal & Buttons
      const btnOpenShortcuts = document.getElementById('btn-open-shortcuts');
      if (btnOpenShortcuts) btnOpenShortcuts.addEventListener('click', () => this.openShortcutsModal());
      const btnCloseShortcuts = document.getElementById('btn-close-shortcuts');
      if (btnCloseShortcuts) btnCloseShortcuts.addEventListener('click', () => this.closeShortcutsModal());
      const btnDoneShortcuts = document.getElementById('btn-done-shortcuts');
      if (btnDoneShortcuts) btnDoneShortcuts.addEventListener('click', () => this.closeShortcutsModal());

      // Products Filter
      const filtSearch = document.getElementById('filter-product-search');
      if (filtSearch) filtSearch.addEventListener('input', () => this.renderProductsTable());
      const filtCat = document.getElementById('filter-product-category');
      if (filtCat) filtCat.addEventListener('change', () => this.renderProductsTable());
      const filtStatus = document.getElementById('filter-product-stock-status');
      if (filtStatus) filtStatus.addEventListener('change', () => this.renderProductsTable());

      // Product Form Modal (CRUD)
      const btnAddProd = document.getElementById('btn-add-product');
      if (btnAddProd) {
        btnAddProd.addEventListener('click', () => {
          Sound.beep();
          this.openAddProductModal();
        });
      }
      const btnCloseProdForm = document.getElementById('btn-close-product-form');
      if (btnCloseProdForm) btnCloseProdForm.addEventListener('click', () => this.closeProductModal());
      const btnCancelProdForm = document.getElementById('btn-cancel-product-form');
      if (btnCancelProdForm) btnCancelProdForm.addEventListener('click', () => this.closeProductModal());
      const btnGenBarcode = document.getElementById('btn-gen-barcode');
      if (btnGenBarcode) {
        btnGenBarcode.addEventListener('click', () => {
          Sound.beep();
          const randomBarcode = 'SC-' + Math.floor(100 + Math.random() * 900);
          document.getElementById('prod-barcode').value = randomBarcode;
        });
      }

      // Product File Image upload preview
      const btnTriggerUpload = document.getElementById('btn-trigger-file-upload');
      const prodFileInput = document.getElementById('prod-file-input');
      if (btnTriggerUpload && prodFileInput) {
        btnTriggerUpload.addEventListener('click', () => {
          Sound.beep();
          prodFileInput.click();
        });
        prodFileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const previewWrap = document.getElementById('prod-image-preview');
              if (previewWrap) previewWrap.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
              const urlInp = document.getElementById('prod-image-url');
              if (urlInp) urlInp.value = '';
            };
            reader.readAsDataURL(file);
          }
        });
      }

      const prodImgUrl = document.getElementById('prod-image-url');
      if (prodImgUrl) {
        prodImgUrl.addEventListener('input', (e) => {
          const url = e.target.value.trim();
          if (url) {
            const previewWrap = document.getElementById('prod-image-preview');
            if (previewWrap) previewWrap.innerHTML = `<img src="${url}" alt="Preview" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'42\\' height=\\'42\\'><rect width=\\'42\\' height=\\'42\\' fill=\\'%23e2e8f0\\'/></svg>'">`;
          }
        });
      }

      const formProdCrud = document.getElementById('form-product-crud');
      if (formProdCrud) {
        formProdCrud.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveProductForm();
        });
      }

      // Stock Subtabs
      document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          Sound.beep();
          document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.getAttribute('data-subtab');
          const content = document.getElementById(`subtab-${target}`);
          if (content) content.classList.add('active');
        });
      });

      const filtStockSearch = document.getElementById('filter-stock-log-search');
      if (filtStockSearch) filtStockSearch.addEventListener('input', () => this.renderStockView());

      const btnQuickIn = document.getElementById('btn-quick-stock-in');
      if (btnQuickIn) {
        btnQuickIn.addEventListener('click', () => {
          Sound.beep();
          this.openAdjustStockModal(State.products[0]?.id, 'IN');
        });
      }
      const btnQuickOut = document.getElementById('btn-quick-stock-out');
      if (btnQuickOut) {
        btnQuickOut.addEventListener('click', () => {
          Sound.beep();
          this.openAdjustStockModal(State.products[0]?.id, 'OUT');
        });
      }

      const btnCloseStockAdj = document.getElementById('btn-close-stock-adjust');
      if (btnCloseStockAdj) btnCloseStockAdj.addEventListener('click', () => this.closeStockAdjustModal());
      const btnCancelStockAdj = document.getElementById('btn-cancel-stock-adjust');
      if (btnCancelStockAdj) btnCancelStockAdj.addEventListener('click', () => this.closeStockAdjustModal());
      const formStockAdj = document.getElementById('form-stock-adjust');
      if (formStockAdj) {
        formStockAdj.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveStockAdjustment();
        });
      }

      // Reports Period Filter
      document.querySelectorAll('.btn-period').forEach(btn => {
        btn.addEventListener('click', () => {
          Sound.beep();
          document.querySelectorAll('.btn-period').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderReportsView(btn.getAttribute('data-period'));
        });
      });

      const filtHistSearch = document.getElementById('filter-history-search');
      if (filtHistSearch) filtHistSearch.addEventListener('input', () => this.renderTransactionsHistory());

      // Export CSV
      const btnExportExcel = document.getElementById('btn-export-excel');
      if (btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
          Sound.beep();
          this.exportTransactionsToCsv();
        });
      }

      // Print Summary Report
      const btnPrintReport = document.getElementById('btn-print-report');
      if (btnPrintReport) {
        btnPrintReport.addEventListener('click', () => {
          Sound.beep();
          window.print();
        });
      }

      // Settings Forms
      const formStoreProfile = document.getElementById('form-store-profile');
      if (formStoreProfile) {
        formStoreProfile.addEventListener('submit', (e) => {
          e.preventDefault();
          State.settings.storeName = document.getElementById('set-store-name').value;
          State.settings.storeSlogan = document.getElementById('set-store-slogan').value;
          State.settings.storeAddress = document.getElementById('set-store-address').value;
          State.settings.storePhone = document.getElementById('set-store-phone').value;
          State.saveSettings();
          const badge = document.getElementById('store-title-badge');
          if (badge) badge.textContent = State.settings.storeAddress;
          showToast('Profil Style Coffe & Food berhasil diperbarui!', 'success');
        });
      }

      const formReceiptSet = document.getElementById('form-receipt-settings');
      if (formReceiptSet) {
        formReceiptSet.addEventListener('submit', (e) => {
          e.preventDefault();
          State.settings.printerWidth = document.getElementById('set-printer-width').value;
          State.settings.taxRate = parseFloat(document.getElementById('set-tax-rate').value) || 0;
          State.settings.receiptFooter = document.getElementById('set-receipt-footer').value;
          State.saveSettings();
          this.calculateCartTotals();
          showToast('Pengaturan struk berhasil disimpan!', 'success');
        });
      }

      const btnTestPrint = document.getElementById('btn-test-print');
      if (btnTestPrint) {
        btnTestPrint.addEventListener('click', () => {
          Sound.beep();
          if (State.transactions.length > 0) {
            POS.renderReceipt(State.transactions[0]);
            document.getElementById('modal-receipt').classList.remove('hidden');
          } else {
            showToast('Belum ada data transaksi contoh.', 'warning');
          }
        });
      }

      // Backup & Restore
      const btnBackup = document.getElementById('btn-backup-data');
      if (btnBackup) {
        btnBackup.addEventListener('click', () => {
          Sound.beep();
          this.backupDataJson();
        });
      }

      const inputRestore = document.getElementById('input-restore-file');
      const btnTriggerRestore = document.getElementById('btn-trigger-restore');
      if (btnTriggerRestore && inputRestore) {
        btnTriggerRestore.addEventListener('click', () => {
          Sound.beep();
          inputRestore.click();
        });
        inputRestore.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const data = JSON.parse(event.target.result);
                if (data.products && data.settings) {
                  State.products = data.products;
                  State.settings = data.settings;
                  State.transactions = data.transactions || [];
                  State.stockLogs = data.stockLogs || [];
                  State.registeredUsers = data.registeredUsers || State.registeredUsers;
                  State.saveProducts();
                  State.saveSettings();
                  State.saveTransactions();
                  State.saveStockLogs();
                  State.saveUsers();
                  this.init();
                  Sound.success();
                  showToast('Data berhasil dipulihkan dari cadangan!', 'success');
                } else {
                  Sound.error();
                  showToast('Format berkas JSON tidak sesuai!', 'error');
                }
              } catch (err) {
                Sound.error();
                showToast('Gagal membaca berkas JSON: ' + err.message, 'error');
              }
            };
            reader.readAsDataURL ? reader.readAsText(file) : reader.readAsText(file);
          }
        });
      }

      const btnResetDemo = document.getElementById('btn-reset-demo');
      if (btnResetDemo) {
        btnResetDemo.addEventListener('click', () => {
          Sound.beep();
          if (confirm('Kembalikan ke menu makanan & minuman bawaan Style Coffe & Style Food?')) {
            localStorage.clear();
            State.init();
            this.init();
            Sound.success();
            showToast('Data berhasil direset ke menu bawaan Style Coffe & Food.', 'info');
          }
        });
      }
    },

    // --- PRODUCT CRUD MODAL ---
    openAddProductModal() {
      Sound.beep();
      document.getElementById('modal-product-title').textContent = 'Tambah Menu Baru';
      document.getElementById('prod-id').value = '';
      document.getElementById('prod-name').value = '';
      document.getElementById('prod-barcode').value = 'SC-' + Math.floor(100 + Math.random() * 900);
      document.getElementById('prod-category').value = 'Minuman';
      document.getElementById('prod-cost').value = '';
      document.getElementById('prod-price').value = '';
      document.getElementById('prod-stock').value = '25';
      document.getElementById('prod-min-stock').value = '5';
      document.getElementById('prod-image-url').value = '';
      document.getElementById('prod-image-preview').innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
      `;

      document.getElementById('modal-product-form').classList.remove('hidden');
    },

    openEditProductModal(id) {
      const p = State.products.find(item => item.id === id);
      if (!p) return;

      Sound.beep();
      document.getElementById('modal-product-title').textContent = 'Edit Menu';
      document.getElementById('prod-id').value = p.id;
      document.getElementById('prod-name').value = p.name;
      document.getElementById('prod-barcode').value = p.barcode;
      document.getElementById('prod-category').value = p.category;
      document.getElementById('prod-cost').value = p.cost;
      document.getElementById('prod-price').value = p.price;
      document.getElementById('prod-stock').value = p.stock;
      document.getElementById('prod-min-stock').value = p.minStock;
      document.getElementById('prod-image-url').value = p.image || '';

      const previewWrap = document.getElementById('prod-image-preview');
      previewWrap.innerHTML = `<img src="${p.image}" alt="${p.name}">`;

      document.getElementById('modal-product-form').classList.remove('hidden');
    },

    closeProductModal() {
      Sound.beep();
      const modal = document.getElementById('modal-product-form');
      if (modal) modal.classList.add('hidden');
    },

    saveProductForm() {
      const id = document.getElementById('prod-id').value;
      const name = document.getElementById('prod-name').value.trim();
      const barcode = document.getElementById('prod-barcode').value.trim();
      const category = document.getElementById('prod-category').value;
      const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
      const price = parseFloat(document.getElementById('prod-price').value) || 0;
      const stock = parseInt(document.getElementById('prod-stock').value, 10) || 0;
      const minStock = parseInt(document.getElementById('prod-min-stock').value, 10) || 0;

      let image = document.getElementById('prod-image-url').value.trim();
      const previewImg = document.querySelector('#prod-image-preview img');
      if (previewImg && previewImg.src && !image) {
        image = previewImg.src;
      }
      if (!image) {
        image = category === 'Minuman'
          ? 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80';
      }

      if (id) {
        const p = State.products.find(item => item.id === id);
        if (p) {
          const oldStock = p.stock;
          p.name = name;
          p.barcode = barcode;
          p.category = category;
          p.cost = cost;
          p.price = price;
          p.stock = stock;
          p.minStock = minStock;
          p.image = image;

          if (oldStock !== stock) {
            State.stockLogs.push({
              id: 'log-' + Date.now(),
              timestamp: new Date().toISOString(),
              productId: p.id,
              productName: p.name,
              barcode: p.barcode,
              type: stock > oldStock ? 'IN' : 'OUT',
              qty: stock - oldStock,
              finalStock: stock,
              notes: 'Pembaruan menu',
              user: State.currentUser ? State.currentUser.name : 'Admin'
            });
            State.saveStockLogs();
          }
          showToast(`Menu "${p.name}" berhasil diperbarui!`, 'success');
        }
      } else {
        const newProduct = {
          id: 'prod-' + Date.now(),
          barcode,
          name,
          category,
          cost,
          price,
          stock,
          minStock,
          image
        };
        State.products.push(newProduct);
        State.stockLogs.push({
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          productId: newProduct.id,
          productName: newProduct.name,
          barcode: newProduct.barcode,
          type: 'IN',
          qty: stock,
          finalStock: stock,
          notes: 'Menu baru didaftarkan',
          user: State.currentUser ? State.currentUser.name : 'Admin'
        });
        State.saveStockLogs();
        showToast(`Menu "${newProduct.name}" berhasil ditambahkan!`, 'success');
      }

      State.saveProducts();
      this.closeProductModal();
      this.renderCategories();
      this.renderPosProducts();
      this.renderProductsTable();
      this.renderStockView();
      this.updateStockAlerts();
    },

    deleteProduct(id) {
      const p = State.products.find(item => item.id === id);
      if (!p) return;

      if (confirm(`Yakin ingin menghapus menu "${p.name}"?`)) {
        State.products = State.products.filter(item => item.id !== id);
        State.saveProducts();
        showToast(`Menu "${p.name}" telah dihapus.`, 'info');
        this.renderCategories();
        this.renderPosProducts();
        this.renderProductsTable();
        this.renderStockView();
        this.updateStockAlerts();
      }
    },

    // --- STOCK ADJUSTMENT MODAL ---
    openAdjustStockModal(productId, defaultType = 'IN') {
      Sound.beep();
      const select = document.getElementById('adjust-product-select');
      if (select) {
        select.innerHTML = '';
        State.products.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.name} (Stok: ${p.stock} porsi)`;
          if (p.id === productId) opt.selected = true;
          select.appendChild(opt);
        });
      }

      const adjType = document.getElementById('adjust-type');
      if (adjType) adjType.value = defaultType;
      const adjQty = document.getElementById('adjust-qty');
      if (adjQty) adjQty.value = '10';
      const adjNotes = document.getElementById('adjust-notes');
      if (adjNotes) adjNotes.value = defaultType === 'IN' ? 'Restock bahan baru' : 'Bahan basi / rusak';

      const modal = document.getElementById('modal-stock-adjust');
      if (modal) modal.classList.remove('hidden');
    },

    closeStockAdjustModal() {
      Sound.beep();
      const modal = document.getElementById('modal-stock-adjust');
      if (modal) modal.classList.add('hidden');
    },

    saveStockAdjustment() {
      const prodId = document.getElementById('adjust-product-select').value;
      const type = document.getElementById('adjust-type').value;
      const qtyVal = parseInt(document.getElementById('adjust-qty').value, 10) || 0;
      const notes = document.getElementById('adjust-notes').value.trim();

      const p = State.products.find(item => item.id === prodId);
      if (!p) return;

      let delta = qtyVal;
      if (type === 'OUT') {
        delta = -Math.abs(qtyVal);
        if (p.stock + delta < 0) {
          showToast('Kuantitas melebihi stok yang tersedia!', 'error');
          return;
        }
      } else if (type === 'CORRECTION') {
        delta = qtyVal - p.stock;
      }

      p.stock = Math.max(0, p.stock + delta);
      State.saveProducts();

      State.stockLogs.push({
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        productId: p.id,
        productName: p.name,
        barcode: p.barcode,
        type: type,
        qty: delta,
        finalStock: p.stock,
        notes: notes || 'Penyesuaian stok porsi',
        user: State.currentUser ? State.currentUser.name : 'Petugas'
      });
      State.saveStockLogs();

      this.closeStockAdjustModal();
      this.renderPosProducts();
      this.renderProductsTable();
      this.renderStockView();
      this.updateStockAlerts();
      Sound.success();
      showToast(`Porsi "${p.name}" diperbarui menjadi ${p.stock} porsi!`, 'success');
    },

    filterLowStockInStockView() {
      this.switchView('stock');
    },

    backupDataJson() {
      const backupObj = {
        version: '3.0',
        store: 'Style Coffe & Style Food',
        exportedAt: new Date().toISOString(),
        settings: State.settings,
        products: State.products,
        transactions: State.transactions,
        stockLogs: State.stockLogs,
        registeredUsers: State.registeredUsers
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Style_Coffe_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Cadangan data berhasil diunduh.', 'success');
    },

    exportTransactionsToCsv() {
      if (State.transactions.length === 0) {
        showToast('Tidak ada data transaksi untuk diekspor.', 'warning');
        return;
      }

      const headers = ['No. Nota', 'Waktu', 'Tipe Pesanan', 'Meja / Pelanggan', 'Kasir', 'Metode Pembayaran', 'Pesanan Menu', 'Subtotal', 'Diskon', 'PPN', 'Ongkir', 'Total Bayar', 'Uang Diterima', 'Kembalian'];
      const rows = State.transactions.map(t => {
        const itemSummaries = t.items.map(i => `${i.name} (${i.qty}x)`).join('; ');
        return [
          `"${t.invoiceNo}"`,
          `"${formatDate(t.timestamp)}"`,
          `"${t.orderTypeLabel || 'Dine In'}"`,
          `"${t.customer || '-'}"`,
          `"${t.cashier}"`,
          `"${t.paymentMethod}"`,
          `"${itemSummaries}"`,
          t.subtotal,
          t.discount,
          t.tax,
          t.deliveryFee || 0,
          t.grandTotal,
          t.paidAmount,
          t.change
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Style_Coffe_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast('Laporan transaksi berhasil diekspor ke Excel (CSV)!', 'success');
    }
  };

  // --- POS TRANSACTION CONTROLLER ---
  const POS = {
    currentPaymentMethod: 'tunai',
    currentGrandTotal: 0,

    scanBarcode(barcode) {
      const product = State.products.find(p => p.barcode === barcode);
      if (product) {
        if (product.stock <= 0) {
          Sound.error();
          showToast(`Menu "${product.name}" habis!`, 'error');
        } else {
          this.addToCart(product.id);
          Sound.beep();
          showToast(`Pesanan masuk: ${product.name}`, 'info');
        }
      } else {
        Sound.error();
        showToast(`Kode [${barcode}] tidak terdaftar di daftar menu!`, 'error');
      }
    },

    addToCart(productId) {
      const product = State.products.find(p => p.id === productId);
      if (!product) return;

      const existing = State.cart.find(item => item.id === productId);
      if (existing) {
        if (existing.qty + 1 > product.stock) {
          Sound.error();
          showToast(`Porsi tidak mencukupi! Hanya tersisa ${product.stock} porsi.`, 'warning');
          return;
        }
        existing.qty += 1;
      } else {
        if (product.stock < 1) {
          Sound.error();
          showToast(`Porsi menu habis!`, 'error');
          return;
        }
        State.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          cost: product.cost,
          qty: 1,
          maxStock: product.stock,
          barcode: product.barcode
        });
      }

      Sound.beep();
      UI.updateCartUI();
    },

    updateQty(productId, newQty) {
      const item = State.cart.find(i => i.id === productId);
      if (!item) return;

      const product = State.products.find(p => p.id === productId);
      const max = product ? product.stock : item.maxStock;

      if (newQty <= 0) {
        this.removeFromCart(productId);
        return;
      }

      if (newQty > max) {
        Sound.error();
        showToast(`Porsi maksimal tersedia adalah ${max} porsi.`, 'warning');
        item.qty = max;
      } else {
        item.qty = newQty;
      }

      UI.updateCartUI();
    },

    removeFromCart(productId) {
      State.cart = State.cart.filter(i => i.id !== productId);
      UI.updateCartUI();
    },

    clearCart() {
      State.cart = [];
      const discVal = document.getElementById('cart-discount-value');
      if (discVal) discVal.value = 0;
      const custInp = document.getElementById('cart-customer-name');
      if (custInp) custInp.value = '';
      const delInp = document.getElementById('cart-delivery-fee');
      if (delInp) delInp.value = 0;
      State.deliveryFee = 0;
      document.querySelectorAll('#quick-table-chips .table-chip').forEach(c => c.classList.remove('active'));
      UI.updateCartUI();
    },

    openPaymentModal() {
      if (State.cart.length === 0) return;
      Sound.beep();

      const posCartPanel = document.getElementById('pos-cart-panel');
      if (posCartPanel) posCartPanel.classList.remove('mobile-active');

      const totals = UI.calculateCartTotals();
      this.currentGrandTotal = totals.grandTotal;

      const now = new Date();
      const invNo = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(State.transactions.length + 1).padStart(4, '0')}`;

      const invNoEl = document.getElementById('payment-modal-invoice-no');
      if (invNoEl) invNoEl.textContent = `No. Nota: ${invNo}`;

      const badgeOrderType = document.getElementById('payment-order-type-badge');
      if (badgeOrderType) {
        const icons = { dine_in: '🍽️ Dine In', take_away: '🛍️ Take Away', delivery: '🛵 Delivery' };
        const cust = (document.getElementById('cart-customer-name')?.value || '').trim();
        badgeOrderType.className = `badge-tag badge-${State.orderType}`;
        badgeOrderType.textContent = cust ? `${icons[State.orderType]} • ${cust}` : icons[State.orderType];
      }

      const dispTotalEl = document.getElementById('payment-display-total');
      if (dispTotalEl) dispTotalEl.textContent = formatRupiah(totals.grandTotal);

      const cashInp = document.getElementById('payment-cash-input');
      if (cashInp) cashInp.value = totals.grandTotal;
      this.currentPaymentMethod = 'tunai';

      document.querySelectorAll('.payment-method-selector-3 .method-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.method-content').forEach(c => c.classList.remove('active'));
      const tunaiTab = document.querySelector('.payment-method-selector-3 .method-tab[data-method="tunai"]');
      if (tunaiTab) tunaiTab.classList.add('active');
      const tunaiContent = document.getElementById('method-content-tunai');
      if (tunaiContent) tunaiContent.classList.add('active');

      this.updatePaymentAmounts();
      const payModal = document.getElementById('modal-payment');
      if (payModal) payModal.classList.remove('hidden');

      setTimeout(() => {
        if (cashInp) {
          cashInp.focus();
          cashInp.select();
        }
      }, 100);
    },

    closePaymentModal() {
      Sound.beep();
      const payModal = document.getElementById('modal-payment');
      if (payModal) payModal.classList.add('hidden');
    },

    updatePaymentAmounts() {
      const grandTotal = this.currentGrandTotal || 0;
      const changeEl = document.getElementById('payment-display-change');
      const changeCard = document.getElementById('change-card');

      if (!changeEl || !changeCard) return;

      if (this.currentPaymentMethod === 'tunai') {
        const cashInput = parseFloat(document.getElementById('payment-cash-input')?.value) || 0;
        const change = cashInput - grandTotal;

        if (change >= 0) {
          changeEl.textContent = formatRupiah(change);
          changeEl.style.color = 'var(--color-success)';
          changeCard.style.background = 'var(--color-success-light)';
        } else {
          changeEl.textContent = `Kurang ${formatRupiah(Math.abs(change))}`;
          changeEl.style.color = 'var(--color-danger)';
          changeCard.style.background = 'var(--color-danger-light)';
        }
      } else {
        changeEl.textContent = 'Rp 0 (Non-Tunai / Pas)';
        changeEl.style.color = 'var(--color-primary)';
        changeCard.style.background = 'var(--bg-subtle)';
      }
    },

    finalizeTransaction() {
      const totals = UI.calculateCartTotals();
      const grandTotal = totals.grandTotal;
      let paidAmount = grandTotal;
      let change = 0;

      if (this.currentPaymentMethod === 'tunai') {
        paidAmount = parseFloat(document.getElementById('payment-cash-input')?.value) || 0;
        if (paidAmount < grandTotal) {
          Sound.error();
          showToast(`Jumlah uang tunai kurang ${formatRupiah(grandTotal - paidAmount)}!`, 'error');
          return;
        }
        change = paidAmount - grandTotal;
      }

      const now = new Date();
      const invNo = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(State.transactions.length + 1).padStart(4, '0')}`;

      const orderType = State.orderType || 'dine_in';
      const custRaw = (document.getElementById('cart-customer-name')?.value || '').trim();
      const defaultTarget = orderType === 'take_away' ? 'Bungkus' : (orderType === 'delivery' ? 'Pesan Antar' : 'Meja 01');
      const orderTypeLabels = { dine_in: 'Dine In', take_away: 'Take Away', delivery: 'Delivery' };

      const transaction = {
        id: invNo,
        invoiceNo: invNo,
        timestamp: now.toISOString(),
        cashier: State.currentUser ? State.currentUser.name : 'Kasir Style Coffe',
        orderType: orderType,
        orderTypeLabel: orderTypeLabels[orderType] || 'Dine In',
        customer: custRaw || defaultTarget,
        deliveryFee: totals.deliveryFee || 0,
        items: State.cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          cost: item.cost,
          qty: item.qty,
          barcode: item.barcode,
          subtotal: item.price * item.qty
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        grandTotal: grandTotal,
        paymentMethod: this.currentPaymentMethod === 'transfer' ? 'TRANSFER BANK' : this.currentPaymentMethod.toUpperCase(),
        paidAmount: paidAmount,
        change: change
      };

      // Deduct Stock
      transaction.items.forEach(cartItem => {
        const prod = State.products.find(p => p.id === cartItem.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - cartItem.qty);
          State.stockLogs.push({
            id: 'log-' + Date.now() + Math.random(),
            timestamp: now.toISOString(),
            productId: prod.id,
            productName: prod.name,
            barcode: prod.barcode,
            type: 'PENJUALAN',
            qty: -cartItem.qty,
            finalStock: prod.stock,
            notes: `Nota ${invNo}`,
            user: transaction.cashier
          });
        }
      });

      State.transactions.push(transaction);
      State.saveTransactions();
      State.saveProducts();
      State.saveStockLogs();

      Sound.success();
      showToast(`Pesanan ${invNo} berhasil diselesaikan!`, 'success');

      this.closePaymentModal();
      this.clearCart();

      UI.renderPosProducts();
      UI.renderProductsTable();
      UI.renderStockView();
      UI.updateStockAlerts();
      UI.renderReportsView();

      this.renderReceipt(transaction);
      const recModal = document.getElementById('modal-receipt');
      if (recModal) recModal.classList.remove('hidden');
    },

    renderReceipt(trx) {
      const s = State.settings;
      const paper = document.getElementById('thermal-receipt-paper');
      if (paper) paper.className = `thermal-receipt-paper width-${s.printerWidth || '58mm'}`;

      const sName = document.getElementById('receipt-store-name');
      if (sName) sName.textContent = s.storeName.toUpperCase();
      const sSlogan = document.getElementById('receipt-store-slogan');
      if (sSlogan) sSlogan.textContent = s.storeSlogan;
      const sAddr = document.getElementById('receipt-store-address');
      if (sAddr) sAddr.textContent = s.storeAddress;
      const sPhone = document.getElementById('receipt-store-phone');
      if (sPhone) sPhone.textContent = `Telp: ${s.storePhone}`;

      const invNoEl = document.getElementById('receipt-inv-no');
      if (invNoEl) invNoEl.textContent = trx.invoiceNo;
      const dtEl = document.getElementById('receipt-datetime');
      if (dtEl) dtEl.textContent = formatDate(trx.timestamp);
      const cashierEl = document.getElementById('receipt-cashier');
      if (cashierEl) cashierEl.textContent = trx.cashier;
      const methEl = document.getElementById('receipt-method');
      if (methEl) methEl.textContent = trx.paymentMethod;

      const itemsList = document.getElementById('receipt-items-list');
      if (itemsList) {
        itemsList.innerHTML = '';
        trx.items.forEach(item => {
          const itemRow = document.createElement('div');
          itemRow.className = 'receipt-item-row';
          itemRow.innerHTML = `
            <div class="item-line">
              <span class="col-item">${item.name}</span>
              <span class="col-qty">${item.qty}</span>
              <span class="col-price">${(item.price).toLocaleString('id-ID')}</span>
              <span class="col-total">${(item.subtotal).toLocaleString('id-ID')}</span>
            </div>
          `;
          itemsList.appendChild(itemRow);
        });
      }

      const recSub = document.getElementById('receipt-subtotal');
      if (recSub) recSub.textContent = formatRupiah(trx.subtotal);

      const discLine = document.getElementById('receipt-discount-line');
      const recDisc = document.getElementById('receipt-discount');
      if (discLine && recDisc) {
        if (trx.discount > 0) {
          discLine.style.display = 'flex';
          recDisc.textContent = `-${formatRupiah(trx.discount)}`;
        } else {
          discLine.style.display = 'none';
        }
      }

      const taxLine = document.getElementById('receipt-tax-line');
      const recTax = document.getElementById('receipt-tax');
      if (taxLine && recTax) {
        if (trx.tax > 0) {
          taxLine.style.display = 'flex';
          recTax.textContent = formatRupiah(trx.tax);
        } else {
          taxLine.style.display = 'none';
        }
      }

      const recGrand = document.getElementById('receipt-grand-total');
      if (recGrand) recGrand.textContent = formatRupiah(trx.grandTotal);
      const recPaid = document.getElementById('receipt-paid');
      if (recPaid) recPaid.textContent = formatRupiah(trx.paidAmount);
      const recChange = document.getElementById('receipt-change');
      if (recChange) recChange.textContent = formatRupiah(trx.change);

      const footerText = document.getElementById('receipt-footer-text');
      if (footerText) footerText.innerHTML = (s.receiptFooter || '').replace(/\n/g, '<br>');

      // Order Type & Table/Customer
      const orderTypeTableEl = document.getElementById('receipt-order-type-table');
      if (orderTypeTableEl) {
        const icon = trx.orderType === 'take_away' ? '🛍️ TAKE AWAY' : (trx.orderType === 'delivery' ? '🛵 DELIVERY' : '🍽️ DINE IN');
        orderTypeTableEl.textContent = `${icon} (${trx.customer || '-'})`;
      }

      // Delivery line on receipt
      const delLine = document.getElementById('receipt-delivery-line');
      const recDel = document.getElementById('receipt-delivery');
      if (delLine && recDel) {
        if (trx.deliveryFee > 0) {
          delLine.style.display = 'flex';
          recDel.textContent = formatRupiah(trx.deliveryFee);
        } else {
          delLine.style.display = 'none';
        }
      }

      // Kitchen Ticket Slip
      const kitType = document.getElementById('kitchen-order-type');
      if (kitType) {
        const typeLabel = trx.orderType === 'take_away' ? 'TAKE AWAY' : (trx.orderType === 'delivery' ? 'DELIVERY' : 'DINE IN');
        kitType.textContent = typeLabel;
        kitType.className = `badge-kitchen-type badge-${trx.orderType || 'dine_in'}`;
      }
      const kitTarget = document.getElementById('kitchen-order-target');
      if (kitTarget) {
        kitTarget.textContent = (trx.customer || (trx.orderType === 'take_away' ? 'BUNGKUS' : (trx.orderType === 'delivery' ? 'DELIVERY' : 'MEJA 01'))).toUpperCase();
      }
      const kitInv = document.getElementById('kitchen-inv-no');
      if (kitInv) kitInv.textContent = trx.invoiceNo;
      const kitDt = document.getElementById('kitchen-datetime');
      if (kitDt) kitDt.textContent = formatDate(trx.timestamp);
      const kitCashier = document.getElementById('kitchen-cashier');
      if (kitCashier) kitCashier.textContent = trx.cashier;

      const kitItemsList = document.getElementById('kitchen-items-list');
      if (kitItemsList) {
        kitItemsList.innerHTML = '';
        trx.items.forEach(item => {
          const kRow = document.createElement('div');
          kRow.className = 'kitchen-item-row';
          kRow.innerHTML = `
            <div class="kitchen-item-main">
              <span class="kitchen-item-qty">[ ${item.qty}x ]</span>
              <span class="kitchen-item-name">${item.name}</span>
            </div>
          `;
          kitItemsList.appendChild(kRow);
        });
      }

      renderBarcodeSvg(document.getElementById('receipt-barcode-svg'), trx.invoiceNo.replace(/[^0-9]/g, ''));
    },

    closeReceiptModal() {
      Sound.beep();
      const recModal = document.getElementById('modal-receipt');
      if (recModal) recModal.classList.add('hidden');
    }
  };

  // Expose methods for inline onclick events
  window.KasirApp = {
    openEditProductModal: (id) => UI.openEditProductModal(id),
    deleteProduct: (id) => UI.deleteProduct(id),
    openAdjustStockModal: (id, type) => UI.openAdjustStockModal(id, type),
    filterLowStockInStockView: () => UI.filterLowStockInStockView(),
    restoreHeldOrder: (id) => UI.restoreHeldOrder(id),
    deleteHeldOrder: (id) => UI.deleteHeldOrder(id),
    viewReceiptModal: (id) => {
      const trx = State.transactions.find(t => t.id === id);
      if (trx) {
        POS.renderReceipt(trx);
        const recModal = document.getElementById('modal-receipt');
        if (recModal) recModal.classList.remove('hidden');
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    State.init();
    UI.init();
  });

})();
