// FE mock API (in-memory + localStorage persistence)
// Matcha-themed Yakishime café data

const LS_KEYS = {
  users:     "vizza.users",
  session:   "vizza.session",
  menu:      "vizza.menu",
  reviews:   "vizza.reviews",
  tables:    "vizza.tables",
  bookings:  "vizza.bookings",
  feedbacks: "vizza.feedbacks",
};

function nowIso() { return new Date().toISOString(); }

function safeJsonParse(str, fallback) {
  try { const v = JSON.parse(str); return v ?? fallback; }
  catch { return fallback; }
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
  let h = 0;
  for (let i = 0; i < pw.length; i++)
    h = (h * 31 + pw.charCodeAt(i)) % 1000000007;
  return `mock$${h}`;
}

const restaurantInfo = {
  name:       "Yakishime Matcha",
  address:    "57 Nguyễn Cư Trinh, Ninh Kiều, Cần Thơ",
  hotline:    "0909 123 456",
  email:      "hello@yakishime.vn",
  openHours:  "08:00 – 22:00",
  mapEmbedUrl:"https://www.google.com/maps?q=Can+Tho&output=embed",
};

// ─── Matcha-themed menu data ───────────────────────────────────────────────
function seedMenu() {
  return [
    // ── Traditional ───────────────────────────────────────
    {
      id: 1,
      name: "Usucha – Thin Matcha",
      category: "Traditional",
      image_url: "",
      price: 65000,
      description: "Matcha bột Uji pha mỏng theo nghi thức Chado truyền thống. Vị nhẹ, xanh thuần khiết.",
      tag: "signature",
      sales_count: 890,
      ingredients: ["Matcha Uji grade A", "Nước suối nóng 75°C", "Wagashi"],
    },
    {
      id: 2,
      name: "Koicha – Thick Matcha",
      category: "Traditional",
      image_url: "https://imgs.search.brave.com/hgnlOzUwSQcyDPFlyYcG2jX8bxU83A9dY_4D0SakP8U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzAw/MTkvODAyMy81ODQ5/L2ZpbGVzL2Jvd2xf/b2Zfa29pY2hhXzI0/MHgyNDAuanBnP3Y9/MTc2NTgzMTA2Mw",
      price: 85000,
      description: "Matcha pha đặc theo phong cách trà đạo cao cấp. Hương thơm mạnh mẽ, hậu vị ngọt sâu.",
      tag: "signature",
      sales_count: 620,
      ingredients: ["Matcha Uji ceremonial", "Nước suối 80°C"],
    },
    {
      id: 3,
      name: "Tencha Leaf Brew",
      category: "Traditional",
      image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
      price: 75000,
      description: "Lá trà Tencha nguyên chất, ủ lạnh 8 tiếng – umami sâu, không đắng.",
      tag: "normal",
      sales_count: 310,
      ingredients: ["Lá Tencha Kyoto", "Nước RO"],
    },
    // ── Latte ─────────────────────────────────────────────
    {
      id: 4,
      name: "Matcha Oat Latte",
      category: "Latte",
      image_url: "https://images.unsplash.com/photo-1631898039254-d91a35c32f1a?w=600&q=80",
      price: 79000,
      description: "Matcha grade A pha với sữa yến mạch tạo lớp bọt mịn. Cân bằng hoàn hảo giữa đắng & ngọt.",
      tag: "best_seller",
      sales_count: 1540,
      ingredients: ["Matcha Uji", "Sữa yến mạch Oatly", "Mật ong"],
    },
    {
      id: 5,
      name: "Iced Matcha Latte",
      category: "Latte",
      image_url: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=600&q=80",
      price: 69000,
      description: "Matcha lạnh được pha đặc, đổ lên đá viên, rót sữa tươi tạo lớp gradient đẹp mắt.",
      tag: "best_seller",
      sales_count: 2100,
      ingredients: ["Matcha Uji", "Sữa tươi Vinamilk", "Đường cát trắng", "Đá"],
    },
    {
      id: 6,
      name: "Hojicha Latte",
      category: "Latte",
      image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
      price: 72000,
      description: "Trà Hojicha rang trên chảo gang, pha cùng sữa yến mạch. Vị caramel ấm áp, thơm khói nhẹ.",
      tag: "trending",
      sales_count: 980,
      ingredients: ["Hojicha Nishio", "Sữa yến mạch", "Đường nâu"],
    },
    // ── Hojicha ───────────────────────────────────────────
    {
      id: 7,
      name: "Cold Brew Hojicha",
      category: "Hojicha",
      image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
      price: 68000,
      description: "Hojicha cold brew 12 tiếng, vị thuần khiết, không đắng. Uống không đường vẫn thơm ngon.",
      tag: "trending",
      sales_count: 760,
      ingredients: ["Hojicha Kyoto", "Nước RO lạnh"],
    },
    {
      id: 8,
      name: "Hojicha Tonic",
      category: "Hojicha",
      image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      price: 74000,
      description: "Hojicha đặc trộn với nước tonic có gas, thêm lát chanh và sả. Rất sảng khoái mùa hè.",
      tag: "new",
      sales_count: 420,
      ingredients: ["Hojicha đặc", "Tonic water", "Chanh tươi", "Sả"],
    },
    // ── Desserts ──────────────────────────────────────────
    {
      id: 9,
      name: "Matcha Parfait",
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
      price: 95000,
      description: "Parfait 5 lớp: kem matcha, granola, đậu đỏ azuki, thạch matcha, kem tươi. Đẳng cấp Tokyo.",
      tag: "signature",
      sales_count: 680,
      ingredients: ["Kem Matcha Uji", "Đậu đỏ Azuki", "Granola", "Thạch matcha", "Kem tươi"],
    },
    {
      id: 10,
      name: "Warabi Mochi",
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
      price: 65000,
      description: "Mochi làm từ bột dương xỉ (warabiko), phủ bột matcha Kinako. Mềm tan trên lưỡi.",
      tag: "best_seller",
      sales_count: 1020,
      ingredients: ["Bột Warabiko", "Kinako", "Đường", "Matcha"],
    },
    {
      id: 11,
      name: "Matcha Roll Cake",
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80",
      price: 55000,
      description: "Bánh cuộn matcha mềm mịn, nhân kem tươi nhẹ. Slice đẹp, hương trà xanh dịu nhẹ.",
      tag: "normal",
      sales_count: 550,
      ingredients: ["Bột mì", "Matcha", "Kem tươi", "Trứng"],
    },
    // ── Food ──────────────────────────────────────────────
    {
      id: 12,
      name: "Onigiri Matcha Tuna",
      category: "Food",
      image_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80",
      price: 45000,
      description: "Cơm nắm tam giác trộn matcha nhẹ, nhân cá ngừ mayo Nhật. Ăn nhẹ tuyệt vời.",
      tag: "normal",
      sales_count: 430,
      ingredients: ["Gạo Japonica", "Matcha", "Cá ngừ", "Mayo Kewpie", "Rong biển"],
    },
    {
      id: 13,
      name: "Tamago Sando",
      category: "Food",
      image_url: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80",
      price: 55000,
      description: "Sandwich trứng Nhật kiểu Konbini – bánh mì sữa mềm, nhân trứng luộc nghiền mayo.",
      tag: "best_seller",
      sales_count: 870,
      ingredients: ["Bánh mì sữa", "Trứng gà", "Mayo Kewpie", "Muối biển"],
    },
  ];
}

