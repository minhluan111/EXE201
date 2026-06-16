import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle, Leaf, CheckCircle2 } from "lucide-react";
import { authResetPassword } from "@/services/apiClient";

function InputField({ icon: Icon, type, placeholder, value, onChange, error, rightAction }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px",
        border: `1.5px solid ${error ? "#EF4444" : "var(--border)"}`,
        borderRadius: 14, background: "var(--bg-alt)",
        transition: "border-color 0.2s",
      }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--matcha)"; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <Icon size={18} style={{ color: error ? "#EF4444" : "var(--text-muted)", flexShrink: 0 }} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            flex: 1, border: "none", background: "transparent",
            color: "var(--text)", fontSize: 15, outline: "none",
            fontFamily: "Inter, sans-serif",
          }}
        />
        {rightAction}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ display: "flex", gap: 5, alignItems: "center", color: "#EF4444", fontSize: 12, marginTop: 5 }}
          >
            <AlertCircle size={12} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <AlertCircle size={48} style={{ color: "#EF4444", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Link không hợp lệ</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <RouterLink to="/forgot-password" style={{ color: "var(--matcha)", fontWeight: 600, textDecoration: "none" }}>Yêu cầu link mới</RouterLink>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!password) e.password = "Vui lòng nhập mật khẩu mới.";
    else if (password.length < 8) e.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (password !== confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setErrors({}); setGlobalErr(""); setLoading(true);

    const res = await authResetPassword({ token, newPassword: password, confirmPassword });
    setLoading(false);
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setGlobalErr(res.message);
      setShake(true); setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      <div style={{
        position: "relative", overflow: "hidden",
        backgroundImage: "url('https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&q=85')",
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,31,18,0.8) 0%, rgba(47,91,62,0.7) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px" }}>
          <RouterLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "auto" }}>
            <Leaf size={24} style={{ color: "rgba(175,215,120,0.9)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              yakishime
            </span>
          </RouterLink>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
            Bảo mật tài khoản
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7 }}>
            Tạo mật khẩu mới mạnh mẽ để bảo vệ thông tin của bạn.
          </p>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", padding: "40px 24px",
      }}>
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          {success ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "32px 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--matcha)", margin: "0 auto 16px" }} />
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
                Thành công!
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                Mật khẩu của bạn đã được đặt lại. Tự động chuyển về trang đăng nhập...
              </p>
            </motion.div>
          ) : (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
                Tạo mật khẩu mới
              </h1>
              <p style={{ color: "var(--text-muted)", margin: "0 0 32px", fontSize: 15 }}>
                Vui lòng điền mật khẩu mới của bạn bên dưới.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Mật khẩu mới</label>
                  <InputField
                    icon={Lock}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    rightAction={
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Xác nhận mật khẩu mới</label>
                  <InputField
                    icon={Lock}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>

                {globalErr && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 14, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
                    <AlertCircle size={15} /> {globalErr}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 50,
                    background: loading ? "var(--bg-alt)" : "linear-gradient(135deg,var(--matcha),var(--forest))",
                    color: loading ? "var(--text-muted)" : "#fff",
                    border: "none", fontSize: 16, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 8px 28px rgba(107,143,62,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-grid > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
