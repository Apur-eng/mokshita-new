/* supabase-client.js
 * Initializes the Supabase client using the UMD build (loaded via CDN <script> tag).
 * Exposes the created client globally as both window.supabaseClient AND window.supabase.
 */

(function () {
  'use strict';

  const SUPABASE_URL     = 'https://syycggibqwvqravtdhhx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';

  if (!window.supabase) {
    console.error('[Supabase] supabase global not found. Ensure the Supabase UMD CDN script is loaded before supabase-client.js.');
    return;
  }

  // If window.supabase is already a client instance (has .auth), don't recreate
  if (window.supabase && window.supabase.auth) {
    window.supabaseClient = window.supabase;
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Set BOTH references to the created client instance so all scripts share the exact same session
  window.supabaseClient = client;
  window.supabase       = client;

  // Sync token whenever auth state changes
  client.auth.onAuthStateChange((event, session) => {
    if (session && session.access_token) {
      localStorage.setItem('mokshita_token', session.access_token);
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('mokshita_token');
    }
  });

  // Debug log — confirms client is ready
  console.log('[Supabase] Client initialized globally as window.supabaseClient & window.supabase');
})();
