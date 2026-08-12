/* ============================================================
   API AUTHENTICATION LOGIC (Direct Supabase Version)
   ============================================================ */

/* ─── INDIA STATES & CITIES DATA ─────────────────────────── */
const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const INDIA_CITIES = {
  'Andhra Pradesh':['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Rajahmundry','Tirupati','Kakinada','Kadapa','Anantapur','Vizianagaram','Eluru','Ongole','Nandyal','Hindupur','Tenali','Proddatur','Chittoor','Bhimavaram','Machilipatnam'],
  'Arunachal Pradesh':['Itanagar','Naharlagun','Pasighat','Namsai','Bomdila','Ziro','Tawang','Along','Changlang','Tezu'],
  'Assam':['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Karimganj','Sivasagar','Goalpara','Dhubri','North Lakhimpur','Haflong','Barpeta'],
  'Bihar':['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Bihar Sharif','Arrah','Begusarai','Katihar','Munger','Chhapra','Bettiah','Siwan','Hajipur','Samastipur','Motihari','Nawada','Sasaram','Dehri'],
  'Chhattisgarh':['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon','Jagdalpur','Raigarh','Ambikapur','Mahasamund','Dhamtari','Kanker','Chirmiri','Bhatapara'],
  'Goa':['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Curchorem','Sanquelim','Canacona','Quepem'],
  'Gujarat':['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Nadiad','Morbi','Mehsana','Bharuch','Gandhidham','Navsari','Surendranagar','Porbandar','Godhra','Patan','Vapi','Veraval'],
  'Haryana':['Faridabad','Gurgaon','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula','Bhiwani','Sirsa','Bahadurgarh','Jind','Thanesar','Kaithal','Rewari','Palwal','Fatehabad'],
  'Himachal Pradesh':['Shimla','Mandi','Solan','Dharamsala','Palampur','Baddi','Kullu','Hamirpur','Una','Bilaspur','Nahan','Chamba','Sundar Nagar','Paonta Sahib'],
  'Jharkhand':['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih','Ramgarh','Medininagar','Chatra','Gumla','Simdega'],
  'Karnataka':['Bengaluru','Hubli','Mysuru','Mangaluru','Kalaburagi','Belagavi','Davanagere','Bellary','Vijayapura','Shimoga','Tumkur','Raichur','Bidar','Hospet','Hassan','Udupi','Chitradurga','Gadag','Mandya','Bagalkot','Chikkamagaluru','Dharwad'],
  'Kerala':['Thiruvananthapuram','Kochi','Kozhikode','Kollam','Thrissur','Alappuzha','Palakkad','Malappuram','Kannur','Kasaragod','Kottayam','Punalur','Thalassery','Ottapalam'],
  'Madhya Pradesh':['Indore','Bhopal','Jabalpur','Gwalior','Ujjain','Sagar','Rewa','Satna','Ratlam','Dewas','Chhindwara','Singrauli','Dhar','Damoh','Khargone','Morena','Khandwa','Bhind','Guna','Itarsi','Vidisha'],
  'Maharashtra':['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Amravati','Navi Mumbai','Kolhapur','Akola','Latur','Nanded','Jalgaon','Dhule','Ahmednagar','Chandrapur','Parbhani','Jalna','Kalyan','Bhiwandi','Panvel','Vasai','Ulhasnagar','Malegaon','Satara','Sangli','Ratnagiri'],
  'Manipur':['Imphal','Thoubal','Kakching','Churachandpur','Ukhrul','Senapati','Bishnupur'],
  'Meghalaya':['Shillong','Tura','Nongpoh','Jowai','Baghmara','Williamnagar'],
  'Mizoram':['Aizawl','Lunglei','Champhai','Kolasib','Serchhip','Lawngtlai'],
  'Nagaland':['Kohima','Dimapur','Mokokchung','Tuensang','Wokha','Mon','Zunheboto','Phek'],
  'Odisha':['Bhubaneswar','Cuttack','Rourkela','Brahmapur','Sambalpur','Puri','Balasore','Bhadrak','Baripada','Jharsuguda','Angul','Rayagada','Kendujhar','Koraput','Jeypore','Paradip'],
  'Punjab':['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Hoshiarpur','Batala','Gurdaspur','Pathankot','Moga','Abohar','Malerkotla','Khanna','Phagwara','Firozpur','Muktsar','Barnala'],
  'Rajasthan':['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Bharatpur','Sikar','Pali','Sri Ganganagar','Barmer','Jhunjhunu','Churu','Jaisalmer','Tonk','Sawai Madhopur','Nagaur','Hanumangarh','Banswara','Jhalawar','Bundi','Dholpur'],
  'Sikkim':['Gangtok','Namchi','Geyzing','Mangan','Jorethang','Rangpo'],
  'Tamil Nadu':['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tiruppur','Vellore','Erode','Thoothukudi','Tirunelveli','Dindigul','Thanjavur','Ranipet','Sivakasi','Karur','Ooty','Hosur','Nagercoil','Kanchipuram','Kumbakonam','Pudukkottai','Dharmapuri','Cuddalore','Nagapattinam'],
  'Telangana':['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Mancherial','Adilabad','Suryapet','Miryalaguda','Nalgonda','Mahbubnagar','Sangareddy','Siddipet','Bhongir','Jagtial'],
  'Tripura':['Agartala','Dharmanagar','Udaipur','Ambassa','Kailasahar','Belonia'],
  'Uttar Pradesh':['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Meerut','Ghaziabad','Noida','Gorakhpur','Bareilly','Aligarh','Moradabad','Saharanpur','Ayodhya','Mathura','Firozabad','Jhansi','Muzaffarnagar','Shahjahanpur','Rampur','Sitapur','Hapur','Etawah','Mirzapur','Bulandshahr','Lakhimpur Kheri','Fatehpur','Rae Bareli','Unnao','Hardoi','Jaunpur','Amroha','Bahraich','Sambhal','Sultanpur','Bijnor','Azamgarh','Deoria','Ballia','Basti','Gonda','Badaun'],
  'Uttarakhand':['Dehradun','Haridwar','Roorkee','Rishikesh','Haldwani','Kashipur','Rudrapur','Kotdwar','Ramnagar','Uttarkashi','Pithoragarh'],
  'West Bengal':['Kolkata','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Barasat','Krishnanagar','Howrah','Jalpaiguri','Kharagpur','Cooch Behar','Midnapore','Habra','Raiganj','Bidhannagar','Baranagar'],
  'Andaman and Nicobar Islands':['Port Blair','Diglipur','Rangat','Mayabunder','Car Nicobar'],
  'Chandigarh':['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu':['Silvassa','Daman','Diu','Amli','Khanvel'],
  'Delhi':['New Delhi','North Delhi','South Delhi','East Delhi','West Delhi','Central Delhi','Dwarka','Rohini','Janakpuri','Karol Bagh','Lajpat Nagar','Saket','Vasant Kunj','Mayur Vihar','Pitampura'],
  'Jammu and Kashmir':['Srinagar','Jammu','Anantnag','Baramulla','Kathua','Sopore','Punch','Udhampur','Kupwara','Rajouri'],
  'Ladakh':['Leh','Kargil','Diskit','Padum'],
  'Lakshadweep':['Kavaratti','Agatti','Amini','Androth'],
  'Puducherry':['Puducherry','Karaikal','Mahe','Yanam']
};

const MANUAL_CITY_VALUE = '__manual__';

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const tabLogin  = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin  = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const authLoggedIn = document.getElementById('auth-logged-in');

  const loginMsg  = document.getElementById('login-message');
  const signupMsg = document.getElementById('signup-message');

  /* ── Password Visibility Toggles ────────────────────────── */
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const eyeOn  = btn.querySelector('.eye-icon');
      const eyeOff = btn.querySelector('.eye-off-icon');
      if (eyeOn)  eyeOn.style.display  = isPassword ? 'none'  : 'block';
      if (eyeOff) eyeOff.style.display = isPassword ? 'block' : 'none';
    });
  });

  /* ── State / City Dropdowns ──────────────────────────────── */
  const stateSelect     = document.getElementById('signup-state');
  const citySelect      = document.getElementById('signup-city');
  const cityManualGroup = document.getElementById('city-manual-group');
  const citySelectGroup = document.getElementById('city-select-group');
  const cityManualInput = document.getElementById('signup-city-manual');
  const btnBackToCity   = document.getElementById('btn-back-to-city-select');

  if (stateSelect) {
    INDIA_STATES.forEach(state => {
      const opt = document.createElement('option');
      opt.value = state;
      opt.textContent = state;
      stateSelect.appendChild(opt);
    });

    stateSelect.addEventListener('change', () => {
      const selectedState = stateSelect.value;
      if (cityManualInput) cityManualInput.value = '';
      if (cityManualGroup) cityManualGroup.style.display = 'none';
      if (citySelectGroup) citySelectGroup.style.display = 'block';
      if (!citySelect) return;
      citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
      const cities = INDIA_CITIES[selectedState] || [];
      cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
      const manualOpt = document.createElement('option');
      manualOpt.value = MANUAL_CITY_VALUE;
      manualOpt.textContent = "Can't find your city? Enter manually";
      citySelect.appendChild(manualOpt);
      citySelect.disabled = false;
      citySelect.value = '';
    });
  }

  if (citySelect) {
    citySelect.addEventListener('change', () => {
      if (citySelect.value === MANUAL_CITY_VALUE) {
        if (citySelectGroup) citySelectGroup.style.display = 'none';
        if (cityManualGroup) cityManualGroup.style.display = 'block';
        if (cityManualInput) cityManualInput.focus();
      }
    });
  }

  if (btnBackToCity) {
    btnBackToCity.addEventListener('click', () => {
      cityManualGroup.style.display = 'none';
      citySelectGroup.style.display = 'block';
      cityManualInput.value = '';
      citySelect.value = '';
    });
  }

  /* ── Tab switching helpers ──────────────────────────────── */
  function showLogin() {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    formLogin.classList.add('active');
    formSignup.classList.remove('active');
  }

  function showSignup() {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    formSignup.classList.add('active');
    formLogin.classList.remove('active');
  }

  // Tab button clicks
  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', showLogin);
    tabSignup.addEventListener('click', showSignup);
  }

  // In-form switch links
  const linkToLogin  = document.getElementById('link-to-login');
  const linkToSignup = document.getElementById('link-to-signup');
  if (linkToLogin)  linkToLogin.addEventListener('click',  showLogin);
  if (linkToSignup) linkToSignup.addEventListener('click', showSignup);

  // Continue as Guest links
  document.querySelectorAll('.auth-guest-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.App && window.App.Auth && window.App.Auth.setGuestMode) {
        window.App.Auth.setGuestMode();
      } else {
        localStorage.setItem('mokshita_guest', 'true');
      }
      window.location.href = 'index.html';
    });
  });

  /* ── Default tab: Sign Up for new visitors, Log In if ?tab=login ── */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'login') {
    showLogin();
  } else {
    showSignup();
  }

  /* ── Handle Login ───────────────────────────────────────── */
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
        const sb = window.supabaseClient || (window.supabase && window.supabase.auth ? window.supabase : null);
        if (!sb) throw new Error('Supabase client is not initialized.');

        // Authenticate directly with Supabase
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Clear guest mode since user is now authenticated
        if (window.App && window.App.Auth && window.App.Auth.clearGuestMode) {
          window.App.Auth.clearGuestMode();
        } else {
          localStorage.removeItem('mokshita_guest');
        }

        // Ensure session persists locally for backend API calls
        const { data: { session } } = await sb.auth.getSession();
        if (session && session.access_token) {
          localStorage.setItem('mokshita_token', session.access_token);
          // Trigger backend sync to ensure local users row exists
          if (window.apiService && window.apiService.auth && window.apiService.auth.getMe) {
            try {
              await window.apiService.auth.getMe();
            } catch (syncErr) {
              console.warn('Backend user sync warning:', syncErr);
            }
          }
        }

        if (typeof window.syncGuestCart === 'function') {
          await window.syncGuestCart();
        }

        loginMsg.textContent = 'Login successful';
        loginMsg.className = 'auth-message success';
        if (window.App && window.App.UI) window.App.UI.showSuccess('Login successful');

        // Respect ?redirect= param, else go to homepage (not account)
        const redirect = urlParams.get('redirect') || 'index.html';
        setTimeout(() => { window.location.replace(redirect); }, 800);

      } catch (err) {
        const msg = err.message || 'Invalid email or password';
        loginMsg.textContent = msg;
        loginMsg.className = 'auth-message error';
        if (window.App && window.App.UI) window.App.UI.showError(msg);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  /* ── Handle Signup ──────────────────────────────────────── */
  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name     = document.getElementById('signup-name').value.trim();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm  = document.getElementById('signup-confirm').value;
      // Resolve state & city (manual input takes priority when visible)
      const isManualCity = cityManualGroup && cityManualGroup.style.display !== 'none';
      const state = stateSelect ? stateSelect.value : '';
      const city  = isManualCity
        ? (cityManualInput ? cityManualInput.value.trim() : '')
        : (citySelect && citySelect.value !== MANUAL_CITY_VALUE ? citySelect.value : '');
      const btn      = formSignup.querySelector('.auth-submit');

      // ── Validation ──────────────────────────────────────
      if (!name || !email || !password || !confirm) {
        signupMsg.textContent = 'Please fill in all fields.';
        signupMsg.className = 'auth-message error';
        return;
      }

      if (password.length < 8) {
        signupMsg.textContent = 'Password must be at least 8 characters long.';
        signupMsg.className = 'auth-message error';
        document.getElementById('signup-password').focus();
        return;
      }

      if (password !== confirm) {
        signupMsg.textContent = 'Passwords do not match. Please re-enter.';
        signupMsg.className = 'auth-message error';
        document.getElementById('signup-confirm').focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creating account...';
      signupMsg.className = 'auth-message';
      signupMsg.textContent = '';

      try {
        const sb = window.supabaseClient || (window.supabase && window.supabase.auth ? window.supabase : null);
        if (!sb) throw new Error('Supabase client is not initialized.');

        // SignUp directly with Supabase
        const verifyRedirectUrl = window.location.origin + '/verify.html';
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: verifyRedirectUrl,
            data: {
              full_name: name,
              role: 'customer',
              state: state || undefined,
              city:  city  || undefined
            }
          }
        });

        if (error) throw error;

        // Check if account already exists in Supabase (empty identities array)
        if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          signupMsg.textContent = 'An account with this email address already exists. Please log in.';
          signupMsg.className = 'auth-message error';
          if (window.App && window.App.UI) window.App.UI.showError('Account already exists. Please log in.');
          return;
        }

        if (window.App && window.App.Auth && window.App.Auth.clearGuestMode) {
          window.App.Auth.clearGuestMode();
        } else {
          localStorage.removeItem('mokshita_guest');
        }

        // Email confirmation is required — inform the user
        signupMsg.textContent = 'Check your email to verify your account!';
        signupMsg.className = 'auth-message success';
        if (window.App && window.App.UI) window.App.UI.showSuccess('Check your email for verification.');

      } catch (err) {
        const msg = err.message || 'Signup failed. Please try again.';
        signupMsg.textContent = msg;
        signupMsg.className = 'auth-message error';
        if (window.App && window.App.UI) window.App.UI.showError(msg);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign Up';
      }
    });
  }

  /* ── Handle Logout ──────────────────────────────────────── */
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await window.App.Auth.logout(null);
      window.location.reload();
    });
  }

  /* ── Check initial session — show logged-in state or default to Signup ── */
  window.App.Auth.requireGuest('account.html').then(isGuest => {
    if (isGuest) {
      // Not logged in — default already set above (signup first)
    }
  });

  async function updateAuthUI(session) {
    if (!formLogin || !formSignup || !authLoggedIn) return;

    const tabsContainer = document.querySelector('.auth-tabs');

    if (session) {
      // User is logged in — hide forms, show account panel
      formLogin.classList.remove('active');
      formSignup.classList.remove('active');
      if (tabsContainer) tabsContainer.style.display = 'none';

      authLoggedIn.classList.add('active');

      const emailDisplay = document.getElementById('account-email-display');
      const nameDisplay  = document.getElementById('account-name-display');

      if (emailDisplay) emailDisplay.textContent = session.user.email;
      if (nameDisplay && session.user.full_name) {
        nameDisplay.textContent = `Welcome, ${session.user.full_name}`;
      }
    } else {
      // Not logged in — respect URL param for which tab to show
      if (tabsContainer) tabsContainer.style.display = 'flex';
      authLoggedIn.classList.remove('active');
    }
  }
});
