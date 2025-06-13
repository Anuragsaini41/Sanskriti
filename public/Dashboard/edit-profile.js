document.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  if (!username) {
    alert('Please log in to edit your profile.');
    window.location.href = '../auth/login.html';
    return;
  }

  try {
    // Fetch user details and populate the form
    const response = await fetch(`/user/${username}`);
    if (response.ok) {
      const user = await response.json();
      document.getElementById('fullName').value = user.fullName;
      document.getElementById('email').value = user.email;
      document.getElementById('phone').value = user.phone || '';
      document.getElementById('city').value = user.city || '';
      document.getElementById('state').value = user.state || '';
      document.getElementById('country').value = user.country || '';
    } else {
      alert('Failed to fetch user details');
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
  }
});

document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = localStorage.getItem('username');
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const country = document.getElementById('country').value.trim();

  try {
    const response = await fetch('/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, email, phone, city, state, country })
    });

    if (response.ok) {
      alert('Profile updated successfully');
      window.location.href = './dashboard.html';
    } else {
      const errorMessage = await response.text();
      document.getElementById('errorMessage').textContent = errorMessage;
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    document.getElementById('errorMessage').textContent = 'Error updating profile';
  }
});