// ─── Tables ────────────────────────────────────────────────────────────────
function seedTables() {
  return [
    { id: 1,  name: "Bàn A1", area: "Tầng trệt", max_seats: 2, coordinate_x: 10,  coordinate_y: 10,  shape: "pair"  },
    { id: 2,  name: "Bàn A2", area: "Tầng trệt", max_seats: 2, coordinate_x: 30,  coordinate_y: 10,  shape: "pair"  },
    { id: 3,  name: "Bàn A3", area: "Tầng trệt", max_seats: 4, coordinate_x: 55,  coordinate_y: 10,  shape: "quad"  },
    { id: 4,  name: "Bàn A4", area: "Tầng trệt", max_seats: 4, coordinate_x: 75,  coordinate_y: 10,  shape: "quad"  },
    { id: 5,  name: "Bàn B1", area: "Tầng trệt", max_seats: 2, coordinate_x: 10,  coordinate_y: 40,  shape: "pair"  },
    { id: 6,  name: "Bàn B2", area: "Tầng trệt", max_seats: 4, coordinate_x: 30,  coordinate_y: 40,  shape: "quad"  },
    { id: 7,  name: "Bàn B3", area: "Tầng trệt", max_seats: 4, coordinate_x: 55,  coordinate_y: 40,  shape: "quad"  },
    { id: 8,  name: "Bàn B4", area: "Tầng trệt", max_seats: 2, coordinate_x: 75,  coordinate_y: 40,  shape: "pair"  },
    { id: 9,  name: "Bàn C1", area: "Tầng trệt", max_seats: 2, coordinate_x: 10,  coordinate_y: 68,  shape: "pair"  },
    { id: 10, name: "Bàn C2", area: "Tầng trệt", max_seats: 4, coordinate_x: 30,  coordinate_y: 68,  shape: "quad"  },
    { id: 11, name: "Bàn C3", area: "Tầng trệt", max_seats: 4, coordinate_x: 55,  coordinate_y: 68,  shape: "quad"  },
    { id: 12, name: "Bàn C4", area: "Tầng trệt", max_seats: 2, coordinate_x: 75,  coordinate_y: 68,  shape: "pair"  },
  ];
}

