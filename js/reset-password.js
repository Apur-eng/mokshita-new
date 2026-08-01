/* reset-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const formReset = document.getElementById('form-reset-password');
  const btnUpdate = document.getElementById('btn-update-password');
  const newPwdInput = document.getElementById('new-password');
  const confirmPwdInput = document.getElementById('confirm-password');

  // Extract Supabase tokens from URL (can be in hash or search params)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);
  
  const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
  const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
  const type = hashParams.get('type') || queryParams.get('type') || 'recovery';

  let recoveryPayload = null;
  if (accessToken && refreshToken) {
    recoveryPayload = { access_token: accessToken, refresh_token: refreshToken, type };
  } else if (tokenHash) {
    recoveryPayload = { token_hash: tokenHash, type };
  }

  if (!recoveryPayload) {
    if (window.App && window.App.UI) window.App.UI.showError('Invalid or expired password reset link. Please request a new one.');
    btnUpdate.disabled = true;
    return;
  }

  // Clear hash from URL for security (don't leave tokens in browser history)
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, window.location.pathname);
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
      recoveryPayload.password = newPassword;
      const { error } = await window.apiService.auth.resetPassword(recoveryPayload);

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
