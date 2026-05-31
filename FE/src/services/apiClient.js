const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:52818").replace(/\/$/, "");
const SESSION_KEY = "vizza.session";

const TABLE_LAYOUT = [
  { id: 1, name: "Bàn A1", area: "Window", max_seats: 2, coordinate_x: 10, coordinate_y: 10, shape: "pair" },
  { id: 2, name: "Bàn A2", area: "Corner", max_seats: 2, coordinate_x: 30, coordinate_y: 10, shape: "pair" },
  { id: 3, name: "Bàn A3", area: "Indoor", max_seats: 4, coordinate_x: 55, coordinate_y: 10, shape: "quad" },
  { id: 4, name: "Bàn A4", area: "Outdoor", max_seats: 4, coordinate_x: 75, coordinate_y: 10, shape: "quad" },
  { id: 5, name: "Bàn B1", area: "Window", max_seats: 2, coordinate_x: 10, coordinate_y: 40, shape: "pair" },
  { id: 6, name: "Bàn B2", area: "Corner", max_seats: 2, coordinate_x: 30, coordinate_y: 40, shape: "pair" },
  { id: 7, name: "Bàn B3", area: "Indoor", max_seats: 4, coordinate_x: 55, coordinate_y: 40, shape: "quad" },
  { id: 8, name: "Bàn B4", area: "Outdoor", max_seats: 4, coordinate_x: 75, coordinate_y: 40, shape: "quad" },
  { id: 9, name: "Bàn C1", area: "Window", max_seats: 2, coordinate_x: 10, coordinate_y: 68, shape: "pair" },
  { id: 10, name: "Bàn C2", area: "Corner", max_seats: 2, coordinate_x: 30, coordinate_y: 68, shape: "pair" },
  { id: 11, name: "Bàn C3", area: "Indoor", max_seats: 4, coordinate_x: 55, coordinate_y: 68, shape: "quad" },
  { id: 12, name: "Bàn C4", area: "Outdoor", max_seats: 4, coordinate_x: 75, coordinate_y: 68, shape: "quad" },
];

const FALLBACK_MENU_IMAGES = {
  Traditional: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  Latte: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  Food: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  Desserts: "https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=80",
};

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function mapUser(user) {
  if (!user) return null;
  const role = String(user.role || "").toLowerCase();
  return {
    id: user.id,
    full_name: user.fullName ?? user.full_name ?? "",
    fullName: user.fullName ?? user.full_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: role === "staff" ? "staff" : role === "admin" ? "admin" : role === "manager" ? "manager" : "user",
  };
}

function mapAuthResponse(data) {
  return {
    ok: true,
    token: data.accessToken,
    user: mapUser(data.user),
    expiresAt: data.expiresAt,
  };
}

function mapMenuCategory(category, name = "") {
  const value = String(category || "").toLowerCase();
  const lowerName = String(name || "").toLowerCase();

  if (lowerName.includes("hojicha")) {
    return "Hojicha";
  }

  if (lowerName.includes("tiramisu") || lowerName.includes("parfait") || lowerName.includes("cake") || lowerName.includes("dessert")) {
    return "Desserts";
  }

  if (value.includes("snack") || lowerName.includes("croissant") || lowerName.includes("mochi")) {
    return "Food";
  }

  if (value.includes("drink") || value.includes("coffee") || lowerName.includes("cà phê") || lowerName.includes("bạc xỉu")) {
    return "Traditional";
  }

  return "Latte";
}

function mapMenuTag(tag) {
  const value = String(tag || "").toLowerCase();
  if (value.includes("best")) return "best_seller";
  if (value.includes("trend")) return "trending";
  if (value.includes("sig")) return "signature";
  if (value.includes("new")) return "new";
  return "normal";
}

function mapMenuItem(item, avgRating = 0) {
  const category = mapMenuCategory(item.category, item.name);
  const imageUrl = item.imageUrl || item.image_url || FALLBACK_MENU_IMAGES[category] || FALLBACK_MENU_IMAGES.Latte;

  return {
    id: item.id,
    name: item.name,
    category,
    image_url: imageUrl,
    imageUrl,
    price: Number(item.price || 0),
    description: item.description || "",
    tag: mapMenuTag(item.tag),
    sales_count: Number(item.salesCount || item.sales_count || 0),
    salesCount: Number(item.salesCount || item.sales_count || 0),
    avg_rating: avgRating,
  };
}