// ─── Users ─────────────────────────────────────────────────────────────────
function seedUsers() {
  return [
    {
      id: 1, full_name: "Minh Luân", email: "demo@yakishime.vn",
      phone: "0909123456", password: hashPasswordMock("123456"), role: "customer",
    },
    {
      id: 2, full_name: "Admin", email: "admin@yakishime.vn",
      phone: "0999888777", password: hashPasswordMock("admin123"), role: "admin",
    },
  ];
}

// ─── Reviews ───────────────────────────────────────────────────────────────
function seedReviews() {
  return [
    { id: 1, user_id: 1, menu_id: 4, rating: 5, comment: "Matcha Oat Latte ngon nhất tôi từng uống! Vị matcha đậm đà, sữa yến mạch rất mịn.", created_at: "2026-05-20T10:00:00Z" },
    { id: 2, user_id: 2, menu_id: 4, rating: 5, comment: "Quán đẹp, không khí yên tĩnh. Latte phải thử!", created_at: "2026-05-22T14:30:00Z" },
    { id: 3, user_id: 1, menu_id: 5, rating: 5, comment: "Iced Matcha Latte màu đẹp lắm, chụp ảnh sống ảo cực kỳ.", created_at: "2026-05-18T09:00:00Z" },
    { id: 4, user_id: 2, menu_id: 5, rating: 4, comment: "Ngon, ngọt vừa. Sẽ quay lại.", created_at: "2026-05-25T16:00:00Z" },
    { id: 5, user_id: 1, menu_id: 9, rating: 5, comment: "Parfait là món tôi order mỗi lần đến. 5 lớp ngon hết!", created_at: "2026-05-21T12:00:00Z" },
    { id: 6, user_id: 2, menu_id: 1, rating: 5, comment: "Usucha rất authentic, đúng chuẩn trà đạo Nhật Bản.", created_at: "2026-05-19T11:00:00Z" },
    { id: 7, user_id: 1, menu_id: 10, rating: 5, comment: "Warabi Mochi tan trong miệng, quá tuyệt vời!", created_at: "2026-05-23T15:00:00Z" },
    { id: 8, user_id: 2, menu_id: 6, rating: 4, comment: "Hojicha Latte vị caramel thơm, khác biệt hoàn toàn.", created_at: "2026-05-24T10:30:00Z" },
  ];
}

// ─── Random bookings ────────────────────────────────────────────────────────
function makeRandomBookings(tables) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const dateStr = d.toISOString().slice(0, 10);
  const times   = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  const existing = []; let id = 1;

  for (let t of times) {
    const shuffled = [...tables].sort(() => Math.random() - 0.5);
    const pick = shuffled.slice(0, Math.floor(Math.random() * 4) + 1);
    for (let table of pick) {
      existing.push({
        id: id++, user_id: 1, table_id: table.id,
        booking_date: dateStr, booking_time: t,
        num_of_people: table.max_seats, status: "confirmed",
        note: "", created_at: nowIso(),
      });
    }
  }
  return existing;
}

// ─── Seed ──────────────────────────────────────────────────────────────────
function ensureSeeded() {
  // Force re-seed menu to get Matcha data (version bump)
  const menuVersion = localStorage.getItem("vizza.menu.v");
  if (menuVersion !== "3") {
    writeLS(LS_KEYS.menu, seedMenu());
    localStorage.setItem("vizza.menu.v", "3");
  }

  if (!readLS(LS_KEYS.tables, null))    writeLS(LS_KEYS.tables, seedTables());
  if (!readLS(LS_KEYS.users, null))     writeLS(LS_KEYS.users, seedUsers());
  if (!readLS(LS_KEYS.reviews, null))   writeLS(LS_KEYS.reviews, seedReviews());
  if (!readLS(LS_KEYS.bookings, null))  writeLS(LS_KEYS.bookings, makeRandomBookings(seedTables()));
  if (!readLS(LS_KEYS.feedbacks, null)) writeLS(LS_KEYS.feedbacks, []);
}

