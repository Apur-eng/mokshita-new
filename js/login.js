/* ============================================================
   API AUTHENTICATION LOGIC
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const authLoggedIn = document.getElementById('auth-logged-in');
  
  const loginMsg = document.getElementById('login-message');
  const signupMsg = document.getElementById('signup-message');

  // Tab switching
  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      formLogin.classList.add('active');
      formSignup.classList.remove('active');
    });
    
    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      formSignup.classList.add('active');
      formLogin.classList.remove('active');
    });
  }

  // Handle Login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn      = formLogin.querySelector('.auth-submit');

      if (!email || !password) {
        loginMsg.textContent = 'Please fill in all fields.';
        loginMsg.className = 'auth-message error';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Signing in...';
      loginMsg.className = 'auth-message';
      loginMsg.textContent = '';

      try {
        // Authenticate directly with Supabase instead of the backend
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Ensure session persists locally for backend API calls
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session && session.access_token) {
          localStorage.setItem('mokshita_token', session.access_token);
        }

        if (typeof window.syncGuestCart === 'function') {
          await window.syncGuestCart();
        }

        loginMsg.textContent = 'Login successful';
        loginMsg.className = 'auth-message success';
        if (window.App && window.App.UI) {
          window.App.UI.showSuccess('Login successful');
        }

        const urlParams   = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'account.html';
        setTimeout(() => { window.location.replace(redirectUrl); }, 800);

      } catch (err) {
        const msg = 'Invalid email or password';
        loginMsg.textContent = msg;
        loginMsg.className = 'auth-message error';
        if (window.App && window.App.UI) {
          window.App.UI.showError(msg);
        }
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  // Handle Signup
  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const name     = document.getElementById('signup-name').value.trim();
      const btn      = formSignup.querySelector('.auth-submit');

      if (!email || !password || !name) {
        signupMsg.textContent = 'Please fill in all fields.';
        signupMsg.className = 'auth-message error';
        return;
      }

      if (password.length < 8) {
        signupMsg.textContent = 'Password must be at least 8 characters.';
        signupMsg.className = 'auth-message error';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creating account...';
      signupMsg.className = 'auth-message';
      signupMsg.textContent = '';

      try {
        const { data, error } = await window.apiService.auth.register(email, password, name);

        if (error) throw new Error(error);

        // Supabase requires email confirmation → backend returns token: null
        // Do NOT store null as a token — that breaks all subsequent auth checks
        if (data && data.token) {
          localStorage.setItem('mokshita_token', data.token);
          if (window.App && window.App.UI) window.App.UI.showSuccess('Account created! Redirecting...');
          signupMsg.textContent = 'Account created! Redirecting...';
          signupMsg.className = 'auth-message success';
          setTimeout(() => { window.location.replace('account.html'); }, 800);
        } else {
          // Email confirmation required — do NOT redirect, just inform the user
          signupMsg.textContent =
            'Account created! Please check your email to verify your account before logging in.';
          signupMsg.className = 'auth-message success';
          if (window.App && window.App.UI)
            window.App.UI.showSuccess('Check your email to verify your account.');
          btn.disabled = false;
          btn.textContent = 'Create Account';
        }

      } catch (err) {
        const msg = err.message || 'Signup failed. Please try again.';
        signupMsg.textContent = msg;
        signupMsg.className = 'auth-message error';
        if (window.App && window.App.UI) window.App.UI.showError(msg);
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }

  // Handle Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await window.App.Auth.logout(null);
      window.location.reload();
    });
  }
  
  // Check initial session — redirect to account if already logged in
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect') || 'account.html';
  window.App.Auth.requireGuest(redirectUrl).then(isGuest => {
      if (isGuest) updateAuthUI(null);
  });

  async function updateAuthUI(session) {
    if (!formLogin || !formSignup || !authLoggedIn) return;
    
    const tabsContainer = document.querySelector('.auth-tabs');
    
    if (session) {
      // User is logged in
      formLogin.classList.remove('active');
      formSignup.classList.remove('active');
      if (tabsContainer) tabsContainer.style.display = 'none';
      
      authLoggedIn.classList.add('active');
      
      const emailDisplay = document.getElementById('account-email-display');
      const nameDisplay = document.getElementById('account-name-display');
      
      if (emailDisplay) emailDisplay.textContent = session.user.email;
      if (nameDisplay && session.user.full_name) {
        nameDisplay.textContent = `Welcome, ${session.user.full_name}`;
      }
    } else {
      // User is logged out
      if (tabLogin.classList.contains('active')) {
        formLogin.classList.add('active');
      } else {
        formSignup.classList.add('active');
      }
      if (tabsContainer) tabsContainer.style.display = 'flex';
      authLoggedIn.classList.remove('active');
    }
  }
});
