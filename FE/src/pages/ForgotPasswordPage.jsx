import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, AlertCircle, Leaf, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authForgotPassword } from "@/services/apiClient";

function InputField({ icon: Icon, type, placeholder, value, onChange, error }) {
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      setShake(true); setTimeout(() => setShake(false), 500);
      return;
    }
    
    setError(""); setGlobalErr(""); setLoading(true);

    const res = await authForgotPassword({ email });
    setLoading(false);
    
    if (res.ok) {
      setSuccess(true);
    } else {
      setGlobalErr(res.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      setShake(true); setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left image panel */}
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
            Quên mật khẩu?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7 }}>
            Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", padding: "40px 24px",
      }}>
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          <RouterLink to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 32, transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </RouterLink>

          {success ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "32px 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--matcha)", margin: "0 auto 16px" }} />
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
                Đã gửi email
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến (và thư mục rác).
              </p>
              <RouterLink to="/login" style={{ display: "inline-block", padding: "12px 24px", borderRadius: 50, background: "var(--bg-alt)", color: "var(--text)", textDecoration: "none", fontWeight: 600, border: "1px solid var(--border)" }}>
                Về trang đăng nhập
              </RouterLink>
            </motion.div>
          ) : (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
                Đặt lại mật khẩu
              </h1>
              <p style={{ color: "var(--text-muted)", margin: "0 0 32px", fontSize: 15, lineHeight: 1.6 }}>
                Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để tạo mật khẩu mới.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                    Email của bạn
                  </label>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error}
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
                  {loading ? "Đang gửi..." : "Gửi liên kết"}
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