function mapReview(review) {
  if (!review) return null;
  const guestName = review.guestName ?? review.guest_name ?? review.GuestName ?? "";
  const commentText = review.comment ?? review.Comment ?? "";
  const ratingValue = review.rating ?? review.Rating ?? 5;
  const menuItemId = review.menuItemId ?? review.menuItem_id ?? review.menu_id ?? review.MenuItemId ?? null;
  const createdAt = review.createdAt ?? review.created_at ?? review.CreatedAt;

  return {
    id: review.id ?? review.Id,
    user_id: review.userId ?? review.user_id ?? review.UserId ?? null,
    menu_id: menuItemId,
    rating: Number(ratingValue),
    comment: commentText,
    reply: review.reply ?? review.Reply ?? null,
    replyAt: review.replyAt ?? review.reply_at ?? review.ReplyAt ?? null,
    created_at: createdAt,
    user: guestName
      ? { id: null, full_name: guestName }
      : review.user
        ? { id: review.user.id ?? null, full_name: review.user.full_name ?? review.user.fullName ?? review.user.FullName ?? "" }
        : { id: null, full_name: "Khách hàng" },
  };
}

function mapFeedback(feedback) {
  return {
    id: feedback.id,
    title: feedback.title,
    content: feedback.content,
    reply: feedback.reply || null,
    replyAt: feedback.replyAt ?? feedback.reply_at ?? null,
    created_at: feedback.createdAt ?? feedback.created_at,
    user: { full_name: feedback.guestName || "Khách hàng" },
  };
}

function normalizeTime(value) {
  const text = String(value || "");
  return text.length >= 5 ? text.slice(0, 5) : text;
}

function statusFromReservation(status) {
  const value = String(status || "").toLowerCase();
  if (value === "cancelled") return "cancelled";
  if (value === "completed") return "completed";
  if (value === "seated") return "completed";
  if (value === "noshow") return "noshow";
  return "confirmed";
}

function pickAreaMap(seatingAreas) {
  const areas = Array.isArray(seatingAreas) ? seatingAreas : [];
  const twoSeat = areas.filter((area) => /2-?seat/i.test(String(area.tableType || "")));
  const fourSeat = areas.filter((area) => /4-?seat/i.test(String(area.tableType || "")));

  return {
    Window: twoSeat.find((area) => String(area.area || "").toLowerCase() === "window") || twoSeat[0] || null,
    Corner: twoSeat.find((area) => String(area.area || "").toLowerCase() === "corner") || twoSeat[1] || twoSeat[0] || null,
    Indoor: fourSeat.find((area) => String(area.area || "").toLowerCase() === "indoor") || fourSeat[0] || null,
    Outdoor: fourSeat.find((area) => String(area.area || "").toLowerCase() === "outdoor") || fourSeat[1] || fourSeat[0] || null,
  };
}

async function requestJson(path, options = {}) {
  const url = new URL(path, API_BASE_URL);
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    console.error("Network error fetching API:", err);
    return { ok: false, message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng." };
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    let message = data?.message;
    if (!message && data?.errors && typeof data.errors === "object") {
      message = Object.values(data.errors)
        .flatMap((arr) => (Array.isArray(arr) ? arr : [arr]))
        .join(" ");
    }
    if (!message) {
      message = data?.title || data?.detail || (typeof data === "string" ? data : "Request failed");
    }
    return { ok: false, message };
  }

  return { ok: true, data };
}

async function getSeatingAreas() {
  const result = await requestJson("/api/public/seating-areas");
  return result.ok ? result.data : [];
}

async function getTablesWithAreas() {
  const seatingAreas = await getSeatingAreas();
  const areaMap = pickAreaMap(seatingAreas);

  return TABLE_LAYOUT.map((table) => {
    const area = areaMap[table.area] || null;
    return {
      ...table,
      seatingAreaId: area?.id || null,
      seating_area_id: area?.id || null,
      seatingArea: area,
      status: "available",
    };
  });
}

function buildReservationTable(reservation, tables = TABLE_LAYOUT) {
  const tName = reservation.tableName || reservation.table_name;
  if (tName) {
    const match = tables.find((table) => table.name === tName);
    if (match) return { ...match };
  }
  const match = tables.find((table) => table.seatingAreaId === reservation.seatingAreaId)
    || tables.find((table) => table.area === reservation.seatingAreaArea)
    || tables[0]
    || null;

  return match ? { ...match } : null;
}

