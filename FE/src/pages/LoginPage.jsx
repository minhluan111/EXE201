import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Leaf, Coffee } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { tenant } = useTenant();
  const isMonari = tenant?.name?.toLowerCase().includes("monari") || tenant?.tenantName?.toLowerCase().includes("monari");
  const isComGa = tenant?.name?.toLowerCase().includes("cơm gà") || tenant?.name?.toLowerCase().includes("ông bách") || tenant?.tenantName?.toLowerCase().includes("comga");
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm");
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse");
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat");
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa");

  const [login_val, setLoginVal] = useState("");
  const [password, setPassword]  = useState("");
  const [showPw, setShowPw]      = useState(false);
  const [errors, setErrors]      = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading]    = useState(false);
  const [shake, setShake]        = useState(false);

  const validate = () => {
    const e = {};
    if (!login_val.trim()) e.login = "Vui lòng nhập email.";
    if (!password)         e.password = "Vui lòng nhập mật khẩu.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setErrors({}); setGlobalErr(""); setLoading(true);

    const res = await login({ login: login_val, password });
    setLoading(false);
    if (res.ok) {
      navigate("/");
    } else {
      setGlobalErr(res.message);
      setShake(true); setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left image panel */}
      <div style={{
        position: "relative", overflow: "hidden",
        backgroundImage: isMonari
          ? "url('/assets/monari/decor/space_main.jpg')"
          : (isComGa
            ? "url('/assets/comgaongbach/decor/space_main.jpg')"
            : (isComTam 
              ? "url('/assets/comtamno/hero.jpg')" 
              : (isSamHouse ? "url('/assets/samhouse/decor/hero_bg.jpg')" : (isMonQuanChat ? "url('/assets/monquanchat/decor/hero_bg.jpg')" : (isHoaTeaRoom ? "url('/assets/hoatearoom/decor/hero_bg.jpg')" : "url('https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&q=85')"))))),
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          background: isMonari
            ? "linear-gradient(135deg, rgba(35,15,10,0.85) 0%, rgba(95,40,25,0.75) 50%, rgba(35,15,10,0.8) 100%)"
            : (isComGa
              ? "linear-gradient(135deg, rgba(35,15,5,0.85) 0%, rgba(180,83,9,0.75) 50%, rgba(35,15,5,0.8) 100%)"
              : (isComTam 
                ? "linear-gradient(135deg, rgba(30,15,5,0.8) 0%, rgba(224,123,57,0.7) 100%)" 
                : (isSamHouse 
                    ? "linear-gradient(135deg, rgba(20,10,5,0.8) 0%, rgba(139,69,19,0.7) 100%)" 
                    : (isMonQuanChat
                        ? "linear-gradient(135deg, rgba(30,10,10,0.8) 0%, rgba(139,26,26,0.7) 100%)"
                        : (isHoaTeaRoom
                            ? "linear-gradient(135deg, rgba(6,18,12,0.8) 0%, rgba(46,111,64,0.7) 100%)"
                            : "linear-gradient(135deg, rgba(15,31,18,0.8) 0%, rgba(47,91,62,0.7) 100%)")))))
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px" }}>
          <RouterLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", position: "absolute", top: 40, left: 48 }}>
            {isMonari
              ? <span style={{ fontSize: 24 }}>🥮</span>
              : (isComGa
                ? <span style={{ fontSize: 24 }}>🍗</span>
                : (isComTam 
                  ? <span style={{ fontSize: 24 }}>🌾</span> 
                  : (isSamHouse 
                      ? <Coffee size={24} style={{ color: "#BAAFA8" }} />
                      : (isMonQuanChat
                          ? <span style={{ fontSize: 24 }}>🍲</span>
                          : (isHoaTeaRoom
                              ? <span style={{ fontSize: 24 }}>🍃</span>
                              : <Leaf size={24} style={{ color: "rgba(175,215,120,0.9)" }} />)))))
            }
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", textTransform: isMonari ? "uppercase" : "capitalize" }}>
              {isMonari ? "MONARI" : (isComGa ? "Cơm Gà Ông Bách" : (tenant?.name || "yakishime"))}
            </span>
          </RouterLink>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
              {isMonari
                ? "MONARI - Bánh Ngọt Thủ Công & Trà Thơm"
                : (isComGa
                  ? "Cơm Gà Ông Bách - Hương Vị Gia Truyền Đậm Đà"
                  : (isComTam 
                    ? "Cơm Tấm Ngọ - Đậm đà chuẩn vị quê nhà" 
                    : (isSamHouse ? "Cafe Sam Houses - Hương vị ấm cúng" : (isMonQuanChat ? "Món Quảng Chất - Đậm đà vị miền Trung" : (isHoaTeaRoom ? "Hòa Tea Room - Tinh hoa trà đạo Việt" : "Trà đạo chính thống từ Uji, Kyoto")))))}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              {isMonari
                ? "Đăng nhập để đặt bàn, theo dõi lịch sử và trải nghiệm dịch vụ chu đáo."
                : (isComGa
                  ? "Đăng nhập để đặt bàn, thưởng thức cơm gà thơm ngon và nhận ưu đãi."
                  : "Đăng nhập để đặt bàn, theo dõi lịch sử và viết đánh giá.")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", display: "inline-block", textAlign: "left" }}>
              {["Đặt bàn theo sơ đồ tương tác", "Xem lịch sử & hủy dễ dàng", "Viết đánh giá món ăn & đồ uống"].map((b) => (
                <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: isMonari ? "#E8927C" : (isComGa ? "#F59E0B" : (isComTam ? "#E07B39" : (isSamHouse ? "#BAAFA8" : (isMonQuanChat ? "#E57373" : (isHoaTeaRoom ? "#6CBF7A" : "rgba(175,215,120,0.9)"))))), fontSize: 18 }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
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
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
            Chào mừng trở lại
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "0 0 36px", fontSize: 15 }}>
            Chưa có tài khoản?{" "}
            <RouterLink to="/register" style={{ color: "var(--matcha)", fontWeight: 700, textDecoration: "none" }}>
              Đăng ký ngay
            </RouterLink>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                Email
              </label>
              <InputField
                icon={Mail}
                type="text"
                placeholder="email@example.com"
                value={login_val}
                onChange={(e) => setLoginVal(e.target.value)}
                error={errors.login}
              />
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Mật khẩu</label>
            
              <InputField
                icon={Lock}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightAction={
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}></label>
                <RouterLink to="/forgot-password" style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  Quên mật khẩu?
                </RouterLink>
              </div>
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
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </motion.button>
          </form>

          {/* Demo credentials */}
          
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
