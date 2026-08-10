/* supabase-client.js
 * Initializes the Supabase client using the UMD build (loaded via CDN <script> tag).
 * window.supabaseClient is available globally to all subsequent scripts.
 */

(function () {
  'use strict';

  const SUPABASE_URL     = 'https://syycggibqwvqravtdhhx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';

  if (!window.supabase) {
    console.error('[Supabase] supabase global not found. Ensure the Supabase UMD CDN script is loaded before supabase-client.js.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Debug log — confirms client is ready
  console.log('[Supabase] Client initialized:', window.supabaseClient);
})();