function normalizeReservation(reservation, tables = TABLE_LAYOUT) {
  const table = buildReservationTable(reservation, tables);
  return {
    id: reservation.id,
    reservation_code: reservation.reservationCode,
    reservationCode: reservation.reservationCode,
    guest_name: reservation.guestName,
    guestName: reservation.guestName,
    guest_email: reservation.guestEmail,
    guestEmail: reservation.guestEmail,
    guest_phone: reservation.guestPhone,
    guestPhone: reservation.guestPhone,
    seatingAreaId: reservation.seatingAreaId,
    seating_area_id: reservation.seatingAreaId,
    seating_area_table_type: reservation.seatingAreaTableType,
    seatingAreaTableType: reservation.seatingAreaTableType,
    seating_area_area: reservation.seatingAreaArea,
    seatingAreaArea: reservation.seatingAreaArea,
    booking_date: String(reservation.reservationDate || ""),
    booking_time: normalizeTime(reservation.startTime),
    reservation_date: String(reservation.reservationDate || ""),
    start_time: normalizeTime(reservation.startTime),
    end_time: normalizeTime(reservation.endTime),
    num_of_people: Number(reservation.guestCount || 0),
    guestCount: Number(reservation.guestCount || 0),
    status: statusFromReservation(reservation.status),
    special_note: reservation.specialNote || "",
    note: reservation.specialNote || "",
    created_at: reservation.createdAt,
    createdAt: reservation.createdAt,
    table,
  };
}

function sessionUser() {
  return readSession()?.user || null;
}

function currentToken() {
  return readSession()?.token || null;
}

// AUTH
export async function authRegister({ full_name, email, phone, password }) {
  const result = await requestJson("/api/auth/register", {
    method: "POST",
    body: { fullName: full_name, email, phone, password, confirmPassword: password },
  });

  if (!result.ok) return result;

  const payload = mapAuthResponse(result.data);
  writeSession({ token: payload.token, user: payload.user });
  return payload;
}

export async function authLogin({ login, password }) {
  const value = String(login || "").trim();
  if (!value.includes("@")) {
    return { ok: false, message: "BE hiện chỉ hỗ trợ đăng nhập bằng email." };
  }

  const result = await requestJson("/api/auth/login", {
    method: "POST",
    body: { email: value, password },
  });

  if (!result.ok) return result;

  const payload = mapAuthResponse(result.data);
  writeSession({ token: payload.token, user: payload.user });
  return payload;
}

export async function authLogout() {
  writeSession(null);
  return { ok: true };
}

export async function authMe(token) {
  const result = await requestJson("/api/auth/me", { token: token || currentToken() });
  if (!result.ok) return result;
  return { ok: true, user: mapUser(result.data) };
}

export async function menuList({ q = "", category = "all", tag = "all" } = {}) {
  const [menuResult, reviewsResult] = await Promise.all([
    requestJson("/api/public/menu"),
    requestJson("/api/public/reviews")
  ]);

  if (!menuResult.ok) return menuResult;

  const reviewsList = reviewsResult.ok && Array.isArray(reviewsResult.data) ? reviewsResult.data : [];
  
  // Group reviews by menuItemId
  const ratingsByMenuId = {};
  reviewsList.forEach(review => {
    const mId = review.menuItemId || review.menuItem_id || review.menu_id || review.MenuItemId;
    if (!mId) return;
    const rating = Number(review.rating || review.Rating || 0);
    if (!ratingsByMenuId[mId]) {
      ratingsByMenuId[mId] = { sum: 0, count: 0 };
    }
    ratingsByMenuId[mId].sum += rating;
    ratingsByMenuId[mId].count += 1;
  });

  const rawItems = Array.isArray(menuResult.data) ? menuResult.data : [];
  const items = rawItems.map((item) => {
    const stats = ratingsByMenuId[item.id];
    const avgRating = stats && stats.count > 0
      ? Math.round((stats.sum / stats.count) * 10) / 10
      : 0;
    return mapMenuItem(item, avgRating);
  });

  const query = q.trim().toLowerCase();
  return {
    ok: true,
    data: items
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => tag === "all" || item.tag === tag)
      .filter((item) => !query || `${item.name} ${item.description}`.toLowerCase().includes(query)),
  };
}

export async function menuDetail({ id }) {
  const result = await requestJson(`/api/public/menu/${id}`);
  if (!result.ok) return result;

  const reviews = await menuReviews({ id });
  const avgRating = reviews.ok && reviews.data.length
    ? Math.round((reviews.data.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.data.length) * 10) / 10
    : 0;

  return { ok: true, data: mapMenuItem(result.data, avgRating) };
}

