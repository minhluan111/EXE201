import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, Leaf, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function InputField({ icon: Icon, type, placeholder, value, onChange, error, rightAction }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
          border: `1.5px solid ${error ? "#EF4444" : "var(--border)"}`,
          borderRadius: 14, background: "var(--bg-alt)", transition: "border-color 0.2s",
        }}
        tabIndex={-1}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--matcha)"; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <Icon size={17} style={{ color: error ? "#EF4444" : "var(--text-muted)", flexShrink: 0 }} />
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          style={{ flex: 1, border: "none", background: "transparent", color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "Inter, sans-serif" }}
        />
        {rightAction}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ display: "flex", gap: 5, alignItems: "center", color: "#EF4444", fontSize: 12, marginTop: 5 }}>
            <AlertCircle size={12} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Password strength
function PasswordStrength({ password }) {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ["", "Yếu", "Trung bình", "Khá mạnh", "Mạnh"];
  const colors  = ["", "#EF4444", "#F59E0B", "#6B8F3E", "#2F5B3E"];

  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: s <= strength ? colors[strength] : "var(--border)", transition: "background 0.3s" }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[strength], fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Vui lòng nhập họ tên.";
    if (!form.email.includes("@")) e.email = "Email không hợp lệ.";
    if (!/^0\d{9}$/.test(form.phone)) e.phone = "Số điện thoại không hợp lệ (VD: 0909123456).";
    if (form.password.length < 8) {
      e.password = "Mật khẩu phải chứa ít nhất 8 ký tự.";
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = "Mật khẩu phải chứa ít nhất một chữ cái viết hoa (A-Z).";
    } else if (!/[a-z]/.test(form.password)) {
      e.password = "Mật khẩu phải chứa ít nhất một chữ cái viết thường (a-z).";
    } else if (!/[0-9]/.test(form.password)) {
      e.password = "Mật khẩu phải chứa ít nhất một chữ số (0-9).";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      e.password = "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (VD: @, #, $,...).";
    }
    if (form.password !== form.confirm) e.confirm = "Mật khẩu không khớp.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setErrors({}); setGlobalErr(""); setLoading(true);

    const res = await register({ full_name: form.full_name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (res.ok) navigate("/");
    else { setGlobalErr(res.message); setShake(true); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left image */}
      <div style={{
        position: "relative", overflow: "hidden",
        backgroundImage: "url('https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&q=85')",
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(15,31,18,0.85),rgba(47,91,62,0.75))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px" }}>
          <RouterLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "auto" }}>
            <Leaf size={24} style={{ color: "rgba(175,215,120,0.9)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>yakishime</span>
          </RouterLink>
          <div>
            {["Đặt bàn theo sơ đồ tương tác", "Xem lịch sử & hủy dễ dàng", "Viết đánh giá món ăn"].map((b) => (
              <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <CheckCircle size={16} style={{ color: "rgba(175,215,120,0.9)", flexShrink: 0 }} />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>{b}</span>
              </div>
            ))}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: "#fff", margin: "28px 0 14px", lineHeight: 1.15 }}>
            Tham gia cộng đồng<br />Yakishime hôm nay
          </h2>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "40px 24px", overflowY: "auto" }}>
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
            Tạo tài khoản
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "0 0 32px", fontSize: 15 }}>
            Đã có tài khoản?{" "}
            <RouterLink to="/login" style={{ color: "var(--matcha)", fontWeight: 700, textDecoration: "none" }}>
              Đăng nhập
            </RouterLink>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {[
              { key: "full_name", label: "Họ và tên",    icon: User,  type: "text",     ph: "Nguyễn Văn A" },
              { key: "email",     label: "Email",         icon: Mail,  type: "email",    ph: "email@example.com" },
              { key: "phone",     label: "Số điện thoại", icon: Phone, type: "tel",      ph: "0909 123 456" },
            ].map(({ key, label, icon: Icon, type, ph }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{label}</label>
                <InputField icon={Icon} type={type} placeholder={ph} value={form[key]} onChange={set(key)} error={errors[key]} />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Mật khẩu</label>
              <InputField
                icon={Lock} type={showPw ? "text" : "password"} placeholder="Tối thiểu 8 ký tự (có chữ hoa, thường, số, ký tự đặc biệt)"
                value={form.password} onChange={set("password")} error={errors.password}
                rightAction={
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Xác nhận mật khẩu</label>
              <InputField icon={Lock} type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
            </div>

            {globalErr && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 14, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
                <AlertCircle size={15} /> {globalErr}
              </div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
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
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </motion.button>
          </form>
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
