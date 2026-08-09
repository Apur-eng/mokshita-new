import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://syycggibqwvqravtdhhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM"; // replace this

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;

const form = document.getElementById("form-reset-password");
const messageBox = document.getElementById("reset-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password.length < 8) {
    messageBox.innerText = "Password must be at least 8 characters";
    return;
  }

  if (password !== confirmPassword) {
    messageBox.innerText = "Passwords do not match";
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) throw error;

    messageBox.innerText = "✅ Password updated successfully!";

    setTimeout(() => {
      window.location.href = "/login.html";
    }, 2000);

  } catch (err) {
    console.error(err);
    messageBox.innerText = "❌ Failed to reset password";
  }
});