export async function menuReviews({ id }) {
  const result = await requestJson("/api/public/reviews", { query: { menuItemId: id } });
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map(mapReview) : [];
  return { ok: true, data };
}

export async function reviewCreate({ token, menu_id, rating, comment }) {
  const user = sessionUser();
  const bearer = token || currentToken();

  if (!bearer || !user) {
    return { ok: false, message: "Vui lòng đăng nhập để gửi đánh giá." };
  }

  const result = await requestJson("/api/public/reviews", {
    method: "POST",
    body: {
      guestName: user.full_name,
      guestEmail: user.email,
      guestPhone: user.phone,
      menuItemId: menu_id,
      rating: Number(rating),
      comment: String(comment || "").trim(),
    },
  });

  if (!result.ok) return result;
  return { ok: true, data: mapReview(result.data) };
}

// TABLES & BOOKING
export async function tablesList() {
  return { ok: true, data: await getTablesWithAreas() };
}

export async function bookingCheckStatus({ booking_date, booking_time, guestCount }) {
  const tables = await getTablesWithAreas();
  
  // 1. Fetch available areas
  const availResult = await requestJson("/api/public/availability", {
    query: { date: booking_date, guestCount: guestCount ?? 2 },
  });
  if (!availResult.ok) return availResult;

  // 2. Fetch explicitly occupied table names
  const occupiedResult = await requestJson("/api/public/occupied-tables", {
    query: { date: booking_date, time: normalizeTime(booking_time) },
  });
  const occupiedTables = occupiedResult.ok && Array.isArray(occupiedResult.data) ? occupiedResult.data : [];

  const availability = Array.isArray(availResult.data) ? availResult.data : [];
  const targetTime = normalizeTime(booking_time);
  const allowedAreaIds = new Set(
    availability
      .filter((area) => Array.isArray(area.availableSlots) && area.availableSlots.some((slot) => normalizeTime(slot.startTime) === targetTime))
      .map((area) => area.seatingAreaId),
  );

  return {
    ok: true,
    data: tables.map((table) => {
      let status = "occupied";
      if (table.seatingAreaId && allowedAreaIds.has(table.seatingAreaId)) {
        status = occupiedTables.includes(table.name) ? "occupied" : "available";
      }
      return {
        ...table,
        status,
      };
    }),
  };
}

