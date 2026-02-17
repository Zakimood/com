// Admin panel functionality
class AdminManager {
    constructor() {
        this.initializeEventListeners();
        this.loadDashboardStats();
    }

    initializeEventListeners() {
        // Approval buttons
        document.querySelectorAll('.approval-actions button').forEach(btn => {
            btn.addEventListener('click', this.handleApproval.bind(this));
        });

        // User action buttons
        document.querySelectorAll('.admin-table .btn-icon').forEach(btn => {
            btn.addEventListener('click', this.showUserActions.bind(this));
        });

        // Navigation
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
    }

    handleApproval(e) {
        const action = e.target.textContent;
        const card = e.target.closest('.approval-card');
        
        if (action === 'Approve' || action === 'Reject') {
            this.showConfirmationDialog(
                `${action} this request?`,
                () => {
                    card.style.opacity = '0.5';
                    setTimeout(() => {
                        card.remove();
                        this.showMessage(`${action} successful!`, 'success');
                        this.updateDashboardStats();
                    }, 500);
                }
            );
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        
        // Update active state
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.remove('active');
        });
        e.target.closest('li').classList.add('active');
        
        // Show corresponding section
        if (targetId && targetId !== '#') {
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = 'none';
            });
            document.querySelector(targetId).style.display = 'block';
        }
    }

    showUserActions(e) {
        const btn = e.target;
        const row = btn.closest('tr');
        const userId = row.querySelector('td:first-child').textContent;
        
        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'user-actions-menu';
        menu.innerHTML = `
            <a href="#" onclick="adminManager.viewUserDetails('${userId}')">View Details</a>
            <a href="#" onclick="adminManager.editUser('${userId}')">Edit User</a>
            <a href="#" onclick="adminManager.suspendUser('${userId}')">Suspend User</a>
            <a href="#" onclick="adminManager.deleteUser('${userId}')">Delete User</a>
        `;
        
        // Position menu near button
        const rect = btn.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
        
        // Remove existing menus
        document.querySelectorAll('.user-actions-menu').forEach(m => m.remove());
        
        // Add new menu
        document.body.appendChild(menu);
        
        // Close on click outside
        setTimeout(() => {
            window.addEventListener('click', function closeMenu() {
                menu.remove();
                window.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    loadDashboardStats() {
        // Simulate loading stats
        setTimeout(() => {
            document.querySelectorAll('.admin-stats .stat-value').forEach(stat => {
                stat.classList.remove('loading');
            });
        }, 1000);
    }

    updateDashboardStats() {
        // Update stats after approval
        const pendingCount = document.querySelectorAll('.approval-card').length;
        const pendingStat = document.querySelector('.admin-stats .stat:nth-child(2) .stat-value');
        if (pendingStat) {
            pendingStat.textContent = pendingCount;
        }
    }

    showConfirmationDialog(message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.style.display = 'flex';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>Confirm Action</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" id="confirmBtn">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('confirmBtn').addEventListener('click', () => {
            onConfirm();
            dialog.remove();
        });
    }

    showMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `message ${type}`;
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '3000';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // User management methods (demo)
    viewUserDetails(userId) {
        this.showMessage(`Viewing details for ${userId}`, 'info');
    }

    editUser(userId) {
        this.showMessage(`Editing user ${userId}`, 'info');
    }

    suspendUser(userId) {
        this.showConfirmationDialog(
            `Suspend user ${userId}?`,
            () => {
                this.showMessage(`User ${userId} suspended`, 'success');
            }
        );
    }

    deleteUser(userId) {
        this.showConfirmationDialog(
            `Delete user ${userId}? This action cannot be undone.`,
            () => {
                this.showMessage(`User ${userId} deleted`, 'success');
            }
        );
    }
}

// Initialize admin panel
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-sidebar')) {
        adminManager = new AdminManager();
    }
});