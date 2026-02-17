// API Service
const API = {
    baseUrl: '', // Empty for same origin
    
    async request(endpoint, options = {}) {
        const response = await fetch(this.baseUrl + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include' // Important for sessions
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    },
    
    // Auth endpoints
    async login(credentials) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    async register(userData) {
        return this.request('/api/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    async logout() {
        return this.request('/api/logout', {
            method: 'POST'
        });
    },
    
    // User endpoints
    async getProfile() {
        return this.request('/api/user/profile');
    },
    
    async updateProfile(data) {
        return this.request('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async changePassword(data) {
        return this.request('/api/user/password', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // Account endpoints
    async getAccountSummary() {
        return this.request('/api/accounts/summary');
    },
    
    async getTransactions(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/api/transactions?${params}`);
    },
    
    async makeTransfer(data) {
        return this.request('/api/transfer', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// Message/Toast System
const MessageSystem = {
    container: null,
    
    init() {
        this.container = document.createElement('div');
        this.container.className = 'message-container';
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `message ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="close-toast">×</button>
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove
        const timeout = setTimeout(() => {
            toast.remove();
        }, duration);
        
        // Manual close
        toast.querySelector('.close-toast').addEventListener('click', () => {
            clearTimeout(timeout);
            toast.remove();
        });
    },
    
    success(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        this.show(message, 'error', duration);
    },
    
    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Form Validation
const Validator = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    phone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    },
    
    password(password) {
        return password.length >= 8;
    },
    
    passwordMatch(password, confirm) {
        return password === confirm;
    },
    
    amount(amount) {
        return !isNaN(amount) && amount > 0;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in (for protected pages)
    const protectedPages = ['dashboard.html', 'transfer.html', 'transactions.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        API.getProfile().catch(() => {
            window.location.href = '/login';
        });
    }
    
    // Mobile menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('open');
        });
    }
    
    // Password toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.closest('.password-input-wrapper').querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            e.target.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, MessageSystem, Validator };
}