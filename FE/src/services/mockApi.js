// FE mock API (in-memory + localStorage persistence)
// Provides endpoints-like async functions for the whole app.

const LS_KEYS = {
  users: "vizza.users",
  session: "vizza.session",
  menu: "vizza.menu",
  reviews: "vizza.reviews",
  tables: "vizza.tables",
  bookings: "vizza.bookings",
  feedbacks: "vizza.feedbacks",
};

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function readLS(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  return safeJsonParse(raw, fallback);
}

function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function delay(ms = 450) {
  return new Promise((res) => setTimeout(res, ms));
}

function hashPasswordMock(pw) {
  // Mock only (NOT secure). For demo.
  let h = 0;
  for (let i = 0; i < pw.length; i++)
    h = (h * 31 + pw.charCodeAt(i)) % 1000000007;
  return `mock$${h}`;
}

const restaurantInfo = {
  name: "VIZZA Restaurant",
  address: "123 Đường Demo, Quận 1, TP.HCM",
  hotline: "0909 123 456",
  email: "support@vizza.vn",
  openHours: "08:00 - 22:00",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Ho%20Chi%20Minh%20City&output=embed",
};

function seedMenu() {
  const seeded = [
    {
      id: 1,
      name: "Cà phê sữa đá",
      category: "Đồ uống",
      image_url: "/src/assets/images/image.png",
      price: 45000,
      description: "Hương vị đậm đà, thơm ngon chuẩn quán.",
      tag: "best_seller",
      sales_count: 1530,
      ingredients: ["Cà phê", "Sữa", "Đá"],
    },
    {
      id: 2,
      name: "Trà đào cam sả",
      category: "Đồ uống",
      image_url: "/src/assets/images/image.png",
      price: 59000,
      description: "Mát lạnh, sảng khoái với vị đào cam sả.",
      tag: "trending",
      sales_count: 920,
      ingredients: ["Trà", "Đào", "Cam", "Sả"],
    },
    {
      id: 3,
      name: "Pizza Hải sản",
      category: "Món chính",
      image_url: "/src/assets/images/image.png",
      price: 129000,
      description: "Đế mỏng giòn, topping hải sản phong phú.",
      tag: "best_seller",
      sales_count: 680,
      ingredients: ["Hải sản", "Phô mai", "Sốt cà chua"],
    },
    {
      id: 4,
      name: "Salad Caesar",
      category: "Món khai vị",
      image_url: "/src/assets/images/image.png",
      price: 99000,
      description: "Rau tươi trộn sốt Caesar béo ngậy.",
      tag: "normal",
      sales_count: 210,
      ingredients: ["Xà lách", "Phô mai", "Sốt Caesar"],
    },
    {
      id: 5,
      name: "Kem vani",
      category: "Món tráng miệng",
      image_url: "/src/assets/images/image.png",
      price: 55000,
      description: "Ngọt dịu, thơm mùi vani.",
      tag: "trending",
      sales_count: 370,
      ingredients: ["Vani", "Sữa"],
    },
  ];

  return seeded;
}

function seedTables() {
  // coordinate grid for map.
  // tables: single (max_seats 2), double (4).
  return [
    {
      id: 1,
      name: "Bàn 1",
      area: "Tầng trệt",
      max_seats: 2,
      coordinate_x: 60,
      coordinate_y: 80,
      shape: "pair",
    },
    {
      id: 2,
      name: "Bàn 2",
      area: "Tầng trệt",
      max_seats: 4,
      coordinate_x: 220,
      coordinate_y: 80,
      shape: "quad",
    },
    {
      id: 3,
      name: "Bàn 3",
      area: "Tầng trệt",
      max_seats: 2,
      coordinate_x: 380,
      coordinate_y: 80,
      shape: "pair",
    },
    {
      id: 4,
      name: "Bàn 4",
      area: "Tầng trệt",
      max_seats: 4,
      coordinate_x: 60,
      coordinate_y: 220,
      shape: "quad",
    },
    {
      id: 5,
      name: "Bàn 5",
      area: "Tầng trệt",
      max_seats: 2,
      coordinate_x: 220,
      coordinate_y: 220,
      shape: "pair",
    },
    {
      id: 6,
      name: "Bàn 6",
      area: "Tầng trệt",
      max_seats: 4,
      coordinate_x: 380,
      coordinate_y: 220,
      shape: "quad",
    },
    {
      id: 7,
      name: "Bàn 7",
      area: "Tầng trệt",
      max_seats: 2,
      coordinate_x: 60,
      coordinate_y: 360,
      shape: "pair",
    },
    {
      id: 8,
      name: "Bàn 8",
      area: "Tầng trệt",
      max_seats: 4,
      coordinate_x: 220,
      coordinate_y: 360,
      shape: "quad",
    },
  ];
}

