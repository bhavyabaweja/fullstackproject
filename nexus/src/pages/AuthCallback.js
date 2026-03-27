import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Handles the redirect from Google OAuth.
// URL format: /auth/callback?token=JWT&user=JSON
function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const userRaw = params.get("user");
    const error = params.get("error");

    if (error || !token || !userRaw) {
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      login(token, user);
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/login?error=google_failed", { replace: true });
    }
  }, []);

  return null;
}

export default AuthCallback;
