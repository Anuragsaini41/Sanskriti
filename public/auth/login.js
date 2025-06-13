document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json(); // 👈 parse as JSON

        if (response.ok) {
            alert(result.message);
            localStorage.setItem('username', result.username); // ✅ store username
            window.location.href = '../index.html';
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
    }
});
