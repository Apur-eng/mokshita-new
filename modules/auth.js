// modules/auth.js
'use strict';

window.App = window.App || {};

window.App.Auth = (function() {
    let supabaseLoadingPromise = null;

    function ensureSupabaseLoaded() {
        // A real Supabase client has .auth — the CDN namespace object does NOT
        if (window.supabase && window.supabase.auth) return Promise.resolve();
        if (supabaseLoadingPromise) return supabaseLoadingPromise;

        supabaseLoadingPromise = new Promise((resolve, reject) => {
            // First check if the script is already in the document
            const existingScript = document.querySelector('script[src*="supabase-js"]');
            if (existingScript) {
                if (typeof supabase !== 'undefined') {
                    initializeSupabaseClient();
                    resolve();
                    return;
                }
                existingScript.addEventListener('load', () => {
                    initializeSupabaseClient();
                    resolve();
                });
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                initializeSupabaseClient();
                resolve();
            };
            script.onerror = (err) => {
                supabaseLoadingPromise = null;
                reject(err);
            };
            document.head.appendChild(script);
        });

        return supabaseLoadingPromise;
    }

    function getSupabaseInstance() {
        return window.supabaseClient || (window.supabase && window.supabase.auth ? window.supabase : null);
    }

    function initializeSupabaseClient() {
        const current = getSupabaseInstance();
        if (current) {
            setupAuthListener(current);
            return;
        }
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            const url = window.SUPABASE_URL || 'https://syycggibqwvqravtdhhx.supabase.co';
            const key = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';
            const client = supabase.createClient(url, key);
            window.supabaseClient = client;
            window.supabase = client;
            setupAuthListener(client);
        }
    }

    function setupAuthListener(supabaseInstance) {
        if (supabaseInstance && supabaseInstance.auth) {
            supabaseInstance.auth.onAuthStateChange((event, session) => {
                if (session && session.access_token) {
                    localStorage.setItem('mokshita_token', session.access_token);
                } else if (event === 'SIGNED_OUT') {
                    localStorage.removeItem('mokshita_token');
                }
            });
        }
    }

    // Set up state change listener only if window.supabase is a real client instance
    if (window.supabase && window.supabase.auth) {
        setupAuthListener(window.supabase);
    }

    return {
        /**
         * Fetch current session/user from Supabase client directly.
         * Returns { session, user, error }
         */
        getCurrentUser: async function() {
            try {
                await ensureSupabaseLoaded();
            } catch (e) {
                console.error('Failed to load Supabase script dynamically:', e);
            }

            const sbClient = getSupabaseInstance();
            if (!sbClient) {
                // Fallback: check localStorage directly if Supabase failed to load
                const localToken = localStorage.getItem('mokshita_token');
                if (!localToken) return { session: null, user: null, error: null };
                
                try {
                    const projectRef = window.SUPABASE_URL ? window.SUPABASE_URL.split('//')[1].split('.')[0] : 'syycggibqwvqravtdhhx';
                    const sbTokenKey = `sb-${projectRef}-auth-token`;
                    const sbData = localStorage.getItem(sbTokenKey);
                    if (sbData) {
                        const parsed = JSON.parse(sbData);
                        if (parsed && parsed.user) {
                            const user = {
                                id: parsed.user.id,
                                email: parsed.user.email,
                                full_name: parsed.user.user_metadata?.full_name || parsed.user.user_metadata?.name || '',
                                role: parsed.user.user_metadata?.role || 'customer'
                            };
                            return { session: { user }, user, error: null };
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse Supabase local session:', e);
                }
                return { session: null, user: null, error: null };
            }
            
            try {
                const { data: { session }, error } = await sbClient.auth.getSession();
                if (error) {
                    return { session: null, user: null, error };
                }
                if (!session) {
                    localStorage.removeItem('mokshita_token');
                    return { session: null, user: null, error: null };
                }
                
                // Sync the token immediately
                localStorage.setItem('mokshita_token', session.access_token);
                
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                    role: session.user.user_metadata?.role || 'customer'
                };
                
                return { session: { user }, user, error: null };
            } catch (err) {
                return { session: null, user: null, error: err };
            }
        },

        /**
         * Protect a route. Redirects if not logged in.
         * @param {string} redirectUrl - where to send guest users
         */
        requireAuth: async function(redirectUrl = 'login.html') {
            const { session, error } = await this.getCurrentUser();
            if (error || !session) {
                window.location.replace(redirectUrl);
                return null;
            }
            return session.user;
        },

        /**
         * Protect a guest route (e.g. login). Redirects if ALREADY logged in.
         * @param {string} redirectUrl - where to send logged-in users
         */
        requireGuest: async function(redirectUrl = 'account.html') {
            const { session } = await this.getCurrentUser();
            if (session) {
                window.location.replace(redirectUrl);
                return null;
            }
            return true;
        },

        logout: async function(redirectUrl = 'index.html') {
            localStorage.removeItem('mokshita_token');
            if (window.supabase) {
                try {
                    await window.supabase.auth.signOut();
                } catch (e) {
                    console.error('Supabase signOut error:', e);
                }
            }
            if (redirectUrl) {
                window.location.replace(redirectUrl);
            } else {
                window.location.reload();
            }
        }
    };
})();
