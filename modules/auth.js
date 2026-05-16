// modules/auth.js
'use strict';

window.App = window.App || {};

window.App.Auth = (function() {
    return {
        /**
         * Fetch current session/user from API. Returns { session, user, error }
         */
        getCurrentUser: async function() {
            const token = localStorage.getItem('mokshita_token');
            if (!token) return { session: null, user: null, error: null };
            
            try {
                const { data, error } = await window.apiService.auth.getMe();
                if (error) {
                    localStorage.removeItem('mokshita_token');
                    return { session: null, user: null, error };
                }
                // Return in format expected by legacy code (simulating session.user)
                return { session: { user: data }, user: data, error: null };
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
            if (redirectUrl) {
                window.location.replace(redirectUrl);
            } else {
                window.location.reload();
            }
        }
    };
})();
