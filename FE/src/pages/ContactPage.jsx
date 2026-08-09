import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Mail, Clock, Send, MessageSquare, AlertCircle, Sparkles, MessageCircle
} from "lucide-react";
import { restaurantInfoGet, feedbackCreate, feedbackGetMy } from "../services/apiClient.js";
import { useAuth } from "../context/useAuthContext.js";
import { useTenant } from "@/context/TenantContext";

export default function ContactPage() {
  const { user, token } = useAuth();
  const { tenant } = useTenant();
  const rawName = String(tenant?.name || "").toLowerCase();
  const tName = String(tenant?.tenantName || "").toLowerCase();

  const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || tName.includes("taotao");
  const isMonari = rawName.includes("monari") || tName.includes("monari");
  const isComGa = rawName.includes("cơm gà") || rawName.includes("ông bách") || tName.includes("comga");
  const isEmCoffee = rawName.includes("em coffee") || rawName.includes("em") || tName.includes("em");
  const isHanHuyen = rawName.includes("hàn huyên") || tName.includes("hanhuyen");
  const isCochin = rawName.includes("cochin") || tName.includes("cochin");
  const isComTam = rawName.includes("cơm tấm") || tName.includes("comtam");
  const isSamHouse = rawName.includes("sam house") || tName.includes("samhouse");
  const isMonQuanChat = rawName.includes("quảng") || tName.includes("monquanchat");
  const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || tName.includes("hoatearoom");
  const [info, setInfo] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await restaurantInfoGet();
      if (res.ok) setInfo(res.data);
    })();
  }, [tenant]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) return setError("Vui lòng đăng nhập để gửi phản hồi.");

    if (!title.trim()) return setError("Vui lòng nhập tiêu đề.");
    if (!content.trim()) return setError("Vui lòng nhập nội dung phản hồi.");

    setLoading(true);
    const res = await feedbackCreate({ token, title, content });
    setLoading(false);

    if (!res.ok) return setError(res.message || "Gửi phản hồi thất bại");
    setMessage("Cảm ơn bạn đã gửi đóng góp ý kiến cho quán. Ý kiến của bạn đã được gửi đến Manager!");
    setTitle("");
    setContent("");

    // Notify the floating chat bubble to update in real-time
    window.dispatchEvent(new Event("feedback-submitted"));
  };

  const mapUrl = isTaoTao
    ? "https://maps.google.com/maps?q=32A+Thống+Nhất,+Phường+10,+Gò+Vấp,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isMonari
    ? "https://maps.google.com/maps?q=250+Trần+Hưng+Đạo,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isComGa
    ? "https://maps.google.com/maps?q=146+Đường+GS1,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isEmCoffee
    ? "https://maps.google.com/maps?q=27+Võ+Văn+Ngân,+Linh+Chiểu,+Thủ+Đức,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isHanHuyen
    ? "https://maps.google.com/maps?q=45+Hàn+Huyên,+Bến+Nghé,+Quận+1,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isCochin
    ? "https://maps.google.com/maps?q=12+Đặng+Dung,+Tân+Định,+Quận+1,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isComTam
    ? "https://maps.google.com/maps?q=57+Nguyễn+Cư+Trinh,+Cần+Thơ&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isSamHouse
    ? "https://maps.google.com/maps?q=Đường+GS1,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isMonQuanChat
    ? "https://maps.google.com/maps?q=201+QL1K,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : isHoaTeaRoom
    ? "https://maps.google.com/maps?q=18/2+Đường+số+4,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : (info?.mapEmbedUrl || "https://maps.google.com/maps?q=57+Nguyễn+Cư+Trinh,+Cần+Thơ&t=&z=15&ie=UTF8&iwloc=&output=embed");

  if (!info) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)"
      }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, margin: 0 }}>Đang tải thông tin liên hệ...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        py: 48,
        padding: "60px 0",
        background: "linear-gradient(135deg, rgba(107,143,62,0.08) 0%, rgba(47,91,62,0.04) 100%)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div className="container-xl" style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(40px, 6vw, 56px)",
              fontWeight: 700,
              color: "var(--matcha)",
              textTransform: "uppercase",
              margin: "0 0 12px"
            }}>
              Liên Hệ
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 16, margin: 0 }}>
              Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp từ bạn
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "64px 0" }}>
        <div className="container-xl">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
            alignItems: "start"
          }}>
            {/* Left: Contact Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: "flex", flexDirection: "column", gap: 32 }}
            >
              {/* Info Card */}
              <div style={{
                background: "var(--bg-card)",
                borderRadius: 24,
                border: "1px solid var(--border)",
                padding: "36px 32px",
                boxShadow: "var(--shadow-sm)",
              }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26, fontWeight: 700, color: "var(--matcha)",
                  textTransform: "uppercase", margin: "0 0 24px",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <MessageSquare size={22} style={{ color: "var(--matcha)" }} />
                  Thông Tin Quán
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
                      {tenant?.name || info.name}
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={16} style={{ color: "var(--matcha)", flexShrink: 0 }} />
                      {tenant?.address || info.address}
                    </p>
                  </div>

                  <div style={{ paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 12, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hotline liên hệ</span>
                      <a
                        href={`tel:${tenant?.hotline || info.hotline}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          color: "var(--matcha)", fontWeight: 600, fontSize: 16,
                          textDecoration: "none", marginTop: 4, transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--forest)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--matcha)"}
                      >
                        <Phone size={16} />
                        {tenant?.hotline || info.hotline}
                      </a>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Thư điện tử</span>
                      <a
                        href={`mailto:${tenant?.email || info.email}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          color: "var(--matcha)", fontWeight: 600, fontSize: 16,
                          textDecoration: "none", marginTop: 4, transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--forest)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--matcha)"}
                      >
                        <Mail size={16} />
                        {tenant?.email || info.email}
                      </a>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Giờ mở cửa</span>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        color: "var(--text)", fontWeight: 600, fontSize: 15, marginTop: 4
                      }}>
                        <Clock size={16} style={{ color: "var(--matcha)" }} />
                        {tenant?.openHours || info.openHours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <div style={{
                background: "var(--bg-card)",
                borderRadius: 24,
                border: "1px solid var(--border)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}>
                <div style={{ borderBottom: "1px solid var(--border)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                  <MapPin size={20} style={{ color: "var(--matcha)" }} />
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, fontWeight: 700, color: "var(--matcha)",
                    textTransform: "uppercase", margin: 0
                  }}>
                    Vị Trí Cửa Hàng
                  </h2>
                </div>
                <iframe
                  title="map"
                  src={mapUrl}
                  style={{
                    width: "100%",
                    height: 320,
                    border: "none",
                    display: "block"
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Right Column: Feedback Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ height: "100%" }}
            >
              <div style={{
                background: "var(--bg-card)",
                borderRadius: 24,
                border: "1px solid var(--border)",
                padding: "36px 32px",
                boxShadow: "var(--shadow-sm)",
              }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26, fontWeight: 700, color: "var(--matcha)",
                  textTransform: "uppercase", margin: "0 0 24px",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <MessageSquare size={22} style={{ color: "var(--matcha)" }} />
                  Gửi Phản Hồi
                </h2>

                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
                      Tiêu đề phản hồi
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Vd: Ý kiến đóng góp sản phẩm, thái độ phục vụ..."
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: "1px solid var(--border)",
                        background: "var(--bg-card)", color: "var(--text)",
                        fontSize: 14, outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
                      Nội dung ý kiến
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={isComTam ? "Ý kiến đóng góp cụ thể của bạn để giúp Cơm Tấm Ngọ hoàn thiện hơn..." : (isSamHouse ? "Ý kiến đóng góp cụ thể của bạn để giúp Sam Houses hoàn thiện hơn..." : (isMonQuanChat ? "Ý kiến đóng góp cụ thể của bạn để giúp Món Quảng Chất hoàn thiện hơn..." : (isHoaTeaRoom ? "Ý kiến đóng góp cụ thể của bạn để giúp Hòa Tea Room hoàn thiện hơn..." : "Ý kiến đóng góp cụ thể của bạn để giúp Yakishime hoàn thiện hơn...")))}
                      rows={6}
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: "1px solid var(--border)",
                        background: "var(--bg-card)", color: "var(--text)",
                        fontSize: 14, resize: "none", fontFamily: "Inter, sans-serif",
                        outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#EF4444", fontSize: 14, display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <AlertCircle size={16} /> {error}
                    </motion.div>
                  )}

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "rgba(107,143,62,0.06)", border: "1px solid rgba(107,143,62,0.2)",
                        color: "var(--matcha)", fontSize: 14, display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      ✨ {message}
                    </motion.div>
                  )}

                  {token ? (
                    <div style={{
                      padding: "16px", borderRadius: 12,
                      background: "rgba(107,143,62,0.06)", border: "1px solid rgba(107,143,62,0.15)",
                      fontSize: 13.5, color: "var(--text-muted)", marginBottom: 4, lineHeight: 1.5
                    }}>
                      💡 <strong>Mẹo:</strong> Bạn có thể xem lại lịch sử phản hồi và chat trực tiếp với Manager qua <strong>bong bóng chat</strong> ở góc phải màn hình 🍵
                    </div>
                  ) : (
                    <div style={{
                      padding: "16px", borderRadius: 12,
                      background: "rgba(107,143,62,0.06)", border: "1px solid rgba(107,143,62,0.15)",
                      fontSize: 13.5, color: "var(--text-muted)", marginBottom: 4, lineHeight: 1.5
                    }}>
                      💡 <strong>Mẹo:</strong> Hãy <strong>Đăng nhập tài khoản</strong> để kích hoạt tính năng <strong>Chat trực tuyến & xem phản hồi trực tiếp</strong> từ Manager nhà hàng!
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "14px 28px", borderRadius: 50,
                      background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                      color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                      fontSize: 15, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: loading ? 0.7 : 1,
                      boxShadow: "0 4px 16px rgba(107,143,62,0.25)"
                    }}
                  >
                    <Send size={15} />
                    {loading ? "Đang gửi..." : "Gửi Phản Hồi"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
