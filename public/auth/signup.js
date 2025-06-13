let otpSent = false;

document.getElementById('errorMessage').style.display = 'none'; // Initially hide it

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  if (message && message.trim() !== '') {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
}

document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName') ? document.getElementById('fullName').value.trim() : '';
  const username = document.getElementById('username') ? document.getElementById('username').value.trim() : '';
  const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
  const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
  const dob = document.getElementById('dob') ? document.getElementById('dob').value.trim() : '';
  const gender = document.getElementById('gender') ? document.getElementById('gender').value : '';
  const country = document.getElementById('country') ? document.getElementById('country').value.trim() : '';
  const state = document.getElementById('state') ? document.getElementById('state').value.trim() : '';
  const city = document.getElementById('city') ? document.getElementById('city').value.trim() : '';
  const pincode = document.getElementById('pincode') ? document.getElementById('pincode').value.trim() : '';
  const password = document.getElementById('password') ? document.getElementById('password').value : '';
  const confirmPassword = document.getElementById('confirmPassword') ? document.getElementById('confirmPassword').value : '';
  const otp = document.getElementById('otp') ? document.getElementById('otp').value.trim() : '';

  showError("");

  // Check if passwords match
  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  if (!otpSent) {
    try {
      const response = await fetch('/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, phone, dob, gender, country, state, city, pincode, password })  // Send full data to backend
      });

      const result = await response.text();

      if (response.status === 200) {
        otpSent = true;
        document.getElementById('otp-section').style.display = 'block';
        document.getElementById('otp').required = true;
        alert("OTP sent to your email.");
      } else {
        showError(result);
      }
    } catch (err) {
      showError("Something went wrong while sending OTP.");
    }
  } else {
    try {
      const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.text();

      if (response.status === 200) {
        alert("Signup successful!");
        window.location.href = "./login.html";
      } else {
        showError(result);
      }
    } catch (err) {
      showError("Signup failed. Please try again.");
    }
  }
});