function seedUsers() {
  return [
    {
      id: 1,
      full_name: "Demo User",
      email: "demo@vizza.vn",
      phone: "0909123456",
      password: hashPasswordMock("123456"),
      role: "customer",
    },
    {
      id: 2,
      full_name: "Admin",
      email: "admin@vizza.vn",
      phone: "0999888777",
      password: hashPasswordMock("admin123"),
      role: "admin",
    },
  ];
}

function seedReviews() {
  return [
    {
      id: 1,
      user_id: 1,
      menu_id: 1,
      rating: 5,
      comment: "Ngon và đậm vị!",
      created_at: nowIso(),
    },
    {
      id: 2,
      user_id: 1,
      menu_id: 2,
      rating: 4,
      comment: "Rất mát, uống thích.",
      created_at: nowIso(),
    },
    {
      id: 3,
      user_id: 1,
      menu_id: 3,
      rating: 5,
      comment: "Hải sản nhiều, ăn vui!",
      created_at: nowIso(),
    },
  ];
}

function makeRandomBookings(tables) {
  const today = new Date();
  const d = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 1);
  const dateStr = d.toISOString().slice(0, 10);
  const times = ["12:00", "13:00", "18:00", "19:00"];

  const existing = [];
  let id = 1;
  for (let t of times) {
    const shuffled = [...tables].sort(() => Math.random() - 0.5);
    const pick = shuffled.slice(0, 2);
    for (let table of pick) {
      existing.push({
        id: id++,
        user_id: 1,
        table_id: table.id,
        booking_date: dateStr,
        booking_time: t,
        num_of_people: table.max_seats,
        status: "confirmed",
        note: "Seed booking",
        created_at: nowIso(),
      });
    }
  }
  return existing;
}

function ensureSeeded() {
  const menu = readLS(LS_KEYS.menu, null);
  if (!menu) writeLS(LS_KEYS.menu, seedMenu());

  const tables = readLS(LS_KEYS.tables, null);
  if (!tables) writeLS(LS_KEYS.tables, seedTables());

  const users = readLS(LS_KEYS.users, null);
  if (!users) writeLS(LS_KEYS.users, seedUsers());

  const reviews = readLS(LS_KEYS.reviews, null);
  if (!reviews) writeLS(LS_KEYS.reviews, seedReviews());

  const bookings = readLS(LS_KEYS.bookings, null);
  if (!bookings) writeLS(LS_KEYS.bookings, makeRandomBookings(seedTables()));

  const feedbacks = readLS(LS_KEYS.feedbacks, null);
  if (!feedbacks) writeLS(LS_KEYS.feedbacks, []);
}

ensureSeeded();

function authGetSession() {
  return readLS(LS_KEYS.session, null);
}

function authSetSession(session) {
  writeLS(LS_KEYS.session, session);
}

function genToken(userId) {
  return `token_${userId}_${Math.random().toString(16).slice(2)}`;
}

function requireToken(token) {
  if (!token) return { ok: false, message: "Unauthorized" };
  const session = authGetSession();
  if (!session || session.token !== token)
    return { ok: false, message: "Unauthorized" };
  return { ok: true, user: session.user };
}

