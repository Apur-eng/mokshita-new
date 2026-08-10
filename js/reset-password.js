/* reset-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const formReset       = document.getElementById('form-reset-password');
  const btnUpdate       = document.getElementById('btn-update-password');
  const newPwdInput     = document.getElementById('new-password');
  const confirmPwdInput = document.getElementById('confirm-password');
  const msgEl           = document.getElementById('reset-message');

  // Supabase password-recovery links contain: ?token_hash=xxx&type=recovery
  // OR ?access_token=xxx&refresh_token=xxx&type=recovery (implicit / hash flow)
  const urlParams    = new URLSearchParams(window.location.search);
  const hashParams   = new URLSearchParams(window.location.hash.substring(1));

  const tokenHash    = urlParams.get('token_hash') || hashParams.get('token_hash');
  const type         = urlParams.get('type') || hashParams.get('type') || 'recovery';
  const accessToken  = urlParams.get('access_token') || hashParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');

  const hasValidToken = tokenHash || (accessToken && refreshToken);

  function showError(message) {
    if (window.App && window.App.UI) window.App.UI.showError(message);
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.className = 'auth-message error';
    }
    if (btnUpdate) btnUpdate.disabled = true;
  }

  // Handle ONLY type === "recovery"
  if (type !== 'recovery') {
    showError('Invalid link: link type must be recovery.');
    return;
  }

  if (!hasValidToken) {
    showError('Invalid or expired password reset link. Please request a new one.');
    return;
  }

  if (formReset) {
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
        if (!window.supabaseClient) {
          throw new Error('Supabase client is not initialized.');
        }

        // 1. Establish session using the recovery tokens if not already established
        if (tokenHash) {
          const { error: verifyError } = await window.supabaseClient.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });
          if (verifyError) throw verifyError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await window.supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError) throw sessionError;
        }

        // 2. Perform password update
        const { error } = await window.supabaseClient.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        // Success
        if (window.App && window.App.UI) window.App.UI.showSuccess('Password updated successfully!');
        if (msgEl) {
          msgEl.textContent = 'Password updated successfully!';
          msgEl.className = 'auth-message success';
        }
        
        // Clear custom auth tokens
        localStorage.removeItem('mokshita_token');
        
        // Sign out user to make them login with the new password
        await window.supabaseClient.auth.signOut();

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);

      } catch (err) {
        console.error(err);
        const errMsg = err.message || 'An unexpected error occurred.';
        if (window.App && window.App.UI) window.App.UI.showError(errMsg);
        if (msgEl) {
          msgEl.textContent = errMsg;
          msgEl.className = 'auth-message error';
        }
        btnUpdate.innerText = originalText;
        btnUpdate.disabled = false;
      }
    });
  }
});