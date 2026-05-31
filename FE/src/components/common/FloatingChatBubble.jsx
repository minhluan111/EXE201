import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, ChevronLeft, User, MessageSquare, Bell, Clock
} from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import {
  feedbackGetMy,
  feedbackCreate,
  adminGetFeedbacks,
  adminReplyFeedback
} from "../../services/apiClient.js";

export default function FloatingChatBubble() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatSubmitting, setChatSubmitting] = useState(false);

  // Manager-specific states
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeFeedbackId, setActiveFeedbackId] = useState(null); // Selected feedback for manager chat view
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);

  const chatEndRef = useRef(null);

  const isManager = user?.role === "manager";

  // ── USER: Load my feedbacks ──
  const loadUserChat = async (forceOpen = false) => {
    if (!token || isManager) return;
    setChatLoading(true);
    const res = await feedbackGetMy({ token });
    if (res.ok) {
      const data = res.data || [];
      setChatHistory(data);

      const currentlyOpen = isOpen || forceOpen;
      if (!currentlyOpen) {
        const lastSeen = localStorage.getItem(`chat_last_seen_${user?.id}`) || "1970-01-01T00:00:00.000Z";
        const unreadReplies = data.filter(f => {
          if (!f.reply || f.reply === "_") return false;
          return new Date(f.replyAt || f.created_at) > new Date(lastSeen);
        });
        const nextUnreadCount = unreadReplies.length;

        if (nextUnreadCount > unreadCount) {
          // Play soft notification sound
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
            audio.volume = 0.4;
            audio.play();
          } catch (e) {
            console.log("Audio play blocked by browser policy");
          }
        }
        setUnreadCount(nextUnreadCount);
      } else {
        // If chat bubble is open, mark all as seen
        const latestReply = data
          .filter(f => f.reply && f.reply !== "_" && f.replyAt)
          .sort((a, b) => new Date(b.replyAt) - new Date(a.replyAt))[0];
        
        if (latestReply) {
          localStorage.setItem(`chat_last_seen_${user?.id}`, latestReply.replyAt);
        } else if (data.length > 0) {
          localStorage.setItem(`chat_last_seen_${user?.id}`, new Date().toISOString());
        }
        setUnreadCount(0);
      }
    }
    setChatLoading(false);
  };

  // ── MANAGER: Load all feedbacks for support list ──
  const loadManagerFeedbacks = async () => {
    if (!token || !isManager) return;
    const res = await adminGetFeedbacks({ token });
    if (res.ok) {
      const data = res.data || [];
      setFeedbacks(data);
      
      // Calculate total number of unreplied feedbacks accurately
      const unread = data.filter(f => !f.reply).length;
      setUnreadCount(unread);

      // Play soft notification sound or flash if unread count increases
      if (unread > prevUnreadCount && prevUnreadCount > 0) {
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.volume = 0.4;
          audio.play();
        } catch (e) {
          console.log("Audio play blocked by browser policy");
        }
      }
      setPrevUnreadCount(unread);
    }
  };

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && token) {
      if (isManager) {
        loadManagerFeedbacks();
      } else {
        loadUserChat(true);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      if (isManager) {
        loadManagerFeedbacks();
      } else {
        loadUserChat();
      }
    } else {
      setChatHistory([]);
      setFeedbacks([]);
      setUnreadCount(0);
    }
    setIsOpen(false);
    setActiveFeedbackId(null);
  }, [token, user]);

  // Listen for feedback submissions from Contact page to update chat history in real-time
  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      if (token) {
        if (isManager) {
          loadManagerFeedbacks();
        } else {
          loadUserChat();
        }
      }
    };
    window.addEventListener("feedback-submitted", handleFeedbackSubmitted);
    return () => window.removeEventListener("feedback-submitted", handleFeedbackSubmitted);
  }, [token, isManager]);


  // Polling for both Manager and User to receive new messages/replies in real-time
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      if (isManager) {
        loadManagerFeedbacks();
      } else {
        loadUserChat(false);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(timer);
  }, [token, user, prevUnreadCount, isManager]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeFeedbackId]);

  // ── USER: Send support message ──
  const onUserSend = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    setChatSubmitting(true);
    const res = await feedbackCreate({
      token,
      title: "Tin nhắn hỗ trợ",
      content: chatText
    });
    setChatSubmitting(false);

    if (res.ok) {
      setChatText("");
      loadUserChat();
    }
  };

  // ── MANAGER: Send reply message ──
  const onManagerSend = async (e, id) => {
    e.preventDefault();
    if (!chatText.trim() || !id) return;

    // Find the active feedback item to append if a reply already exists
    const feedbackItem = feedbacks.find(f => f.id === id);
    const guestName = feedbackItem?.user?.full_name || feedbackItem?.guestName;

    // Find all feedbacks for this customer
    const allForGuest = feedbacks.filter(f => (f.user?.full_name || f.guestName) === guestName);
    // Find older unreplied feedbacks for this customer (to mark them as resolved in database)
    const olderUnreplied = allForGuest.filter(f => !f.reply && f.id !== id);

    const existingReply = feedbackItem?.reply;
    const finalReply = existingReply ? (existingReply + "|||" + chatText) : chatText;

    setChatSubmitting(true);
    // 1. Reply to the active feedback
    const res = await adminReplyFeedback({
      token,
      id,
      reply: finalReply
    });

    // 2. Automatically reply to older unreplied feedbacks with a placeholder "_"
    // to mark them as resolved in the database so the unread counts update correctly!
    if (res.ok && olderUnreplied.length > 0) {
      await Promise.all(
        olderUnreplied.map(fb => 
          adminReplyFeedback({
            token,
            id: fb.id,
            reply: "_"
          })
        )
      );
    }

    setChatSubmitting(false);

    if (res.ok) {
      setChatText("");
      // Refresh manager feedbacks
      await loadManagerFeedbacks();
    }
  };

  const activeFeedback = feedbacks.find(f => f.id === activeFeedbackId);
  const guestName = activeFeedback?.user?.full_name || activeFeedback?.guestName;

  const userThread = feedbacks
    .filter(f => (f.user?.full_name || f.guestName) === guestName)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const targetFeedback = userThread[userThread.length - 1];

  // Group unique customer conversations for the inbox list
  const groupedConversations = [];
  const seenGuests = new Set();
  
  feedbacks.forEach(f => {
    const name = f.user?.full_name || f.guestName || "Khách hàng";
    if (!seenGuests.has(name)) {
      seenGuests.add(name);
      const allForGuest = feedbacks.filter(item => (item.user?.full_name || item.guestName || "Khách hàng") === name);
      const hasUnreplied = allForGuest.some(item => !item.reply);

      // Find absolute latest text and time for the preview card
      let latestMessageText = f.content;
      let latestTime = f.created_at;

      if (f.reply && f.reply !== "_") {
        const replyParts = f.reply.split("|||").filter(p => p !== "_" && p.trim() !== "");
        if (replyParts.length > 0) {
          latestMessageText = `Bạn: ${replyParts[replyParts.length - 1]}`;
          latestTime = f.replyAt || f.created_at;
        }
      }

      groupedConversations.push({
        latestFeedback: f,
        guestName: name,
        hasUnreplied,
        created_at: latestTime,
        content: latestMessageText
      });
    }
  });


  // If path is login/register, don't show the bubble to keep login UI pristine
  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "Inter, sans-serif" }}>
      {/* ── FLOATING CHAT PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 80,
              right: 0,
              width: "360px",
              height: "500px",
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              boxSizing: "border-box"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px",
              background: "linear-gradient(135deg, var(--matcha), var(--forest))",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isManager && activeFeedbackId && (
                  <button 
                    onClick={() => setActiveFeedbackId(null)}
                    style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={16} />
                    {isManager 
                      ? (activeFeedbackId ? "Trả lời: " + activeFeedback?.user?.full_name : "Quản lý Hội Thoại") 
                      : "Yakishime Support 🍵"}
                  </h3>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                    Trực tuyến hỗ trợ
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
              {!token ? (
                /* ── NOT LOGGED IN VIEW ── */
                <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
                  <p style={{ fontSize: 44, margin: "0 0 12px" }}>🍵</p>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>Xin chào quý khách!</h4>
                  <p style={{ fontSize: 13, color: "var(--text-light)", lineHeight: 1.5, margin: "0 0 20px" }}>
                    Vui lòng đăng nhập tài khoản thành viên để kích hoạt tính năng chat hỗ trợ trực tuyến với nhà hàng.
                  </p>
                  <button
                    onClick={() => { setIsOpen(false); navigate("/login"); }}
                    style={{
                      background: "var(--matcha)", color: "#fff", border: "none",
                      padding: "10px 24px", borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(107,143,62,0.2)"
                    }}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              ) : isManager ? (
                /* ── MANAGER VIEW ── */
                !activeFeedbackId ? (
                  /* Conversation List */
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                    <h4 style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 12px" }}>
                      Hộp thư đến ({groupedConversations.filter(c => c.hasUnreplied).length} khách đợi)
                    </h4>
                    {groupedConversations.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                        Chưa có tin nhắn hỗ trợ nào từ khách hàng.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {groupedConversations.map((c) => {
                          return (
                            <div
                              key={c.latestFeedback.id}
                              onClick={() => {
                                setActiveFeedbackId(c.latestFeedback.id);
                                setChatText("");
                              }}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                padding: "12px 14px",
                                borderRadius: "14px",
                                border: !c.hasUnreplied ? "1px solid var(--border)" : "1.5px solid var(--matcha-light)",
                                background: !c.hasUnreplied ? "var(--bg-card)" : "rgba(107,143,62,0.06)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>
                                  {c.guestName}
                                </span>
                                <span style={{ 
                                  fontSize: 10, 
                                  padding: "2px 8px", 
                                  borderRadius: 50, 
                                  fontWeight: 700,
                                  background: !c.hasUnreplied ? "rgba(0,0,0,0.04)" : "var(--matcha)",
                                  color: !c.hasUnreplied ? "var(--text-muted)" : "#fff"
                                }}>
                                  {!c.hasUnreplied ? "Đã phản hồi" : "Mới"}
                                </span>
                              </div>
                              <p style={{
                                fontSize: 12.5,
                                color: "var(--text-muted)",
                                margin: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {c.content}
                              </p>
                              <span style={{ fontSize: 10, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock size={10} />
                                {new Date(c.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chat detail with user (timeline style like user view) */
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
                      {userThread.map((item) => (
                        <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* User Message (Left aligned for Manager) */}
                          <div style={{ alignSelf: "flex-start", maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, marginBottom: 4 }}>
                              {item.user?.full_name || "Khách hàng"}
                            </span>
                            <div style={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              padding: "10px 14px",
                              borderRadius: "18px 18px 18px 2px",
                              fontSize: 13.5,
                              lineHeight: 1.5,
                              boxShadow: "var(--shadow-sm)"
                            }}>
                              {item.content}
                            </div>
                            <span style={{ fontSize: 9.5, color: "var(--text-light)", marginTop: 4 }}>
                              {new Date(item.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Manager's Reply (Right aligned for Manager) */}
                          {item.reply && item.reply.split("|||").map((replyText, idx) => {
                            if (replyText === "_" || replyText.trim() === "") return null;
                            return (
                              <div key={idx} style={{ alignSelf: "flex-end", maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: "var(--matcha)", fontWeight: 700, marginBottom: 4 }}>
                                  🍵 Bạn (Manager)
                                </span>
                                <div style={{
                                  background: "var(--matcha)",
                                  color: "#fff",
                                  padding: "10px 14px",
                                  borderRadius: "18px 18px 2px 18px",
                                  fontSize: 13.5,
                                  lineHeight: 1.5,
                                  boxShadow: "0 2px 6px rgba(107,143,62,0.15)",
                                  textAlign: "left"
                                }}>
                                  {replyText}
                                </div>
                                <span style={{ fontSize: 9.5, color: "var(--text-light)", marginTop: 4 }}>
                                  {item.replyAt ? new Date(item.replyAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Send reply */}
                    <form onSubmit={(e) => onManagerSend(e, targetFeedback?.id)} style={{
                      display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)", background: "var(--bg-card)"
                    }}>
                      <input 
                        type="text"
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        placeholder={targetFeedback?.reply ? "Gửi phản hồi mới..." : `Trả lời tin: "${targetFeedback?.content.slice(0, 15)}..."`}
                        disabled={chatSubmitting || !targetFeedback}
                        style={{
                          flex: 1, padding: "10px 14px", borderRadius: 50,
                          border: "1px solid var(--border)", background: "var(--bg-alt)",
                          color: "var(--text)", fontSize: 13.5, outline: "none", boxSizing: "border-box"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      />
                      <button
                        type="submit"
                        disabled={chatSubmitting || !chatText.trim() || !targetFeedback}
                        style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "var(--matcha)", color: "#fff", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: (chatSubmitting || !chatText.trim() || !targetFeedback) ? 0.6 : 1, padding: 0
                        }}
                      >
                        <Send size={14} style={{ marginLeft: 1 }} />
                      </button>
                    </form>
                  </div>
                )
              ) : (
                /* ── REGULAR USER CHAT THREAD ── */
                <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {chatLoading && chatHistory.length === 0 ? (
                      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--text-light)", fontSize: 13 }}>
                        Đang tải cuộc trò chuyện...
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-light)", padding: 16, textAlign: "center" }}>
                        <p style={{ fontSize: 32, margin: "0 0 8px" }}>💬</p>
                        <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>Chưa có tin nhắn nào</p>
                        <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>Hãy nhắn tin hỗ trợ của bạn ở ô phía dưới để bắt đầu cuộc trò chuyện!</p>
                      </div>
                    ) : (
                      chatHistory.map((item) => (
                        <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* User Message */}
                          <div style={{ alignSelf: "flex-end", maxWidth: "85%", display: "flex", flexDirection: "column", alignContent: "flex-end", alignItems: "flex-end" }}>
                            <div style={{
                              background: "var(--matcha)",
                              color: "#fff",
                              padding: "10px 14px",
                              borderRadius: "18px 18px 2px 18px",
                              fontSize: 13.5,
                              lineHeight: 1.5,
                              boxShadow: "0 2px 6px rgba(107,143,62,0.12)",
                              textAlign: "left"
                            }}>
                              {item.content}
                            </div>
                            <span style={{ fontSize: 9.5, color: "var(--text-light)", marginTop: 3 }}>
                              {new Date(item.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Restaurant Reply */}
                          {item.reply && item.reply.split("|||").map((replyText, idx) => {
                            if (replyText === "_" || replyText.trim() === "") return null;
                            return (
                              <div key={idx} style={{ alignSelf: "flex-start", maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 4 }}>
                                <span style={{ fontSize: 10, color: "var(--matcha)", fontWeight: 700, marginBottom: 2 }}>
                                  🍵 Yakishime Manager
                                </span>
                                <div style={{
                                  background: "rgba(255, 255, 255, 0.04)",
                                  color: "var(--text)",
                                  border: "1px solid var(--border)",
                                  padding: "10px 14px",
                                  borderRadius: "18px 18px 18px 2px",
                                  fontSize: 13.5,
                                  lineHeight: 1.5,
                                  boxShadow: "var(--shadow-sm)",
                                  textAlign: "left"
                                }}>
                                  {replyText}
                                </div>
                                <span style={{ fontSize: 9.5, color: "var(--text-light)", marginTop: 3 }}>
                                  {item.replyAt ? new Date(item.replyAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Send chat message */}
                  <form onSubmit={onUserSend} style={{
                    display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)", background: "var(--bg-card)"
                  }}>
                    <input 
                      type="text"
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      disabled={chatSubmitting}
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: 50,
                        border: "1px solid var(--border)", background: "var(--bg-alt)",
                        color: "var(--text)", fontSize: 13.5, outline: "none", boxSizing: "border-box"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                    <button
                      type="submit"
                      disabled={chatSubmitting || !chatText.trim()}
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--matcha)", color: "#fff", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: (chatSubmitting || !chatText.trim()) ? 0.6 : 1, padding: 0
                      }}
                    >
                      <Send size={14} style={{ marginLeft: 1 }} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING BUBBLE BUTTON ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleOpen}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--matcha), var(--forest))",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(107,143,62,0.35)",
          position: "relative",
          outline: "none"
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}

        {/* Unread badge count for Manager & User */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              background: "#EF4444",
              color: "#fff",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(239,68,68,0.4)"
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
