/* reset-password.js */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const formReset       = document.getElementById('form-reset-password');
  const btnUpdate       = document.getElementById('btn-update-password');
  const newPwdInput     = document.getElementById('new-password');
  const confirmPwdInput = document.getElementById('confirm-password');

  // Supabase password-recovery links contain: ?token_hash=xxx&type=recovery
  // OR ?access_token=xxx&refresh_token=xxx (older PKCE flow)
  const urlParams    = new URLSearchParams(window.location.search);
  const tokenHash    = urlParams.get('token_hash');          // ← correct param
  const type         = urlParams.get('type') || 'recovery';
  const accessToken  = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');

  const hasValidToken = tokenHash || (accessToken && refreshToken);

  if (!hasValidToken) {
    if (window.App && window.App.UI) window.App.UI.showError('Invalid or expired password reset link. Please request a new one.');
    if (btnUpdate) btnUpdate.disabled = true;  // ← null-safe
    return;
  }

  if (formReset) {                              // ← null-safe
    formReset.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPassword     = newPwdInput.value;
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
        // Build the payload the backend expects:
        // resetPassword in auth.controller.js reads: { password, token_hash, type }
        // OR { password, access_token, refresh_token }
        const payload = tokenHash
          ? { password: newPassword, token_hash: tokenHash, type }
          : { password: newPassword, access_token: accessToken, refresh_token: refreshToken };

        const { error } = await window.apiService.auth.resetPassword(payload);  // ← correct

        if (error) {
          if (window.App && window.App.UI) window.App.UI.showError(error);
          btnUpdate.innerText = originalText;
          btnUpdate.disabled = false;
        } else {
          if (window.App && window.App.UI) window.App.UI.showSuccess('Password updated successfully!');
          localStorage.removeItem('mokshita_token');
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }
      } catch (err) {
        console.error(err);
        if (window.App && window.App.UI) window.App.UI.showError('An unexpected error occurred.');
        btnUpdate.innerText = originalText;
        btnUpdate.disabled = false;
      }
    });
  }
});
