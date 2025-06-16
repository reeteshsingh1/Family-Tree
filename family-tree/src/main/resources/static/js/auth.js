// Function to handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = '/index.html';
        } else {
            const error = await response.json();
            showError(error.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred during login');
    }
}

// Function to handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8081/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            showSuccess('Registration successful! Please login.');
            closeRegisterModal();
        } else {
            const error = await response.json();
            showError(error.message || 'Registration failed');
        }
    } catch (error) {
        showError('An error occurred during registration');
    }
}

// Function to show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Function to show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Function to open registration modal
function openRegisterModal() {
    document.getElementById('register-modal').style.display = 'block';
}

// Function to close registration modal
function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Register button
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', openRegisterModal);
    }
    
    // Close register modal button
    const closeRegisterBtn = document.getElementById('close-register-modal');
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', closeRegisterModal);
    }
}); 