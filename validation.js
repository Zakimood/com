// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    static validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return re.test(password);
    }

    static validateAccountNumber(accountNumber) {
        const re = /^\d{10,12}$/;
        return re.test(accountNumber);
    }

    static validateAmount(amount) {
        return !isNaN(amount) && amount > 0;
    }

    static sanitizeInput(input) {
        // Basic XSS prevention
        return input.replace(/[<>]/g, '');
    }

    static checkPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.match(/[a-z]+/)) score++;
        if (password.match(/[A-Z]+/)) score++;
        if (password.match(/[0-9]+/)) score++;
        if (password.match(/[$@#&!]+/)) score++;
        
        return {
            score,
            strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
        };
    }
}

// Form error handling
class FormError {
    static showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        element.classList.add('error');
        element.parentNode.appendChild(errorDiv);
    }

    static clearError(element) {
        element.classList.remove('error');
        const errorDiv = element.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormValidator, FormError };
}