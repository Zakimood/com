// Dashboard functionality
class DashboardManager {
    constructor() {
        this.initializeEventListeners();
        this.loadUserData();
    }

    initializeEventListeners() {
        // Profile dropdown
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', this.toggleProfileDropdown);
        }

        // Notification button
        const notifBtn = document.querySelector('.notification-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', this.showNotifications);
        }

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', this.handleQuickAction.bind(this));
        });

        // Logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }

        // Close dropdown when clicking outside
        window.addEventListener('click', this.closeDropdownOnClickOutside);
    }

    toggleProfileDropdown(e) {
        e.stopPropagation();
        const dropdown = document.querySelector('.dropdown-content');
        dropdown.classList.toggle('show');
    }

    showNotifications() {
        // Demo notification
        this.showMessage('No new notifications', 'info');
    }

    handleQuickAction(e) {
        const action = e.currentTarget.querySelector('span:last-child').textContent;
        this.showMessage(`${action} feature - Demo version`, 'info');
    }

    handleLogout(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    }

    closeDropdownOnClickOutside(e) {
        if (!e.target.matches('.profile-btn') && !e.target.matches('.profile-btn *')) {
            const dropdowns = document.getElementsByClassName('dropdown-content');
            for (let dropdown of dropdowns) {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        }
    }

    loadUserData() {
        // Simulate loading user data
        this.showMessage('Dashboard loaded successfully', 'success');
    }

    showMessage(message, type) {
        // Create and show toast message
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    updateBalances() {
        // Demo: Simulate real-time balance updates
        const balances = document.querySelectorAll('.card-value');
        balances.forEach(balance => {
            // Just for demo - don't actually change values
            balance.style.transition = 'color 0.3s ease';
            balance.style.color = '#10B981';
            setTimeout(() => {
                balance.style.color = '';
            }, 500);
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-container')) {
        new DashboardManager();
    }
});