// =====================
// Auth
// =====================
export async function authRegister({ full_name, email, phone, password }) {
  await delay();
  const users = readLS(LS_KEYS.users, []);

  const emailExists = users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (emailExists) return { ok: false, message: "Email đã tồn tại." };

  const phoneExists = users.some((u) => u.phone === phone);
  if (phoneExists) return { ok: false, message: "Số điện thoại đã tồn tại." };

  const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
  const user = {
    id: nextId,
    full_name,
    email,
    phone,
    password: hashPasswordMock(password),
    role: "customer",
  };

  users.push(user);
  writeLS(LS_KEYS.users, users);

  const token = genToken(user.id);
  authSetSession({
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return { ok: true, token, user: authGetSession().user };
}

export async function authLogin({ login, password }) {
  await delay();
  const users = readLS(LS_KEYS.users, []);
  const isEmail = login.includes("@");

  const user = users.find((u) => {
    if (isEmail) return u.email.toLowerCase() === login.toLowerCase();
    return u.phone === login;
  });

  if (!user) return { ok: false, message: "Tài khoản không tồn tại." };
  if (user.password !== hashPasswordMock(password))
    return {
      ok: false,
      message: "Số điện thoại hoặc mật khẩu không chính xác.",
    };

  const token = genToken(user.id);
  authSetSession({
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return { ok: true, token, user: authGetSession().user };
}

export async function authLogout() {
  await delay(200);
  localStorage.removeItem(LS_KEYS.session);
  return { ok: true };
}

export async function authMe(token) {
  await delay(150);
  const res = requireToken(token);
  if (!res.ok) return res;
  return { ok: true, user: res.user };
}

// =====================
// Menu
// =====================
export async function menuList({ q = "", category = "all", tag = "all" } = {}) {
  await delay();
  const menu = readLS(LS_KEYS.menu, []);

  const query = q.trim().toLowerCase();
  return {
    ok: true,
    data: menu
      .filter((m) => (category === "all" ? true : m.category === category))
      .filter((m) => (tag === "all" ? true : m.tag === tag))
      .filter((m) =>
        query
          ? (m.name + " " + m.description).toLowerCase().includes(query)
          : true,
      )
      .map((m) => ({
        ...m,
        avg_rating: calcAvgRatingForMenu(m.id),
      })),
  };
}

export async function menuDetail({ id }) {
  await delay();
  const menu = readLS(LS_KEYS.menu, []);
  const item = menu.find((m) => m.id === Number(id));
  if (!item) return { ok: false, message: "Menu not found" };
  return {
    ok: true,
    data: {
      ...item,
      avg_rating: calcAvgRatingForMenu(item.id),
    },
  };
}

export async function menuReviews({ id }) {
  await delay(350);
  const reviews = readLS(LS_KEYS.reviews, []);
  const users = readLS(LS_KEYS.users, []);
  const list = reviews
    .filter((r) => r.menu_id === Number(id))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((r) => {
      const u = users.find((x) => x.id === r.user_id);
      return { ...r, user: u ? { id: u.id, full_name: u.full_name } : null };
    });

  return { ok: true, data: list };
}

// =====================
// Reviews
// =====================
export async function reviewCreate({ token, menu_id, rating, comment }) {
  await delay(420);

  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const reviews = readLS(LS_KEYS.reviews, []);

  const nextId = Math.max(0, ...reviews.map((r) => r.id)) + 1;

  const newReview = {
    id: nextId,
    user_id: auth.user.id,
    menu_id: Number(menu_id),
    rating: Number(rating),
    comment: String(comment ?? "").trim(),
    created_at: nowIso(),
  };

  reviews.push(newReview);
  writeLS(LS_KEYS.reviews, reviews);

  return { ok: true, data: newReview };
}

// =====================
// Tables & Booking
// =====================
export async function tablesList() {
  await delay(250);
  return { ok: true, data: readLS(LS_KEYS.tables, []) };
}

function bookingsForSlot({ booking_date, booking_time }) {
  const bookings = readLS(LS_KEYS.bookings, []);
  return bookings.filter(
    (b) =>
      b.booking_date === booking_date &&
      b.booking_time === booking_time &&
      b.status !== "cancelled",
  );
}

export async function bookingCheckStatus({ booking_date, booking_time }) {
  await delay(420);
  const tables = readLS(LS_KEYS.tables, []);
  const bookings = bookingsForSlot({ booking_date, booking_time });

  const occupiedTableIds = new Set(bookings.map((b) => b.table_id));

  return {
    ok: true,
    data: tables.map((t) => ({
      ...t,
      status: occupiedTableIds.has(t.id) ? "occupied" : "available",
    })),
  };
}

function canCancelBooking({ booking }) {
  if (!booking) return { ok: false, message: "Booking not found" };
  if (booking.status === "cancelled")
    return { ok: false, message: "Already cancelled" };

  const slot = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
  const diffMs = slot.getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1)
    return { ok: false, message: "Cannot modify/cancel before 1 hour." };
  return { ok: true };
}

export async function bookingCreate({
  token,
  table_id,
  booking_date,
  booking_time,
  num_of_people,
  note,
}) {
  await delay(520);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const tables = readLS(LS_KEYS.tables, []);
  const table = tables.find((t) => t.id === Number(table_id));
  if (!table) return { ok: false, message: "Table not found" };

  // enforce rule: people=1/2 -> pair, people=3/4 -> quad (>=3)
  const allowed =
    num_of_people <= 2 ? table.max_seats === 2 : table.max_seats === 4;
  if (!allowed)
    return { ok: false, message: "Selected table does not match guest count." };

  const statusRes = await bookingCheckStatus({ booking_date, booking_time });
  const tableStatus = statusRes.data.find((t) => t.id === Number(table_id));
  if (!tableStatus || tableStatus.status !== "available")
    return { ok: false, message: "Table already occupied." };

  const bookings = readLS(LS_KEYS.bookings, []);
  const nextId = Math.max(0, ...bookings.map((b) => b.id)) + 1;

  const newBooking = {
    id: nextId,
    user_id: auth.user.id,
    table_id: Number(table_id),
    booking_date,
    booking_time,
    num_of_people: Number(num_of_people),
    status: "pending",
    note: String(note ?? "").trim(),
    created_at: nowIso(),
  };

  bookings.push(newBooking);
  writeLS(LS_KEYS.bookings, bookings);

  return { ok: true, data: newBooking };
}

export async function bookingMe({ token }) {
  await delay(380);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const bookings = readLS(LS_KEYS.bookings, []);
  const tables = readLS(LS_KEYS.tables, []);

  const list = bookings
    .filter((b) => b.user_id === auth.user.id)
    .map((b) => {
      const table = tables.find((t) => t.id === b.table_id);
      return { ...b, table };
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return { ok: true, data: list };
}

export async function bookingCancel({ token, id }) {
  await delay(420);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const bookings = readLS(LS_KEYS.bookings, []);
  const booking = bookings.find(
    (b) => b.id === Number(id) && b.user_id === auth.user.id,
  );

  const can = canCancelBooking({ booking });
  if (!can.ok) return { ok: false, message: can.message };

  const idx = bookings.findIndex((b) => b.id === Number(id));
  bookings[idx] = { ...bookings[idx], status: "cancelled" };
  writeLS(LS_KEYS.bookings, bookings);

  return { ok: true, data: bookings[idx] };
}

// =====================
// Restaurant info & feedback
// =====================
export async function restaurantInfoGet() {
  await delay(250);
  return { ok: true, data: restaurantInfo };
}

export async function feedbackCreate({ token, title, content }) {
  await delay(420);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const feedbacks = readLS(LS_KEYS.feedbacks, []);
  const nextId = Math.max(0, ...feedbacks.map((f) => f.id)) + 1;

  const fb = {
    id: nextId,
    user_id: auth.user.id,
    title: String(title ?? "").trim(),
    content: String(content ?? "").trim(),
    created_at: nowIso(),
  };

  feedbacks.push(fb);
  writeLS(LS_KEYS.feedbacks, feedbacks);

  return { ok: true, data: fb };
}

// =====================
// Admin mock
// =====================
export async function adminGetFeedbacks({ token }) {
  await delay(320);
  const auth = requireToken(token);
  if (!auth.ok) return auth;
  if (auth.user.role !== "admin") return { ok: false, message: "Forbidden" };

  const feedbacks = readLS(LS_KEYS.feedbacks, []);
  const users = readLS(LS_KEYS.users, []);
  const data = feedbacks
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((f) => ({
      ...f,
      user: users.find((u) => u.id === f.user_id) || null,
    }));

  return { ok: true, data };
}

// =====================
// Utils
// =====================
function calcAvgRatingForMenu(menuId) {
  const reviews = readLS(LS_KEYS.reviews, []);
  const list = reviews.filter((r) => r.menu_id === Number(menuId));
  if (!list.length) return 0;
  const sum = list.reduce((acc, r) => acc + Number(r.rating), 0);
  return Math.round((sum / list.length) * 10) / 10;
}