export async function bookingCreate({ token, table_id, booking_date, booking_time, num_of_people, note }) {
  const bearer = token || currentToken();
  const user = sessionUser();
  if (!bearer || !user) return { ok: false, message: "Vui lòng đăng nhập để đặt bàn." };

  const tables = await getTablesWithAreas();
  const table = tables.find((item) => String(item.id) === String(table_id));
  if (!table?.seatingAreaId) return { ok: false, message: "Không tìm thấy khu vực bàn phù hợp." };

  const result = await requestJson("/api/reservations", {
    method: "POST",
    body: {
      seatingAreaId: table.seatingAreaId,
      reservationDate: booking_date,
      startTime: normalizeTime(booking_time),
      guestCount: Number(num_of_people),
      tableName: table.name,
      specialNote: String(note || "").trim(),
      guestName: user.full_name,
      guestEmail: user.email,
      guestPhone: user.phone,
    },
  });

  if (!result.ok) return result;
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

export async function bookingMe({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const tables = await getTablesWithAreas();
  const result = await requestJson("/api/reservations/me", { token: bearer });
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map((reservation) => normalizeReservation(reservation, tables)) : [];
  return { ok: true, data };
}

export async function bookingCancel({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/reservations/${id}/cancel`, {
    method: "PATCH",
    token: bearer,
  });

  if (!result.ok) return result;

  const refreshed = await requestJson(`/api/reservations/${id}`, { token: bearer });
  if (refreshed.ok) {
    const tables = await getTablesWithAreas();
    return { ok: true, data: normalizeReservation(refreshed.data, tables) };
  }

  return { ok: true, data: { id, status: "cancelled" } };
}

// RESTAURANT INFO & FEEDBACK
export async function restaurantInfoGet() {
  const result = await requestJson("/api/public/restaurant-info");
  if (!result.ok) return result;

  const mapEmbedUrl = result.data.mapUrl && result.data.mapUrl.includes("embed")
    ? result.data.mapUrl
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0976527581177!2d105.85012547596531!3d21.02877968778001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x862b2fb23497d397!2zSG_DoG4gS2nhur9tLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1717056000000!5m2!1svi!2s";

  return {
    ok: true,
    data: {
      name: "Yaki Café",
      address: result.data.address,
      hotline: result.data.phone,
      email: "hello@yakicafe.local",
      openHours: result.data.openingHours,
      mapEmbedUrl,
    },
  };
}

export async function feedbackCreate({ token, title, content }) {
  const bearer = token || currentToken();
  const user = sessionUser();
  if (!bearer || !user) return { ok: false, message: "Vui lòng đăng nhập để gửi phản hồi." };

  const result = await requestJson("/api/public/feedbacks", {
    method: "POST",
    body: {
      guestName: user.full_name,
      guestEmail: user.email,
      guestPhone: user.phone,
      title,
      content,
    },
  });

  if (!result.ok) return result;
  return { ok: true, data: mapFeedback(result.data) };
}

export async function adminGetFeedbacks({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson("/api/public/feedbacks", { token: bearer });
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map(mapFeedback) : [];
  return { ok: true, data };
}

export async function adminReplyFeedback({ token, id, reply }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/public/feedbacks/${id}/reply`, {
    method: "PATCH",
    token: bearer,
    body: { reply },
  });

  if (!result.ok) return result;
  return { ok: true, data: mapFeedback(result.data) };
}

export async function feedbackGetMy({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson("/api/public/feedbacks/my", { token: bearer });
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map(mapFeedback) : [];
  return { ok: true, data };
}

export async function adminGetStats({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/stats", { token: bearer });
}

export async function adminGetBookings({ token, date, status, search, page, pageSize }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const query = {};
  if (date) query.date = date;
  if (status) query.status = status;
  if (search) query.search = search;
  if (page) query.page = page;
  if (pageSize) query.pageSize = pageSize;

  const result = await requestJson("/api/admin/reservations", {
    token: bearer,
    query,
  });

  if (!result.ok) return result;

  const tables = await getTablesWithAreas();
  const data = Array.isArray(result.data?.items)
    ? result.data.items.map((r) => normalizeReservation(r, tables))
    : [];

  return { ok: true, data, total: result.data?.totalCount ?? 0 };
}

export async function adminUpdateBookingStatus({ token, id, status }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/reservations/${id}/status`, {
    method: "PATCH",
    token: bearer,
    body: { status },
  });
}

export async function getTestimonials() {
  const result = await requestJson("/api/public/reviews");
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map(mapReview) : [];
  return { ok: true, data };
}

export async function adminGetUsers({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/users", { token: bearer });
}

export async function adminUpdateUserRole({ token, id, role }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    token: bearer,
    body: { role },
  });
}

export async function adminDeleteUser({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/users/${id}`, {
    method: "DELETE",
    token: bearer,
  });
}

// ADMIN MENU MANAGEMENT
export async function adminGetMenu({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/menu", { token: bearer });
}

export async function adminCreateMenuItem({ token, item }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/menu", {
    method: "POST",
    token: bearer,
    body: item,
  });
}

export async function adminUpdateMenuItem({ token, id, item }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/menu/${id}`, {
    method: "PUT",
    token: bearer,
    body: item,
  });
}

export async function adminDeleteMenuItem({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/menu/${id}`, {
    method: "DELETE",
    token: bearer,
  });
}

// ADMIN SEATING AREAS MANAGEMENT
export async function adminGetSeatingAreas({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/seating-areas", { token: bearer });
}

export async function adminCreateSeatingArea({ token, area }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/seating-areas", {
    method: "POST",
    token: bearer,
    body: area,
  });
}

export async function adminUpdateSeatingArea({ token, id, area }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/seating-areas/${id}`, {
    method: "PUT",
    token: bearer,
    body: area,
  });
}

export async function adminDeleteSeatingArea({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson(`/api/admin/seating-areas/${id}`, {
    method: "DELETE",
    token: bearer,
  });
}

// ADMIN REVIEWS MANAGEMENT
export async function adminGetReviews({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/reviews", { token: bearer });
}

export async function adminReplyReview({ token, id, reply }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/public/reviews/${id}/reply`, {
    method: "PATCH",
    token: bearer,
    body: { reply },
  });

  if (!result.ok) return result;
  return { ok: true, data: mapReview(result.data) };
}