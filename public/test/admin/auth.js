document.addEventListener('DOMContentLoaded', function() {
    // Check if we're already logged in
    const adminSession = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (adminSession && adminSession.expiry > Date.now()) {
        // If we're on login page but already logged in, redirect to dashboard
        if (window.location.href.includes('login.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    } else {
        // If we're not on login page and not logged in, redirect to login page
        if (!window.location.href.includes('login.html') && 
            !window.location.href.includes('index.html')) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Admin credentials (in a real app, these would be stored securely on a server)
    const adminCredentials = [
        { 
            username: 'Arpit Chauhan', 
            password: 'Admin@Arpit@2025', 
            accessLevel: 'full'
        },
        { 
            username: 'Anurag Saini', 
            password: 'Admin@Anurag@2025', 
            accessLevel: 'full'
        },
        { 
            username: 'Guest Admin', 
            password: 'Admin@Guest@2025', 
            accessLevel: 'read'
        }
    ];

    // Login form submission handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Find the matching user
            const user = adminCredentials.find(
                user => user.username === username && user.password === password
            );
            
            if (user) {
                // Create a session (expire after 2 hours)
                const session = {
                    username: user.username,
                    accessLevel: user.accessLevel,
                    expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours in milliseconds
                };
                
                localStorage.setItem('adminSession', JSON.stringify(session));
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('login-error').textContent = 'Invalid username or password.';
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminSession');
            window.location.href = 'login.html';
        });
    }

    // Check permissions for the current user
    function checkPermissions() {
        const adminSession = JSON.parse(localStorage.getItem('adminSession') || 'null');
        
        if (!adminSession) return false;
        if (adminSession.accessLevel === 'full') return true;
        
        // If user is a guest, show alert and return false
        if (adminSession.accessLevel === 'read') {
            alert('You are logged in as a Guest Admin. You can view settings but cannot make changes. Only Arpit Chauhan and Anurag Saini have full edit permissions.');
            return false;
        }
        
        return false;
    }

    // Make checkPermissions available globally
    window.checkPermissions = checkPermissions;
});