ensureSeeded();

// ─── Auth helpers ──────────────────────────────────────────────────────────
function authGetSession()         { return readLS(LS_KEYS.session, null); }
function authSetSession(session)  { writeLS(LS_KEYS.session, session); }
function genToken(userId)         { return `token_${userId}_${Math.random().toString(16).slice(2)}`; }
function requireToken(token) {
  if (!token) return { ok: false, message: "Unauthorized" };
  const session = authGetSession();
  if (!session || session.token !== token) return { ok: false, message: "Unauthorized" };
  return { ok: true, user: session.user };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
export async function authRegister({ full_name, email, phone, password }) {
  await delay();
  const users = readLS(LS_KEYS.users, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, message: "Email đã tồn tại." };
  if (users.some((u) => u.phone === phone))
    return { ok: false, message: "Số điện thoại đã tồn tại." };

  const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
  const user   = { id: nextId, full_name, email, phone, password: hashPasswordMock(password), role: "customer" };
  users.push(user);
  writeLS(LS_KEYS.users, users);

  const token = genToken(user.id);
  authSetSession({ token, user: { id: user.id, full_name, email, phone, role: user.role } });
  return { ok: true, token, user: authGetSession().user };
}

export async function authLogin({ login, password }) {
  await delay();
  const users  = readLS(LS_KEYS.users, []);
  const isEmail = login.includes("@");
  const user   = users.find((u) => isEmail ? u.email.toLowerCase() === login.toLowerCase() : u.phone === login);

  if (!user) return { ok: false, message: "Tài khoản không tồn tại." };
  if (user.password !== hashPasswordMock(password))
    return { ok: false, message: "Mật khẩu không chính xác." };

  const token = genToken(user.id);
  authSetSession({ token, user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role } });
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

// ═══════════════════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════════════════
export async function menuList({ q = "", category = "all", tag = "all" } = {}) {
  await delay();
  const menu  = readLS(LS_KEYS.menu, []);
  const query = q.trim().toLowerCase();
  return {
    ok: true,
    data: menu
      .filter((m) => category === "all" || m.category === category)
      .filter((m) => tag === "all" || m.tag === tag)
      .filter((m) => !query || (m.name + " " + m.description).toLowerCase().includes(query))
      .map((m) => ({ ...m, avg_rating: calcAvgRatingForMenu(m.id) })),
  };
}

export async function menuDetail({ id }) {
  await delay();
  const menu = readLS(LS_KEYS.menu, []);
  const item = menu.find((m) => m.id === Number(id));
  if (!item) return { ok: false, message: "Menu not found" };
  return { ok: true, data: { ...item, avg_rating: calcAvgRatingForMenu(item.id) } };
}

export async function menuReviews({ id }) {
  await delay(350);
  const reviews = readLS(LS_KEYS.reviews, []);
  const users   = readLS(LS_KEYS.users, []);
  const list = reviews
    .filter((r) => r.menu_id === Number(id))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((r) => {
      const u = users.find((x) => x.id === r.user_id);
      return { ...r, user: u ? { id: u.id, full_name: u.full_name } : null };
    });
  return { ok: true, data: list };
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════
export async function reviewCreate({ token, menu_id, rating, comment }) {
  await delay(420);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const reviews = readLS(LS_KEYS.reviews, []);
  const nextId  = Math.max(0, ...reviews.map((r) => r.id)) + 1;
  const newReview = {
    id: nextId, user_id: auth.user.id, menu_id: Number(menu_id),
    rating: Number(rating), comment: String(comment ?? "").trim(),
    created_at: nowIso(),
  };
  reviews.push(newReview);
  writeLS(LS_KEYS.reviews, reviews);
  return { ok: true, data: newReview };
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLES & BOOKING
// ═══════════════════════════════════════════════════════════════════════════
export async function tablesList() {
  await delay(250);
  return { ok: true, data: readLS(LS_KEYS.tables, []) };
}

function bookingsForSlot({ booking_date, booking_time }) {
  const bookings = readLS(LS_KEYS.bookings, []);
  return bookings.filter(
    (b) => b.booking_date === booking_date && b.booking_time === booking_time && b.status !== "cancelled",
  );
}

export async function bookingCheckStatus({ booking_date, booking_time }) {
  await delay(420);
  const tables  = readLS(LS_KEYS.tables, []);
  const bookings = bookingsForSlot({ booking_date, booking_time });
  const occupied = new Set(bookings.map((b) => b.table_id));
  return {
    ok: true,
    data: tables.map((t) => ({ ...t, status: occupied.has(t.id) ? "occupied" : "available" })),
  };
}

export async function bookingCreate({ token, table_id, booking_date, booking_time, num_of_people, note }) {
  await delay(520);
  const auth = requireToken(token);
  if (!auth.ok) return auth;

  const tables = readLS(LS_KEYS.tables, []);
  const table  = tables.find((t) => t.id === Number(table_id));
  if (!table) return { ok: false, message: "Table not found" };

  const allowed = num_of_people <= 2 ? table.max_seats === 2 : table.max_seats === 4;
  if (!allowed) return { ok: false, message: "Selected table does not match guest count." };

  const statusRes   = await bookingCheckStatus({ booking_date, booking_time });
  const tableStatus = statusRes.data.find((t) => t.id === Number(table_id));
  if (!tableStatus || tableStatus.status !== "available")
    return { ok: false, message: "Table already occupied." };

  const bookings = readLS(LS_KEYS.bookings, []);
  const nextId   = Math.max(0, ...bookings.map((b) => b.id)) + 1;
  const newBooking = {
    id: nextId, user_id: auth.user.id, table_id: Number(table_id),
    booking_date, booking_time, num_of_people: Number(num_of_people),
    status: "pending", note: String(note ?? "").trim(), created_at: nowIso(),
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
  const tables   = readLS(LS_KEYS.tables, []);
  const list = bookings
    .filter((b) => b.user_id === auth.user.id)
    .map((b) => ({ ...b, table: tables.find((t) => t.id === b.table_id) }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return { ok: true, data: list };
}

export async function bookingCancel({ token, id }) {
  await delay(420);
  const auth = requireToken(token);
  if (!auth.ok) return auth;
  const bookings = readLS(LS_KEYS.bookings, []);
  const booking  = bookings.find((b) => b.id === Number(id) && b.user_id === auth.user.id);
  if (!booking) return { ok: false, message: "Booking not found" };
  if (booking.status === "cancelled") return { ok: false, message: "Already cancelled" };
  const slot    = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
  const diffHrs = (slot.getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHrs < 1) return { ok: false, message: "Cannot cancel within 1 hour of booking." };
  const idx = bookings.findIndex((b) => b.id === Number(id));
  bookings[idx] = { ...bookings[idx], status: "cancelled" };
  writeLS(LS_KEYS.bookings, bookings);
  return { ok: true, data: bookings[idx] };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESTAURANT INFO & FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════
export async function restaurantInfoGet() {
  await delay(250);
  return { ok: true, data: restaurantInfo };
}

export async function feedbackCreate({ token, title, content }) {
  await delay(420);
  const auth = requireToken(token);
  if (!auth.ok) return auth;
  const feedbacks = readLS(LS_KEYS.feedbacks, []);
  const nextId    = Math.max(0, ...feedbacks.map((f) => f.id)) + 1;
  const fb = {
    id: nextId, user_id: auth.user.id,
    title: String(title ?? "").trim(), content: String(content ?? "").trim(),
    created_at: nowIso(),
  };
  feedbacks.push(fb);
  writeLS(LS_KEYS.feedbacks, feedbacks);
  return { ok: true, data: fb };
}

export async function adminGetFeedbacks({ token }) {
  await delay(320);
  const auth = requireToken(token);
  if (!auth.ok) return auth;
  if (auth.user.role !== "admin") return { ok: false, message: "Forbidden" };
  const feedbacks = readLS(LS_KEYS.feedbacks, []);
  const users     = readLS(LS_KEYS.users, []);
  const data = feedbacks
    .slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((f) => ({ ...f, user: users.find((u) => u.id === f.user_id) || null }));
  return { ok: true, data };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════
function calcAvgRatingForMenu(menuId) {
  const reviews = readLS(LS_KEYS.reviews, []);
  const list    = reviews.filter((r) => r.menu_id === Number(menuId));
  if (!list.length) return 0;
  const sum = list.reduce((acc, r) => acc + Number(r.rating), 0);
  return Math.round((sum / list.length) * 10) / 10;
}
