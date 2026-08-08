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
  const { login } = useAuth();
  const { tenant } = useTenant();
  const isMonari = tenant?.name?.toLowerCase().includes("monari") || tenant?.tenantName?.toLowerCase().includes("monari");
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm");
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse");
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat");
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa");
  const isEmCoffee = tenant?.name?.toLowerCase().includes("em coffee") || tenant?.name?.toLowerCase() === "em" || tenant?.tenantName?.toLowerCase().includes("emcoffee");
  const isTaoTao = tenant?.name?.toLowerCase().includes("táo") || tenant?.name?.toLowerCase().includes("taotao") || String(tenant?.tenantName).toLowerCase().includes("taotao");
  const isHanHuyen = tenant?.name?.toLowerCase().includes("hàn") || tenant?.name?.toLowerCase().includes("hanhuyen") || String(tenant?.tenantName).toLowerCase().includes("hanhuyen") || localStorage.getItem("tenant_is_hanhuyen") === "true";
  const isCochin = tenant?.name?.toLowerCase().includes("cochin") || tenant?.tenantName?.toLowerCase().includes("cochin") || String(tenant?.tenantName).toLowerCase().includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";

  const [login_val, setLoginVal] = useState("");
  const [password, setPassword]  = useState("");
  const [showPw, setShowPw]      = useState(false);
  const [errors, setErrors]      = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading]    = useState(false);
  const [shake, setShake]        = useState(false);

  const validate = () => {
    const e = {};
    if (!login_val.trim()) e.login = "Vui lòng nhập email";
    if (!password)         e.password = "Vui lòng nhập mật khẩu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setGlobalErr("");

    try {
      const res = await login({ login: login_val.trim(), password });
      if (res.ok) {
        navigate("/");
      } else {
        setGlobalErr(res.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setGlobalErr("Có lỗi xảy ra, vui lòng thử lại sau");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left image panel */}
      <div style={{
        position: "relative", overflow: "hidden",
        backgroundImage: isMonari
          ? "url('/assets/monari/decor/space_main.jpg')"
          : (isComTam 
          ? "url('/assets/comtamno/hero.jpg')" 
          : (isSamHouse ? "url('/assets/samhouse/decor/hero_bg.jpg')" : (isMonQuanChat ? "url('/assets/monquanchat/decor/hero_bg.jpg')" : (isHoaTeaRoom ? "url('/assets/hoatearoom/decor/hero_bg.jpg')" : (isEmCoffee ? "url('/assets/emcoffee/decor/hero.jpg')" : (isTaoTao ? "url('/assets/taotao/decor/hero.jpg')" : (isHanHuyen ? "url('/assets/hanhuyen/Ảnh bìa.jpg')" : (isCochin ? "url('/assets/cochin/Ảnh bìa.jpg')" : "url('https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&q=85')")))))))),
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          background: isMonari
            ? "linear-gradient(135deg, rgba(35,15,10,0.85) 0%, rgba(95,40,25,0.75) 50%, rgba(35,15,10,0.8) 100%)"
            : (isComTam 
            ? "linear-gradient(135deg, rgba(30,15,5,0.8) 0%, rgba(224,123,57,0.7) 100%)" 
            : (isSamHouse 
                ? "linear-gradient(135deg, rgba(20,10,5,0.8) 0%, rgba(139,69,19,0.7) 100%)" 
                : (isMonQuanChat
                    ? "linear-gradient(135deg, rgba(30,10,10,0.8) 0%, rgba(139,26,26,0.7) 100%)"
                    : (isHoaTeaRoom
                        ? "linear-gradient(135deg, rgba(6,18,12,0.8) 0%, rgba(46,111,64,0.7) 100%)"
                        : (isEmCoffee
                            ? "linear-gradient(135deg, rgba(20,12,8,0.8) 0%, rgba(139,90,43,0.7) 100%)"
                            : (isTaoTao
                                ? "linear-gradient(135deg, rgba(30,10,10,0.8) 0%, rgba(155,46,34,0.7) 100%)"
                                : (isHanHuyen
                                    ? "linear-gradient(135deg, rgba(25,40,30,0.85) 0%, rgba(97,130,105,0.75) 100%)"
                                    : (isCochin
                                      ? "linear-gradient(135deg, rgba(15,35,25,0.85) 0%, rgba(42,89,68,0.75) 100%)"
                                      : "linear-gradient(135deg, rgba(15,31,18,0.8) 0%, rgba(47,91,62,0.7) 100%)"))))))))
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px" }}>
          <RouterLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "auto" }}>
            {isMonari
              ? <span style={{ fontSize: 24 }}>🥮</span>
              : (isComTam 
              ? <span style={{ fontSize: 24 }}>🌾</span> 
              : (isSamHouse 
                  ? <Coffee size={24} style={{ color: "#BAAFA8" }} />
                  : (isMonQuanChat
                      ? <span style={{ fontSize: 24 }}>🍲</span>
                      : (isHoaTeaRoom
                          ? <span style={{ fontSize: 24 }}>🍃</span>
                          : (isEmCoffee
                              ? <Coffee size={24} style={{ color: "#D4A373" }} />
                              : (isTaoTao
                                  ? <Coffee size={24} style={{ color: "#D9534F" }} />
                                  : (isHanHuyen
                                      ? <Coffee size={24} style={{ color: "#7A9D83" }} />
                                      : (isCochin
                                        ? <Coffee size={24} style={{ color: "#A3DFB5" }} />
                                        : <Leaf size={24} style={{ color: "rgba(175,215,120,0.9)" }} />))))))))
            }
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>
              {tenant?.name || (isHanHuyen ? "Quán Nước Hàn Huyên" : (isCochin ? "Cochin Café" : "yakishime"))}
            </span>
          </RouterLink>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
            {isMonari
              ? "MONARI - Bánh ngọt thủ công & Trà thơm"
              : (isComTam 
              ? "Cơm Tấm Ngọ - Đậm đà chuẩn vị quê nhà" 
              : (isSamHouse ? "Cafe Sam Houses - Hương vị ấm cúng" : (isMonQuanChat ? "Món Quảng Chất - Đậm đà vị miền Trung" : (isHoaTeaRoom ? "Hòa Tea Room - Tinh hoa trà đạo Việt" : (isEmCoffee ? "Em Coffee - Góc nhỏ bình yên" : (isTaoTao ? "Táo Tào Cà Phê - Vị cà phê, không gian chữa lành" : (isHanHuyen ? "Quán Nước Hàn Huyên - Chút bình yên giữa phố thị" : (isCochin ? "Cochin Café - Nhà kính Bistro hiện đại" : "Trà đạo chính thống từ Uji, Kyoto"))))))))}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7 }}>
            Đăng nhập để đặt bàn, theo dõi lịch sử và viết đánh giá.
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
