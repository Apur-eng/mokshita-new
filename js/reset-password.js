/* reset-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const formReset = document.getElementById('form-reset-password');
  const btnUpdate = document.getElementById('btn-update-password');
  const newPwdInput = document.getElementById('new-password');
  const confirmPwdInput = document.getElementById('confirm-password');

  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    if (window.App && window.App.UI) window.App.UI.showError('Invalid or expired password reset link. Please request a new one.');
    btnUpdate.disabled = true;
    return;
  }

  formReset.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = newPwdInput.value;
    const confirmPassword = confirmPwdInput.value;

    if (newPassword.length < 8) {
      if (window.App && window.App.UI) window.App.UI.showError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (window.App && window.App.UI) window.App.UI.showError('Passwords do not match.');
      return;
    }

    const originalText = btnUpdate.innerText;
    btnUpdate.innerText = 'Updating...';
    btnUpdate.disabled = true;

    try {
      const { error } = await window.apiService.auth.resetPassword(token, newPassword);

      if (error) {
        if (window.App && window.App.UI) window.App.UI.showError(error);
        btnUpdate.innerText = originalText;
        btnUpdate.disabled = false;
      } else {
        if (window.App && window.App.UI) window.App.UI.showSuccess('Password updated successfully!');
        
        // Log out user just in case
        localStorage.removeItem('mokshita_token');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (window.App && window.App.UI) window.App.UI.showError('An unexpected error occurred.');
      btnUpdate.innerText = originalText;
      btnUpdate.disabled = false;
    }
  });
});
