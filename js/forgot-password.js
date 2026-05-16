/* forgot-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const formForgot = document.getElementById('form-forgot-password');
  const btnReset = document.getElementById('btn-reset-password');
  const msgEl = document.getElementById('forgot-message');

  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    if (!email) {
      if (window.App && window.App.UI) window.App.UI.showError('Please enter your email.');
      return;
    }

    const originalText = btnReset.innerText;
    btnReset.innerText = 'Sending...';
    btnReset.disabled = true;

    try {
      const { error } = await window.apiService.auth.forgotPassword(email);

      if (error) {
        if (window.App && window.App.UI) window.App.UI.showError(error);
      } else {
        if (window.App && window.App.UI) window.App.UI.showSuccess('Check your email for reset instructions.');
      }
    } catch (err) {
      console.error(err);
      if (window.App && window.App.UI) window.App.UI.showError('An unexpected error occurred.');
    } finally {
      btnReset.innerText = originalText;
      btnReset.disabled = false;
    }
  });
});
