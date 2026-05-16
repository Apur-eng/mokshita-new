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
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const btn = formLogin.querySelector('.auth-submit');
      
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      loginMsg.className = 'auth-message';
      loginMsg.textContent = '';
      
      try {
        const { data, error } = await window.apiService.auth.login(email, password);
        
        if (error) throw new Error(error);
        
        // Save token
        if (data && data.token) {
          localStorage.setItem('mokshita_token', data.token);
        }
        
        if (typeof window.syncGuestCart === 'function') {
          await window.syncGuestCart();
        }

        loginMsg.textContent = "Successfully logged in! Redirecting…";
        loginMsg.classList.add('success');
        
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'account.html';
        if (window.App && window.App.UI) window.App.UI.showSuccess("Welcome back!");
        setTimeout(() => { window.location.replace(redirectUrl); }, 800);
        
      } catch (err) {
        loginMsg.textContent = err.message || 'Login failed';
        loginMsg.classList.add('error');
        if (window.App && window.App.UI) window.App.UI.showError(err.message || 'Login failed');
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
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const name = document.getElementById('signup-name').value;
      const btn = formSignup.querySelector('.auth-submit');
      
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      signupMsg.className = 'auth-message';
      signupMsg.textContent = '';
      
      try {
        const { data, error } = await window.apiService.auth.register(email, password, name);
        
        if (error) throw new Error(error);

        // Auto login on successful registration
        if (data && data.token) {
           localStorage.setItem('mokshita_token', data.token);
        }

        signupMsg.textContent = "Account created! Redirecting...";
        signupMsg.classList.add('success');
        if (window.App && window.App.UI) window.App.UI.showSuccess("Account created successfully.");
        
        setTimeout(() => { window.location.replace('account.html'); }, 800);
        
      } catch (err) {
        signupMsg.textContent = err.message || 'Signup failed';
        signupMsg.classList.add('error');
        if (window.App && window.App.UI) window.App.UI.showError(err.message || 'Signup failed');
      } finally {
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
