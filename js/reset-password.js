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
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      throw new Error("No access token or refresh token found in the URL. Please request a new password reset link.");
    }

    await window.supabase.auth.setSession({
      access_token,
      refresh_token
    });

    const { error } = await window.supabase.auth.updateUser({
      password: password
    });

    if (error) throw error;

    messageBox.innerText = "✅ Password updated successfully!";

    setTimeout(() => {
      window.location.href = "/login.html";
    }, 2000);

  } catch (err) {
    console.error(err);
    messageBox.innerText = "❌ Failed to reset password: " + err.message;
  }
});