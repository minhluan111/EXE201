const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:52818"
).replace(/\/$/, "");
const getTenantDomain = () => {
  const host = window.location.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }
  // Check URL query parameter first
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get("tenant");
    if (tenantParam) {
      localStorage.setItem("dev_tenant_domain", tenantParam);
      return tenantParam;
    }
    const saved = localStorage.getItem("dev_tenant_domain");
    if (saved) return saved;
  }
  return import.meta.env.VITE_TENANT_DOMAIN || "exe-201-flax.vercel.app";
};
const TENANT_DOMAIN = getTenantDomain();
const SESSION_KEY = "vizza.session";



const FALLBACK_MENU_IMAGES = {
  Traditional:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  Latte:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  Food: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  Desserts:
    "https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=80",
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
    role:
      role === "staff"
        ? "staff"
        : role === "admin"
          ? "admin"
          : role === "manager"
            ? "manager"
            : "user",
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
  
  if (value === "5" || value === "combo" || lowerName.includes("combo")) {
    return "Combo";
  }

  const currentDomain = getTenantDomain().toLowerCase();
  const isTaoTao = currentDomain.includes("taotao") || localStorage.getItem("tenant_is_taotao") === "true";
  const isComGa = currentDomain.includes("comga") || currentDomain.includes("comgaongbach") || currentDomain.includes("ongbach") || localStorage.getItem("tenant_is_comga") === "true";
  const isEmCoffee = currentDomain.includes("emcoffee") || currentDomain.includes("em") || localStorage.getItem("tenant_is_emcoffee") === "true";
  const isHanHuyen = currentDomain.includes("hanhuyen") || localStorage.getItem("tenant_is_hanhuyen") === "true";
  const isCochin = currentDomain.includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";
  const isMonari = currentDomain.includes("monari") || localStorage.getItem("tenant_is_monari") === "true";
  const isComTam = currentDomain.includes("comtam") || currentDomain.includes("comtamno") || currentDomain.includes("monquanchat") || currentDomain.includes("monquangchat") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = currentDomain.includes("samhouse") || currentDomain.includes("samhouses") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = currentDomain.includes("monquanchat") || currentDomain.includes("monquangchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = currentDomain.includes("hoatearoom") || localStorage.getItem("tenant_is_hoatearoom") === "true";

  if (isComGa) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal.includes("combo") || lowerName.includes("combo")) return "Combo";
    if (catVal.includes("drink") || catVal.includes("nước") || catVal.includes("trà") || lowerName.includes("sâm") || lowerName.includes("nước") || lowerName.includes("trà")) return "Drink";
    return "MainCourse";
  }

  if (isMonari) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal.includes("combo") || lowerName.includes("trung thu")) return "Combo";
    if (catVal.includes("drink") || catVal.includes("trà") || lowerName.includes("matcha") || lowerName.includes("nước dừa") || lowerName.includes("trà")) return "Drink";
    if (catVal.includes("dessert") || catVal.includes("cake") || lowerName.includes("bánh")) return "Dessert";
    return "Drink";
  }

  if (isTaoTao) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal === "1" || catVal.includes("coffee") || catVal.includes("muối") || lowerName.includes("cà phê")) return "Coffee";
    if (catVal === "2" || catVal.includes("milktea") || catVal.includes("latte") || lowerName.includes("trà sữa") || lowerName.includes("hồng trà") || lowerName.includes("matcha") || lowerName.includes("phô mai") || lowerName.includes("macchiato")) return "MilkTea";
    if (catVal === "3" || catVal.includes("fruit") || lowerName.includes("chanh") || lowerName.includes("dừa")) return "FruitTea";
    return "Coffee";
  }

  if (isEmCoffee) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal === "1" || catVal.includes("coffee") || lowerName.includes("phin") || lowerName.includes("phindi") || lowerName.includes("cà phê")) return "Coffee";
    if (catVal === "2" || catVal.includes("fruit") || lowerName.includes("trà vải") || lowerName.includes("trà đào") || lowerName.includes("atiso") || lowerName.includes("dâu")) return "FruitTea";
    if (catVal === "3" || catVal.includes("latte") || catVal.includes("cacao") || lowerName.includes("cacao") || lowerName.includes("matcha")) return "Latte";
    return "Coffee";
  }

  if (isHanHuyen) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal === "1" || catVal.includes("coffee") || lowerName.includes("phê") || lowerName.includes("phin") || lowerName.includes("cà phê")) return "Coffee";
    if (catVal === "2" || catVal.includes("fruit") || lowerName.includes("trà đào") || lowerName.includes("trà vải") || lowerName.includes("thanh mát")) return "FruitTea";
    if (catVal === "3" || catVal.includes("latte") || catVal.includes("milktea") || lowerName.includes("đặc biệt")) return "Latte";
    return "Coffee";
  }

  if (isCochin) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal.includes("milktea") || lowerName.includes("trà sữa")) return "MilkTea";
    if (catVal.includes("coffee") || lowerName.includes("latte") || lowerName.includes("cà phê")) return "Coffee";
    if (catVal.includes("fruit") || lowerName.includes("trà ổi") || lowerName.includes("trà thanh long") || lowerName.includes("trà vải")) return "FruitTea";
    if (catVal.includes("drink") || lowerName.includes("sô-cô-la")) return "Drink";
    return "FruitTea";
  }

  if (isComTam) {
    const catVal = String(category || "").trim().toLowerCase();
    if (catVal === "1" || catVal.includes("drink")) return "Drink";
    if (catVal === "2" || catVal.includes("maincourse") || catVal.includes("course")) return "MainCourse";
    if (catVal === "3" || catVal.includes("dessert")) return "Desserts";
    if (catVal === "4" || catVal.includes("snack")) return "Snack";
    return "MainCourse";
  }

  if (isHoaTeaRoom) {
    const lowerName = String(name || "").toLowerCase();
    const catVal = String(category || "").trim().toLowerCase();

    if (
      lowerName.includes("workshop") ||
      lowerName.includes("vẽ ly") ||
      lowerName.includes("tô vẽ")
    ) {
      return "Experiences";
    }
    if (
      lowerName.includes("flower") ||
      lowerName.includes("hộp hoa") ||
      lowerName.includes("lài mia") ||
      lowerName.includes("trà sữa")
    ) {
      return "MilkTea";
    }
    if (
      lowerName.includes("corn") ||
      lowerName.includes("kaze") ||
      lowerName.includes("coco") ||
      lowerName.includes("kumori") ||
      lowerName.includes("tiramisu") ||
      lowerName.includes("ube") ||
      lowerName.includes("khoai mỡ")
    ) {
      return "MatchaSpecial";
    }
    if (
      lowerName.includes("latte") ||
      lowerName.includes("whisk") ||
      lowerName.includes("cổ điển")
    ) {
      return "MatchaClassic";
    }

    if (catVal === "1" || catVal.includes("special")) return "MatchaSpecial";
    if (catVal === "2" || catVal.includes("classic")) return "MatchaClassic";
    if (catVal === "3" || catVal.includes("milktea")) return "MilkTea";
    if (catVal === "4" || catVal.includes("experience")) return "Experiences";
    return "MatchaSpecial";
  }

  if (isSamHouse) {
    const lowerName = String(name || "").toLowerCase();
    const catVal = String(category || "").trim().toLowerCase();

    if (
      lowerName.includes("cà phê") ||
      lowerName.includes("cafe") ||
      lowerName.includes("bạc xỉu") ||
      lowerName.includes("coffee")
    ) {
      return "Coffee";
    }
    if (
      lowerName.includes("trà sữa") ||
      lowerName.includes("sữa tươi") ||
      lowerName.includes("lài sữa") ||
      lowerName.includes("olong sữa")
    ) {
      return "MilkTea";
    }
    if (
      lowerName.includes("trà") ||
      lowerName.includes("tea") ||
      lowerName.includes("macchiato") ||
      lowerName.includes("atiso")
    ) {
      return "FruitTea";
    }
    if (
      lowerName.includes("cacao") ||
      lowerName.includes("khác") ||
      catVal === "4" ||
      catVal === "other" ||
      catVal === "snack"
    ) {
      return "Other";
    }

    if (catVal === "1" || catVal.includes("coffee") || catVal.includes("drink")) return "Coffee";
    if (catVal === "2" || catVal.includes("milktea") || catVal.includes("maincourse")) return "MilkTea";
    if (catVal === "3" || catVal.includes("fruittea") || catVal.includes("dessert")) return "FruitTea";
    if (catVal === "4" || catVal.includes("other") || catVal.includes("snack")) return "Other";
    return "Coffee";
  }

  const globalValue = String(category || "").toLowerCase();
  const globalLowerName = String(name || "").toLowerCase();

  if (globalLowerName.includes("hojicha")) {
    return "Hojicha";
  }

  if (
    globalLowerName.includes("tiramisu") ||
    globalLowerName.includes("parfait") ||
    globalLowerName.includes("cake") ||
    globalLowerName.includes("dessert")
  ) {
    return "Desserts";
  }

  if (
    globalValue.includes("snack") ||
    globalLowerName.includes("croissant") ||
    globalLowerName.includes("mochi") ||
    globalLowerName.includes("workshop") ||
    globalLowerName.includes("vẽ ly")
  ) {
    return "Food";
  }

  if (
    globalValue.includes("drink") ||
    globalValue.includes("coffee") ||
    globalLowerName.includes("cà phê") ||
    globalLowerName.includes("bạc xỉu")
  ) {
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
  let imageUrl =
    item.imageUrl ||
    item.image_url ||
    FALLBACK_MENU_IMAGES[category] ||
    FALLBACK_MENU_IMAGES.Latte;

  if (
    typeof imageUrl === "string" &&
    (imageUrl.includes("luc_tra_sua_mat_ong") ||
      imageUrl.includes("olong_lai_sua") ||
      imageUrl.includes("tra_vai_lai") ||
      imageUrl.includes("tra_xoai_macchiato"))
  ) {
    imageUrl = imageUrl + (imageUrl.includes("?") ? "&" : "?") + "v=3";
  }

  let price = Number(item.price || 0);
  let name = item.name || "";
  if (
    name.toLowerCase().includes("vẽ ly") ||
    name.toLowerCase().includes("ve ly") ||
    item.id === "htr8" ||
    String(item.id).toLowerCase().includes("htr8")
  ) {
    price = 5000;
    name = "Workshop vẽ ly (Giá nước + 5.000₫)";
  }

  let images = Array.isArray(item.images) ? [...item.images] : [];
  if (name.toLowerCase().includes("trung thu") && images.length <= 1) {
    images = [
      "/assets/monari/menu/set_banh_trung_thu.jpg",
      "/assets/monari/menu/set_banh_trung_thu_1.jpg",
      "/assets/monari/menu/set_banh_trung_thu_2.jpg",
    ];
  }
  if (images.length === 0 && imageUrl) {
    images = [imageUrl];
  }

  return {
    id: item.id,
    name,
    category,
    image_url: imageUrl,
    imageUrl,
    images,
    price,
    description: item.description || "",
    tag: (String(name).toLowerCase().includes("tôm thịt") || String(name).toLowerCase().includes("ba chỉ") || String(name).toLowerCase().includes("cao lầu")) ? "signature" : mapMenuTag(item.tag),
    sales_count: Number(item.salesCount || item.sales_count || 0),
    salesCount: Number(item.salesCount || item.sales_count || 0),
    avg_rating: avgRating,
    ingredients: item.ingredients || [],
  };
}

function mapReview(review) {
  if (!review) return null;
  const guestName =
    review.guestName ?? review.guest_name ?? review.GuestName ?? "";
  const commentText = review.comment ?? review.Comment ?? "";
  const ratingValue = review.rating ?? review.Rating ?? 5;
  const menuItemId =
    review.menuItemId ??
    review.menuItem_id ??
    review.menu_id ??
    review.MenuItemId ??
    null;
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
        ? {
            id: review.user.id ?? null,
            full_name:
              review.user.full_name ??
              review.user.fullName ??
              review.user.FullName ??
              "",
          }
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
  if (value === "checkedin") return "checkedin";
  if (value === "seated") return "checkedin";    // legacy mapping
  if (value === "noshow") return "noshow";
  if (value === "reserved") return "reserved";
  return "confirmed";
}

function pickAreaMap(seatingAreas) {
  const areas = Array.isArray(seatingAreas) ? seatingAreas : [];
  const twoSeat = areas.filter((area) =>
    /2-?seat/i.test(String(area.tableType || "")),
  );
  const fourSeat = areas.filter((area) =>
    /4-?seat/i.test(String(area.tableType || "")),
  );

  return {
    Window:
      twoSeat.find(
        (area) => String(area.area || "").toLowerCase() === "window",
      ) ||
      twoSeat[0] ||
      null,
    Corner:
      twoSeat.find(
        (area) => String(area.area || "").toLowerCase() === "corner",
      ) ||
      twoSeat[1] ||
      twoSeat[0] ||
      null,
    Indoor:
      fourSeat.find(
        (area) => String(area.area || "").toLowerCase() === "indoor",
      ) ||
      fourSeat[0] ||
      null,
    Outdoor:
      fourSeat.find(
        (area) => String(area.area || "").toLowerCase() === "outdoor",
      ) ||
      fourSeat[1] ||
      fourSeat[0] ||
      null,
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
    "X-Tenant": getTenantDomain(),
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
    return {
      ok: false,
      message:
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
    };
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
      message =
        data?.title ||
        data?.detail ||
        (typeof data === "string" ? data : "Request failed");
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
  const activeAreas = seatingAreas.filter((area) => area.isActive || area.is_active);

  const currentDomain = getTenantDomain().toLowerCase();
  const isTaoTao = currentDomain.includes("taotao") || localStorage.getItem("tenant_is_taotao") === "true";
  const isComGa = currentDomain.includes("comga") || currentDomain.includes("comgaongbach") || localStorage.getItem("tenant_is_comga") === "true";
  const isComTam = currentDomain.includes("comtam") || currentDomain.includes("comtamno") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = currentDomain.includes("samhouse") || currentDomain.includes("samhouses") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = currentDomain.includes("monquanchat") || currentDomain.includes("monquangchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = currentDomain.includes("hoatearoom") || localStorage.getItem("tenant_is_hoatearoom") === "true";
  const isMonari = currentDomain.includes("monari") || localStorage.getItem("tenant_is_monari") === "true";
  const isYakishime = currentDomain.includes("yakishime") || currentDomain.includes("yaki") || localStorage.getItem("tenant_is_yakishime") === "true" || (!isTaoTao && !isComGa && !isComTam && !isSamHouse && !isMonQuanChat && !isHoaTeaRoom && !isMonari);

  const tables = [];
  activeAreas.forEach((area) => {
    const tableTypeText = String(area.tableType || area.table_type || "");
    const matchSeat = tableTypeText.match(/(\d+)-Seat/i);
    const matchNguoi = tableTypeText.match(/(\d+)\s*(?:người|khách)/i);
    const matchDigits = tableTypeText.match(/(\d+)/);

    let max_seats = 2;
    let pureTableType = tableTypeText;

    if (matchSeat) {
      max_seats = parseInt(matchSeat[1], 10);
      pureTableType = matchSeat[2];
    } else if (matchNguoi) {
      max_seats = parseInt(matchNguoi[1], 10);
    } else if (matchDigits) {
      max_seats = parseInt(matchDigits[1], 10);
    }

    // Generate 'reservableTables' tables for this area
    const count = area.reservableTables ?? area.reservable_tables ?? 0;
    for (let i = 1; i <= count; i++) {
      const row = Math.floor((i - 1) / 3);
      const col = (i - 1) % 3;

      let displayName = `Bàn ${area.area} ${i}`;
      if (isMonari || isComGa) {
        displayName = count === 1 ? tableTypeText : `${tableTypeText} (${i})`;
      } else if (isMonQuanChat) {
        const numMatch = tableTypeText.match(/^Bàn\s+(\d+)/i);
        if (numMatch) {
          displayName = `Bàn ${numMatch[1]}`;
        } else {
          displayName = tableTypeText;
        }
      } else if (isHoaTeaRoom || isYakishime) {
        const numMatch = tableTypeText.match(/^Bàn\s+([NS]\d+(?:\.\d+)?)/i);
        if (numMatch) {
          displayName = `Bàn ${numMatch[1]}`;
        } else {
          displayName = tableTypeText;
        }
      }

      tables.push({
        id: `${area.id}_table_${i}`,
        name: displayName,
        area: area.area,
        max_seats: max_seats,
        tableType: pureTableType,
        table_type: pureTableType,
        coordinate_x: 10 + col * 25,
        coordinate_y: 10 + row * 25,
        shape: max_seats >= 8 ? "large" : (max_seats >= 4 ? "quad" : "pair"),
        imageType: area.tableType || area.table_type,
        previewImage: area.previewImage ?? area.preview_image,
        seatingAreaId: area.id,
        seating_area_id: area.id,
        seatingArea: area,
        status: "available",
      });
    }
  });

  return tables;
}

function buildReservationTable(reservation, tables = []) {
  const tName = reservation.tableName || reservation.table_name;
  if (tName) {
    const match = tables.find((table) => table.name === tName);
    if (match) return { ...match };

    // Fallback if the seating area is deleted or the table name isn't found in current active list
    const matchCap = reservation.guestCount || 2;
    return {
      id: reservation.seatingAreaId || "unknown",
      name: tName,
      area: reservation.seatingAreaArea || "Khu vực",
      max_seats: matchCap,
      shape: matchCap > 2 ? "quad" : "pair",
      imageType: reservation.seatingAreaTableType || "",
    };
  }
  const match =
    tables.find((table) => table.seatingAreaId === reservation.seatingAreaId) ||
    tables.find((table) => table.area === reservation.seatingAreaArea) ||
    tables[0] ||
    null;

  return match ? { ...match } : null;
}

function normalizeReservation(reservation, tables = []) {
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
    checkInImageUrl: reservation.checkInImageUrl,
    checkInNote: reservation.checkInNote,
    riskLevel: reservation.riskLevel || "Available",
    displayType: reservation.displayType || "Available",
    reviewStatus: reservation.reviewStatus || "PendingReview",
    reviewPriority: reservation.reviewPriority ?? 5,
    reviewBadge: reservation.reviewBadge || "Bình thường",
    reviewExplanation: reservation.reviewExplanation || "",
    bookingPriority: reservation.bookingPriority || "Normal",
    bookingPriorityLabel: reservation.bookingPriorityLabel || "⚪ Bình thường",
    bookingPriorityExplanation: reservation.bookingPriorityExplanation || "",
    tableTimelineContext: Array.isArray(reservation.tableTimelineContext) ? reservation.tableTimelineContext : [],
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
    body: {
      fullName: full_name,
      email,
      phone,
      password,
      confirmPassword: password,
    },
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
  const result = await requestJson("/api/auth/me", {
    token: token || currentToken(),
  });
  if (!result.ok) return result;
  return { ok: true, user: mapUser(result.data) };
}

export async function menuList({ q = "", category = "all", tag = "all" } = {}) {
  const [menuResult, reviewsResult] = await Promise.all([
    requestJson("/api/public/menu"),
    requestJson("/api/public/reviews"),
  ]);

  if (!menuResult.ok || !Array.isArray(menuResult.data) || menuResult.data.length === 0) {
    console.warn("Using offline mock data fallback for menuList");
    const mockItems = getMockMenuItems();
    const mapped = mockItems.map(item => mapMenuItem(item, 4.8));
    const filtered = mapped.filter(item => {
      if (q && !item.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (category && category !== "all" && item.category !== category) return false;
      if (tag && tag !== "all" && item.tag !== tag) return false;
      return true;
    });
    return {
      ok: true,
      data: filtered
    };
  }

  const reviewsList =
    reviewsResult.ok && Array.isArray(reviewsResult.data)
      ? reviewsResult.data
      : [];

  // Group reviews by menuItemId
  const ratingsByMenuId = {};
  reviewsList.forEach((review) => {
    const mId =
      review.menuItemId ||
      review.menuItem_id ||
      review.menu_id ||
      review.MenuItemId;
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
    const avgRating =
      stats && stats.count > 0
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
      .filter(
        (item) =>
          !query ||
          `${item.name} ${item.description}`.toLowerCase().includes(query),
      ),
  };
}

export async function menuDetail({ id }) {
  const result = await requestJson(`/api/public/menu/${id}`);
  if (!result.ok) return result;

  const reviews = await menuReviews({ id });
  const avgRating =
    reviews.ok && reviews.data.length
      ? Math.round(
          (reviews.data.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0,
          ) /
            reviews.data.length) *
            10,
        ) / 10
      : 0;

  return { ok: true, data: mapMenuItem(result.data, avgRating) };
}

export async function menuReviews({ id }) {
  const result = await requestJson("/api/public/reviews", {
    query: { menuItemId: id },
  });
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

export async function getAvailability({ date, guestCount }) {
  const result = await requestJson("/api/public/availability", {
    query: { date, guestCount },
  });
  return result;
}

export async function bookingCheckStatus({
  booking_date,
  booking_time,
  guestCount,
}) {
  const tables = await getTablesWithAreas();

  // 1. Fetch available areas for both 2-seat and 4-seat areas concurrently from Backend SSOT
  const [avail2Result, avail4Result] = await Promise.all([
    requestJson("/api/public/availability", {
      query: { date: booking_date, guestCount: 2 },
    }),
    requestJson("/api/public/availability", {
      query: { date: booking_date, guestCount: 4 },
    }),
  ]);

  if (!avail2Result.ok || !avail4Result.ok) {
    console.warn("Using offline mock data fallback for bookingCheckStatus");
    return {
      ok: true,
      data: tables.map((table) => ({
        ...table,
        status: "available",
        riskLevel: "Available",
        riskMessage: "Available",
        suggestedStatus: "available",
      })),
    };
  }

  const availability = [
    ...(Array.isArray(avail2Result.data) ? avail2Result.data : []),
    ...(Array.isArray(avail4Result.data) ? avail4Result.data : []),
  ];

  const targetTime = normalizeTime(booking_time);
  const areaRiskMap = new Map();
  const tableRiskMap = new Map();

  availability.forEach((area) => {
    if (Array.isArray(area.availableSlots)) {
      const slot = area.availableSlots.find(
        (s) => normalizeTime(s.startTime) === targetTime,
      );
      if (slot) {
        areaRiskMap.set(area.seatingAreaId, {
          riskLevel: slot.riskLevel || "Available",
          displayType: slot.displayType || "Available",
          riskMessage: slot.riskMessage || "",
          suggestedStatus: slot.suggestedStatus || (slot.riskLevel === "Conflict" ? "occupied" : "available"),
        });

        const trList = slot.tableRisks || slot.TableRisks || [];
        if (Array.isArray(trList)) {
          trList.forEach((tr) => {
            const tName = tr.tableName || tr.TableName || "";
            if (tName) {
              // Normalize: strip "bàn " prefix to match frontend table.name keys (e.g. "Bàn Corner 1" -> "corner 1")
              const normalizeKey = (n) => n.toLowerCase().replace(/^bàn\s+/i, "").trim();
              const key = normalizeKey(tName);
              const entry = {
                riskLevel: tr.riskLevel || tr.RiskLevel || "Available",
                displayType: tr.displayType || tr.DisplayType || "Available",
                riskMessage: tr.riskMessage || tr.RiskMessage || "",
                suggestedStatus: tr.suggestedStatus || tr.SuggestedStatus || ((tr.riskLevel || tr.RiskLevel) === "Conflict" ? "occupied" : "available"),
              };
              tableRiskMap.set(key, entry);           // "corner 1"
              tableRiskMap.set(tName.toLowerCase(), entry); // "bàn corner 1" (fallback)
            }
          });
        }
      }
    }
  });

  return {
    ok: true,
    data: tables.map((table) => {
      let status = "available";
      let riskLevel = "Available";
      let displayType = "Available";
      let riskMessage = "";
      let suggestedStatus = "available";

      // Normalize key: strip "bàn " prefix to match how tableRiskMap is keyed
      const rawName = (table.name || "").toLowerCase();
      const tableNameKey = rawName.replace(/^bàn\s+/i, "").trim();
      if (tableRiskMap.has(tableNameKey)) {
        const tr = tableRiskMap.get(tableNameKey);
        riskLevel = tr.riskLevel;
        displayType = tr.displayType;
        riskMessage = tr.riskMessage;
        suggestedStatus = tr.suggestedStatus;
        status = suggestedStatus;
      } else if (table.seatingAreaId && areaRiskMap.has(table.seatingAreaId)) {
        const ar = areaRiskMap.get(table.seatingAreaId);
        riskLevel = ar.riskLevel;
        displayType = ar.displayType;
        riskMessage = ar.riskMessage;
        suggestedStatus = ar.suggestedStatus;
        status = suggestedStatus;
      }

      // Normalize riskMessage to exactly match user business rules
      if (displayType === "Available") {
        riskMessage = "Bàn còn trống, sẵn sàng phục vụ.";
      } else if (displayType === "TimelineNotice") {
        riskMessage = "Bàn này đã có khách đặt vào khung giờ sau. Nếu dùng bữa lâu hơn dự kiến, nhà hàng có thể cần hỗ trợ sắp xếp chỗ ngồi để phục vụ khách tiếp theo.";
      } else if (displayType === "BookingRisk") {
        if (riskLevel === "High") {
          riskMessage = "Bàn này đã có khách đặt ở khung giờ trước bạn. Nếu khách trước dùng bàn lâu hơn dự kiến, bạn có thể cần chờ thêm hoặc được nhà hàng hỗ trợ đổi sang bàn khác.";
        } else if (riskLevel === "Medium") {
          riskMessage = "Bàn này đã có khách đặt ở khung giờ trước bạn. Có khả năng thấp nếu khách trước dùng bàn lâu hơn dự kiến, bạn có thể cần chờ thêm hoặc được nhà hàng hỗ trợ đổi sang bàn khác.";
        } else {
          riskMessage = "Bàn này đã có khách đặt trước bạn nhưng khoảng cách giữa hai lượt đặt khá an toàn. Thông thường nhà hàng vẫn có thể chuẩn bị bàn đúng giờ.";
        }
      } else if (displayType === "Conflict" || displayType === "Occupied" || status === "occupied") {
        riskMessage = "Bàn đã có khách đặt trong khung giờ bạn chọn.";
      } else if (displayType === "Locked" || status === "locked" || status === "maintenance") {
        riskMessage = "Bàn đang tạm ngừng phục vụ hoặc bảo trì.";
      }

      return {
        ...table,
        status,
        riskLevel,
        displayType,
        riskMessage,
        suggestedStatus,
      };
    }),
  };
}

export const getTableStatus = bookingCheckStatus;

export async function bookingCreate({
  token,
  seatingAreaId,
  tableName,
  booking_date,
  booking_time,
  num_of_people,
  note,
}) {
  const bearer = token || currentToken();
  const user = sessionUser();
  if (!bearer || !user)
    return { ok: false, message: "Vui lòng đăng nhập để đặt bàn." };

  if (!seatingAreaId)
    return { ok: false, message: "Không tìm thấy khu vực bàn phù hợp." };

  const result = await requestJson("/api/reservations", {
    method: "POST",
    token: bearer,
    body: {
      seatingAreaId: seatingAreaId,
      reservationDate: booking_date,
      startTime: normalizeTime(booking_time),
      guestCount: Number(num_of_people),
      tableName: tableName,
      specialNote: String(note || "").trim(),
      guestName: user.full_name,
      guestEmail: user.email,
      guestPhone: user.phone,
    },
  });

  if (!result.ok) return result;
  
  const tables = await getTablesWithAreas();
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

export async function bookingMe({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const tables = await getTablesWithAreas();
  const result = await requestJson("/api/reservations/me", { token: bearer });
  if (!result.ok) return result;

  const data = Array.isArray(result.data)
    ? result.data.map((reservation) =>
        normalizeReservation(reservation, tables),
      )
    : [];
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

  const refreshed = await requestJson(`/api/reservations/${id}`, {
    token: bearer,
  });
  if (refreshed.ok) {
    const tables = await getTablesWithAreas();
    return { ok: true, data: normalizeReservation(refreshed.data, tables) };
  }

  return { ok: true, data: { id, status: "cancelled" } };
}

export async function bookingReschedule({ token, id, booking_date, booking_time }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/reservations/${id}/reschedule`, {
    method: "POST",
    token: bearer,
    body: {
      reservationDate: booking_date,
      startTime: normalizeTime(booking_time),
    },
  });

  if (!result.ok) return result;

  const tables = await getTablesWithAreas();
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

export async function adminGetRestaurantInfo() {
  const bearer = currentToken();
  return await requestJson("/api/public/restaurant-info", { token: bearer });
}

export async function adminUpdateRestaurantInfo(data) {
  const bearer = currentToken();
  return await requestJson("/api/admin/restaurant-info", {
    method: "PUT",
    token: bearer,
    body: data,
  });
}

export async function adminParseMapUrl({ mapUrl }) {
  const bearer = currentToken();
  return await requestJson("/api/admin/restaurant-info/parse-map-url", {
    method: "POST",
    token: bearer,
    body: { mapUrl },
  });
}

// STAFF ACTIONS (Staff role only)
export async function adminConfirmBooking({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/admin/reservations/${id}/confirm`, {
    method: "PUT",
    token: bearer,
  });
  if (!result.ok) return result;

  const tables = await getTablesWithAreas();
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

export async function adminRejectBooking({ token, id }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/admin/reservations/${id}/reject`, {
    method: "PUT",
    token: bearer,
  });
  if (!result.ok) return result;

  const tables = await getTablesWithAreas();
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

export async function adminCheckInBooking({ token, id, checkInImageUrl, checkInNote }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const result = await requestJson(`/api/admin/reservations/${id}/checkin`, {
    method: "PUT",
    token: bearer,
    body: { 
      checkInImageUrl: checkInImageUrl || null,
      checkInNote: checkInNote || null
    },
  });
  if (!result.ok) return result;

  const tables = await getTablesWithAreas();
  return { ok: true, data: normalizeReservation(result.data, tables) };
}

// AUTH – Forgot / Reset Password
export async function authForgotPassword({ email }) {
  return await requestJson("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function authResetPassword({ token, newPassword, confirmPassword }) {
  return await requestJson("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword, confirmPassword },
  });
}

// RESTAURANT INFO & FEEDBACK
export async function restaurantInfoGet() {
  const result = await requestJson(`/api/public/restaurant-info?_t=${Date.now()}`);
  
  const isTaoTao = TENANT_DOMAIN.toLowerCase().includes("taotao") || TENANT_DOMAIN.toLowerCase().includes("táo tào") || localStorage.getItem("tenant_is_taotao") === "true";
  const isMonari = TENANT_DOMAIN.toLowerCase().includes("monari") || localStorage.getItem("tenant_is_monari") === "true";
  const isComGa = TENANT_DOMAIN.toLowerCase().includes("comga") || TENANT_DOMAIN.toLowerCase().includes("ongbach") || localStorage.getItem("tenant_is_comga") === "true";
  const isEmCoffee = TENANT_DOMAIN.toLowerCase().includes("emcoffee") || TENANT_DOMAIN.toLowerCase().includes("em") || localStorage.getItem("tenant_is_emcoffee") === "true";
  const isHanHuyen = TENANT_DOMAIN.toLowerCase().includes("hanhuyen") || localStorage.getItem("tenant_is_hanhuyen") === "true";
  const isCochin = TENANT_DOMAIN.toLowerCase().includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";
  const isComTam = TENANT_DOMAIN.toLowerCase().includes("comtam") || TENANT_DOMAIN.toLowerCase().includes("comtamno") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = TENANT_DOMAIN.toLowerCase().includes("samhouse") || TENANT_DOMAIN.toLowerCase().includes("samhouses") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = TENANT_DOMAIN.toLowerCase().includes("monquanchat") || TENANT_DOMAIN.toLowerCase().includes("monquangchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = TENANT_DOMAIN.toLowerCase().includes("hoatearoom") || TENANT_DOMAIN.toLowerCase().includes("hoatea") || localStorage.getItem("tenant_is_hoatearoom") === "true";
  
  const defaultMapUrl = isTaoTao
    ? "https://maps.google.com/maps?q=102/16+Đường+Lê+Lai,+Ninh+Kiều,+Cần+Thơ&t=&z=15&ie=UTF8&iwloc=&output=embed"
    : (isMonari
      ? "https://maps.google.com/maps?q=250+Trần+Hưng+Đạo,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
      : (isComGa
        ? "https://maps.google.com/maps?q=146+Đường+GS1,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed"
        : (isEmCoffee
          ? "https://maps.google.com/maps?q=27+Võ+Văn+Ngân,+Linh+Chiểu,+Thủ+Đức,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
          : (isHanHuyen
            ? "https://maps.google.com/maps?q=45+Hàn+Huyên,+Bến+Nghé,+Quận+1,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
            : (isCochin
              ? "https://maps.google.com/maps?q=12+Đặng+Dung,+Tân+Định,+Quận+1,+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
              : (isComTam
                ? "https://maps.google.com/maps?q=C%C6%A1m%20T%E1%BA%A5m%20Ng%E1%BB%8D%20C%E1%BA%A7n%20Th%C6%A1&t=&z=17&ie=UTF8&iwloc=&output=embed"
                : ((isSamHouse || isMonQuanChat)
                    ? "https://maps.google.com/maps?q=%C4%90%C6%B0%E1%BB%9Dng%20GS1%20%C4%90%C3%B4ng%20H%C3%B2a%20D%C4%A9%20An%20B%C3%ACnh%20D%C6%B0%C6%A1ng&t=&z=17&ie=UTF8&iwloc=&output=embed"
                    : (isHoaTeaRoom
                        ? "https://maps.google.com/maps?q=18/2%20%C4%90%C6%B0%E1%BB%9Dng%20s%E1%BB%91%204%20%C4%90%C3%B4ng%20H%C3%B2a%20D%C4%A9%20An%20B%C3%ACnh%20D%C6%B0%C6%A1ng&t=&z=17&ie=UTF8&iwloc=&output=embed"
                        : "https://maps.google.com/maps?q=Yakishime%20C%E1%BA%A7n%20Th%C6%A1&t=&z=17&ie=UTF8&iwloc=&output=embed"))))))));

  if (!result.ok || !result.data) {
    console.warn("Using offline mock data fallback for restaurantInfoGet");
    return {
      ok: true,
      data: {
        name: isTaoTao ? "Táo Tào cà phê" : (isMonari ? "MONARI" : (isComGa ? "Cơm Gà Ông Bách" : (isEmCoffee ? "Em Coffee" : (isHanHuyen ? "Quán Nước Hàn Huyên" : (isCochin ? "Cochin Café" : (isComTam ? "Cơm Tấm Ngọ" : (isSamHouse ? "Cafe Sam Houses" : (isMonQuanChat ? "Món Quảng Chất" : (isHoaTeaRoom ? "Hòa Tea Room" : "Yakishime"))))))))),
        address: isTaoTao
          ? "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ, Vietnam"
          : (isMonari
            ? "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam"
            : (isComGa
              ? "146 Đường GS1, Đông Hòa, Hồ Chí Minh, Vietnam"
              : (isEmCoffee
                ? "27 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM"
                : (isHanHuyen
                  ? "45/3 Hàn Huyên, Bến Nghé, Quận 1, TP.HCM"
                  : (isCochin
                    ? "12 Đặng Dung, Tân Định, Quận 1, TP.HCM"
                    : (isComTam 
                      ? "106 Đường GS1, Khu Phố Đông Hòa, Dĩ An, Bình Dương" 
                      : (isSamHouse ? "Đường GS1, Đông Hòa, Dĩ An, Bình Dương" : (isMonQuanChat ? "Đường GS1, Đông Hòa, Dĩ An, Bình Dương" : (isHoaTeaRoom ? "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương" : "57 Nguyễn Cư Trinh, Thới Bình, Ninh Kiều, Cần Thơ"))))))))),
        hotline: isTaoTao ? "0901 234 567" : (isMonari ? "0908 123 456" : (isComGa ? "0938 123 789" : (isEmCoffee ? "0909 333 444" : (isHanHuyen ? "0912 555 666" : (isCochin ? "0934 777 888" : (isComTam ? "0338353868" : (isSamHouse ? "0762 801 234" : (isMonQuanChat ? "0907 888 999" : (isHoaTeaRoom ? "0356 789 012" : "0945781173"))))))))),
        email: isTaoTao ? "contact@taotaocafe.vn" : (isMonari ? "contact@monari.vn" : (isComGa ? "contact@comgaongbach.com" : (isEmCoffee ? "contact@emcoffee.vn" : (isHanHuyen ? "contact@hanhuyen.vn" : (isCochin ? "contact@cochin.vn" : (isComTam ? "comtamno@gmail.com" : (isSamHouse ? "cafesamhouse@gmail.com" : (isMonQuanChat ? "monquanchat@gmail.com" : (isHoaTeaRoom ? "contact@hoatearoom.vn" : "hello@yakicafe.local"))))))))),
        openHours: isTaoTao ? "07:00 – 22:30" : (isMonari ? "07:30 – 22:30" : (isComGa ? "09:30 – 21:30" : (isEmCoffee ? "07:00 – 22:00" : (isHanHuyen ? "06:30 – 22:00" : (isCochin ? "07:30 – 22:30" : (isComTam ? "07:00 – 14:00" : (isSamHouse ? "07:30 – 22:00" : (isMonQuanChat ? "10:00 – 22:00" : (isHoaTeaRoom ? "08:30 – 22:00" : "08:00 - 22:00"))))))))),
        mapEmbedUrl: defaultMapUrl,
        themeColor: isTaoTao ? "#C86828" : (isMonari ? "#C86D51" : (isComGa ? "#D97706" : (isEmCoffee ? "#8B5A2B" : (isHanHuyen ? "#618269" : (isCochin ? "#2A5944" : (isComTam ? "#E07B39" : (isSamHouse ? "#8B4513" : (isMonQuanChat ? "#8B1A1A" : (isHoaTeaRoom ? "#1E4620" : "#2D6A4F"))))))))),
        logo: isTaoTao ? "/assets/taotao/logo.jpg" : (isMonari ? "/assets/monari/decor/logo.png" : (isComGa ? "/assets/comgaongbach/decor/logo.png" : (isEmCoffee ? "/assets/emcoffee/logo.jpg" : (isHanHuyen ? "/assets/hanhuyen/Logo.jpg" : (isCochin ? "/assets/cochin/logo.png" : (isComTam ? "/assets/comtamno/logo.jpg" : (isSamHouse ? "/assets/samhouse/decor/logo.png" : (isMonQuanChat ? "/assets/monquanchat/decor/logo.png" : (isHoaTeaRoom ? "/assets/hoatearoom/decor/logo.png" : "/assets/images/logo.jpg")))))))))
      }
    };
  }

  const mapEmbedUrl =
    result.data.mapUrl && result.data.mapUrl.includes("embed")
      ? result.data.mapUrl
      : defaultMapUrl;

  return {
    ok: true,
    data: {
      name: result.data.tenantName || result.data.TenantName || "Yakishime",
      address: result.data.address,
      hotline: result.data.phone,
      email: result.data.tenantName ? `${result.data.tenantName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "")}@gmail.com` : "hello@yakicafe.local",
      openHours: result.data.openingHours,
      mapEmbedUrl,
      themeColor: result.data.themeColor || result.data.ThemeColor || null,
      logo: result.data.logo || result.data.Logo || null
    },
  };
}

export async function feedbackCreate({ token, title, content }) {
  const bearer = token || currentToken();
  const user = sessionUser();
  if (!bearer || !user)
    return { ok: false, message: "Vui lòng đăng nhập để gửi phản hồi." };

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

  const result = await requestJson("/api/public/feedbacks/my", {
    token: bearer,
  });
  if (!result.ok) return result;

  const data = Array.isArray(result.data) ? result.data.map(mapFeedback) : [];
  return { ok: true, data };
}

export async function adminGetStats({ token }) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  return await requestJson("/api/admin/stats", { token: bearer });
}

export async function adminGetBookings({
  token,
  date,
  status,
  search,
  sortBy,
  page,
  pageSize,
}) {
  const bearer = token || currentToken();
  if (!bearer) return { ok: false, message: "Unauthorized" };

  const query = {};
  if (date) query.date = date;
  if (status) query.status = status;
  if (search) query.search = search;
  if (sortBy) query.sortBy = sortBy;
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
  if (!result.ok || !Array.isArray(result.data)) {
    console.warn("Using offline mock data fallback for getTestimonials");
    return { ok: true, data: [] };
  }

  const data = result.data.map(mapReview);
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

function getMockMenuItems() {
  const isComTam = TENANT_DOMAIN.toLowerCase().includes("comtam") || TENANT_DOMAIN.toLowerCase().includes("comtamno") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = TENANT_DOMAIN.toLowerCase().includes("samhouse") || TENANT_DOMAIN.toLowerCase().includes("samhouses") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = TENANT_DOMAIN.toLowerCase().includes("monquanchat") || TENANT_DOMAIN.toLowerCase().includes("monquangchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = TENANT_DOMAIN.toLowerCase().includes("hoatearoom") || localStorage.getItem("tenant_is_hoatearoom") === "true";
  const isMonari = TENANT_DOMAIN.toLowerCase().includes("monari") || localStorage.getItem("tenant_is_monari") === "true";
  const isComGa = TENANT_DOMAIN.toLowerCase().includes("comga") || TENANT_DOMAIN.toLowerCase().includes("comgaongbach") || localStorage.getItem("tenant_is_comga") === "true";

  if (isComGa) {
    return [
      {
        id: "cg1",
        name: "Combo Cơm Gà Luộc & Cơm Gà Quay",
        price: 115000,
        category: "Combo",
        imageUrl: "/assets/comgaongbach/menu/combo_ga_luoc_ga_quay.jpg",
        description: "Sự kết hợp hoàn hảo giữa cơm gà luộc da vàng giòn ngọt thịt và cơm gà quay xém cạnh thơm lừng đậm đà cho 2 người.",
        tag: "best_seller"
      },
      {
        id: "cg2",
        name: "Combo Cơm Gà Luộc & Cơm Xá Xíu",
        price: 109000,
        category: "Combo",
        imageUrl: "/assets/comgaongbach/menu/combo_ga_luoc_xa_xiu.jpg",
        description: "Bộ đôi cơm gà luộc ngọt thịt cùng thịt xá xíu mật ong đỏ au, thơm lừng vị sốt gia truyền trứ danh.",
        tag: "trending"
      },
      {
        id: "cg3",
        name: "Cơm Gà Luộc & Xá Xíu",
        price: 65000,
        category: "MainCourse",
        imageUrl: "/assets/comgaongbach/menu/com_ga_luoc_xa_xiu.jpg",
        description: "Đĩa cơm vàng ươm hạt dẻo thơm ăn kèm thịt gà thả vườn luộc mềm mọng và xá xíu sốt đậm đà.",
        tag: "best_seller"
      },
      {
        id: "cg4",
        name: "Cơm Gà Luộc Thượng Hạng",
        price: 55000,
        category: "MainCourse",
        imageUrl: "/assets/comgaongbach/menu/com_ga_luoc.jpg",
        description: "Thịt gà ta thả vườn luộc chuẩn độ chín tới, da vàng giòn sần sật, thịt ngọt béo ngậy chấm mắm gừng gia truyền.",
        tag: "best_seller"
      },
      {
        id: "cg5",
        name: "Cơm Gà Quay Giòn Rụm",
        price: 58000,
        category: "MainCourse",
        imageUrl: "/assets/comgaongbach/menu/com_ga_quay.jpg",
        description: "Gà ướp thảo mộc quay xém da vàng rộm, dậy mùi tiêu hồi quế, thịt mềm mọng ngập tràn nước sốt thơm ngon.",
        tag: "trending"
      },
      {
        id: "cg6",
        name: "Trứng Ngâm Tương Lòng Đào",
        price: 12000,
        category: "MainCourse",
        imageUrl: "/assets/comgaongbach/menu/trung_ngam_tuong.jpg",
        description: "Trứng gà ta luộc lòng đào béo ngậy, ướp trong sốt tương gia truyền thơm dịu ngọt mặn hài hòa ăn kèm cơm.",
        tag: "normal"
      },
      {
        id: "cg7",
        name: "Nước Sâm Bí Đao Hạt Chia",
        price: 18000,
        category: "Drink",
        imageUrl: "/assets/comgaongbach/menu/sam_bi_dao.jpg",
        description: "Nấu từ bí đao tươi, lá dứa, la hán quả và hạt chia bổ dưỡng, thanh nhiệt giải khát trọn vẹn vị ngọt thanh mát.",
        tag: "new"
      }
    ];
  }

  if (isMonari) {
    return [
      {
        id: "mn1",
        name: "Set Bánh Trung Thu Cao Cấp (4 bánh)",
        price: 552000,
        category: "Combo",
        imageUrl: "/assets/monari/menu/set_banh_trung_thu.jpg",
        images: [
          "/assets/monari/menu/set_banh_trung_thu.jpg",
          "/assets/monari/menu/set_banh_trung_thu_1.jpg",
          "/assets/monari/menu/set_banh_trung_thu_2.jpg"
        ],
        description: "Set bánh thủ công cao cấp gồm 4 bánh (2 nhân ngọt tinh tuyển, 2 nhân mặn đậm đà) trong hộp quà sang trọng.",
        tag: "best_seller"
      },
      {
        id: "mn2",
        name: "Coco Matcha Tươi Mát",
        price: 55000,
        category: "Drink",
        imageUrl: "/assets/monari/menu/coco_matcha.jpg",
        description: "Sự kết hợp hoàn hảo giữa bột matcha nguyên chất cao cấp và nước dừa xiêm tươi ngọt mát thanh lành.",
        tag: "trending"
      },
      {
        id: "mn3",
        name: "Nước Dừa Quế Hoa",
        price: 49000,
        category: "Drink",
        imageUrl: "/assets/monari/menu/nuoc_dua_que_hoa.jpg",
        description: "Nước dừa tươi thanh khiết ướp cánh hoa quế ngạt ngào, mang lại cảm giác thanh mát thư thái tuyệt đối.",
        tag: "signature"
      },
      {
        id: "mn4",
        name: "Trà Lựu Đỏ Ngọc Trai",
        price: 48000,
        category: "Drink",
        imageUrl: "/assets/monari/menu/tra_luu_do.jpg",
        description: "Trà lựu đỏ thơm nồng nàn vị trái cây tươi chín mọng kết hợp trân châu ngọc trai giòn sần sật.",
        tag: "best_seller"
      },
      {
        id: "mn5",
        name: "Trà Ổi Hồng Ngọc Trai",
        price: 48000,
        category: "Drink",
        imageUrl: "/assets/monari/menu/tra_oi_hong.jpg",
        description: "Hương thơm ngọt ngào quyến rũ từ ổi hồng nhiệt đới hòa quyện lớp trà thanh nhẹ cùng hạt ngọc trai tươi.",
        tag: "trending"
      }
    ];
  }

  if (isTaoTao) {
    return [
      {
        id: "tt1",
        name: "Cà phê kem muối",
        price: 35000,
        category: "Coffee",
        imageUrl: "/assets/taotao/dishes/ca_phe_kem_muoi.jpg",
        description: "Cà phê Robusta thơm đậm kết hợp lớp kem muối sánh ngậy béo mặn đặc trưng quán Táo Tào.",
        tag: "signature"
      },
      {
        id: "tt2",
        name: "Trà sữa Ô Long phô mai",
        price: 42000,
        category: "MilkTea",
        imageUrl: "/assets/taotao/dishes/tra_sua_olong_pho_mai.jpg",
        description: "Trà ô long đậm vị kết hợp phô mai tươi béo ngậy thơm lừng khó cưỡng.",
        tag: "best_seller"
      },
      {
        id: "tt3",
        name: "Hồng trà phô mai",
        price: 38000,
        category: "MilkTea",
        imageUrl: "/assets/taotao/dishes/hong_tra_pho_mai.jpg",
        description: "Hồng trà thanh ngọt dịu mát quyện cùng lớp kem phô mai béo mịn màng.",
        tag: "trending"
      },
      {
        id: "tt4",
        name: "Chanh leo dừa non",
        price: 39000,
        category: "FruitTea",
        imageUrl: "/assets/taotao/dishes/chanh_leo_dua_non.jpg",
        description: "Vị chua ngọt thanh mát giải nhiệt từ chanh leo kết hợp cùi dừa non tươi giòn sần sật.",
        tag: "signature"
      },
      {
        id: "tt5",
        name: "Matcha nhài Macchiato",
        price: 45000,
        category: "MilkTea",
        imageUrl: "/assets/taotao/dishes/matcha_nhai_machiato.jpg",
        description: "Matcha Nhật Bản thơm ngát hương hoa nhài thanh tao kết hợp kem Macchiato bồng bềnh béo dịu.",
        tag: "best_seller"
      }
    ];
  }

  if (isEmCoffee) {
    return [
      { id: "em1", name: "Phindi Hạnh Nhân", price: 45000, category: "Coffee", imageUrl: "/assets/emcoffee/dishes/phindi_hanh_nhan.jpg", description: "Cà phê phin êm dịu kết hợp sốt hạnh nhân béo ngậy thơm nức và sữa tươi thanh trùng.", tag: "signature" },
      { id: "em2", name: "Cacao Caramel Béo Ngậy", price: 42000, category: "Latte", imageUrl: "/assets/emcoffee/dishes/cacao_caramel.jpg", description: "Cacao nguyên chất đậm đà hòa cùng sốt caramel thơm lừng ngọt ngào.", tag: "best_seller" },
      { id: "em3", name: "Trà Vải Atiso Đỏ", price: 45000, category: "FruitTea", imageUrl: "/assets/emcoffee/dishes/tra_vai_atiso.jpg", description: "Vị chua thanh mát lành từ hoa atiso đỏ quyện cùng trái vải ngọt mọng nước.", tag: "trending" },
      { id: "em4", name: "Trà Đào Xanh Nhài", price: 39000, category: "FruitTea", imageUrl: "/assets/emcoffee/dishes/tra_dau_xanh_nhai.jpg", description: "Hương hoa nhài thơm ngát hòa quyện nước cốt đào tươi cùng miếng đào giòn dai.", tag: "best_seller" },
      { id: "em5", name: "Matcha Latte Nguyên Bản", price: 45000, category: "Latte", imageUrl: "/assets/emcoffee/dishes/matcha_latte.jpg", description: "Bột matcha trà xanh thượng hạng kết hợp sữa tươi thanh trùng mềm mượt dịu dàng.", tag: "normal" }
    ];
  }

  if (isHanHuyen) {
    return [
      { id: "hh1", name: "Phê Xỉu Đặc Biệt", price: 35000, category: "Coffee", imageUrl: "/assets/hanhuyen/dishes/phe_xiu.jpg", description: "Bạc xỉu ba tầng đậm đà, sữa đặc thơm béo kết hợp lớp bọt cà phê sánh mịn quyến rũ.", tag: "signature" },
      { id: "hh2", name: "Phê Đá Đậm Vị", price: 29000, category: "Coffee", imageUrl: "/assets/hanhuyen/dishes/phe_da.jpg", description: "Cà phê Robusta rang mộc truyền thống đậm đà, đánh thức mọi giác quan ngày mới.", tag: "best_seller" },
      { id: "hh3", name: "Phindi Hạnh Nhân", price: 45000, category: "Coffee", imageUrl: "/assets/hanhuyen/dishes/phindi_hanh_nhan.jpg", description: "Cà phê phin thơm lừng kết hợp kem sữa hạnh nhân béo ngậy thơm ngon tuyệt hảo.", tag: "trending" },
      { id: "hh4", name: "Trà Đào Xanh Nhài", price: 39000, category: "FruitTea", imageUrl: "/assets/hanhuyen/dishes/tra_dao_xanh_nhai.jpg", description: "Trà xanh ướp hương hoa nhài tự nhiên kết hợp đào ngâm thanh ngọt mát lạnh.", tag: "best_seller" },
      { id: "hh5", name: "Trà Vải Nhiệt Đới", price: 45000, category: "FruitTea", imageUrl: "/assets/hanhuyen/dishes/tra_vai.jpg", description: "Trà thanh khiết hòa cùng trái vải mọng nước, thức uống giải nhiệt lý tưởng.", tag: "normal" }
    ];
  }

  if (isCochin) {
    return [
      { id: "cc1", name: "Trà Sữa Ô Long Rang", price: 45000, category: "MilkTea", imageUrl: "/assets/cochin/dishes/tra_sua_olong_rang.jpg", description: "Lá trà ô long sấy rang đậm hương khói thảo mộc hòa quyện sữa béo thơm nồng nàn.", tag: "signature" },
      { id: "cc2", name: "Caffe Latte", price: 48000, category: "Coffee", imageUrl: "/assets/cochin/dishes/latte.jpg", description: "Espresso chuẩn vị Ý kết hợp lớp bọt sữa tươi mềm mượt như nhung.", tag: "best_seller" },
      { id: "cc3", name: "Trà Ổi Hồng Nhiệt Đới", price: 42000, category: "FruitTea", imageUrl: "/assets/cochin/dishes/tra_oi_hong.jpg", description: "Hương ổi hồng dịu dàng ngọt ngào kết hợp trà hoa thanh nhã giải nhiệt ngày hè.", tag: "trending" },
      { id: "cc4", name: "Trà Thanh Long Đỏ", price: 45000, category: "FruitTea", imageUrl: "/assets/cochin/dishes/tra_thanh_long_do.jpg", description: "Sắc đỏ rực rỡ từ thanh long ruột đỏ tự nhiên hòa cùng vị trà chua ngọt sảng khoái.", tag: "signature" },
      { id: "cc5", name: "Trà Vải Hoa Hồng", price: 45000, category: "FruitTea", imageUrl: "/assets/cochin/dishes/tra_vai_hoa_hong.jpg", description: "Hương hoa hồng quý phái quyện cùng vị ngọt lịm mọng nước của trái vải tươi.", tag: "best_seller" },
      { id: "cc6", name: "Hồng Trà Sữa Cochin", price: 42000, category: "MilkTea", imageUrl: "/assets/cochin/dishes/hong_tra_sua.jpg", description: "Hồng trà Ceylon thượng hạng kết hợp sữa tươi thanh ngọt đậm đà khó phai.", tag: "normal" },
      { id: "cc7", name: "Sô-cô-la Đá Xay", price: 48000, category: "Drink", imageUrl: "/assets/cochin/dishes/so_co_la.jpg", description: "Sô-cô-la nguyên chất béo thơm hòa quyện kem tươi sánh ngậy mát lạnh.", tag: "normal" }
    ];
  }

  if (isComTam) {
    return [
      { id: "ct1", name: "Cơm tấm sườn nướng mật ong", price: 45000, category: "MainCourse", imageUrl: "/assets/comtamno/hero.jpg", description: "Cơm tấm sườn cốt lết nướng mật ong vàng ruộm, bì dai giòn và chả trứng hấp béo ngậy.", tag: "signature" },
      { id: "ct2", name: "Cơm tấm bì chả đặc biệt", price: 40000, category: "MainCourse", imageUrl: "/assets/comtamno/n2_2.jpg", description: "Bì thính thơm lừng quyện chả trứng chưng truyền thống cực ngon miệng.", tag: "best_seller" },
      { id: "ct3", name: "Bún thịt nướng chả giò", price: 42000, category: "MainCourse", imageUrl: "/assets/comtamno/n4_2.jpg", description: "Bún thịt nướng than hồng thơm phức kèm chả giò chiên giòn rụm ăn đã thèm.", tag: "trending" },
      { id: "ct4", name: "Đùi gà nướng mật ong", price: 48000, category: "MainCourse", imageUrl: "/assets/comtamno/n4_1.jpg", description: "Đùi gà nướng mật ong vàng óng, da giòn thịt ngọt ngào dai béo.", tag: "none" },
      { id: "ct5", name: "Canh rong biển thanh mát", price: 15000, category: "Snack", imageUrl: "/assets/comtamno/n6_1.jpg", description: "Canh rong biển nấu tôm thịt thanh nhiệt giải độc ngày hè cực tốt.", tag: "none" },
      { id: "ct6", name: "Trà đá sâm dứa", price: 5000, category: "Drink", imageUrl: "/assets/comtamno/logo.jpg", description: "Trà đá sâm dứa thơm mát lạnh sảng khoái.", tag: "none" }
    ];
  }

  if (isSamHouse) {
    return [
      { id: "sh1", name: "Cà phê muối", price: 40000, category: "Coffee", imageUrl: "/assets/samhouse/menu/ca_phe_muoi.jpg", description: "Sự kết hợp hoàn hảo giữa vị đắng Robusta, ngọt sữa và béo mặn của lớp kem muối sánh mịn.", tag: "signature" },
      { id: "sh2", name: "Bạc xỉu", price: 37000, category: "Coffee", imageUrl: "/assets/samhouse/menu/bac_xiu.jpg", description: "Cà phê sữa đá đậm đà kết hợp nhiều sữa thơm béo ngon miệng tuyệt vời.", tag: "best_seller" },
      { id: "sh3", name: "Trà xoài Macchiato", price: 45000, category: "FruitTea", imageUrl: "/assets/samhouse/menu/tra_xoai_macchiato_45.jpg", description: "Trà xoài ngọt ngào mát lạnh kết hợp lớp kem sữa Macchiato béo mịn sánh ngậy.", tag: "best_seller" },
      { id: "sh4", name: "Trà xoài Macchiato (L)", price: 50000, category: "FruitTea", imageUrl: "/assets/samhouse/menu/tra_xoai_macchiato_50.jpg", description: "Trà xoài Macchiato cỡ lớn cực đã, béo ngậy ngọt ngào nhân đôi sảng khoái.", tag: "none" },
      { id: "sh5", name: "Trà sữa đào", price: 39000, category: "MilkTea", imageUrl: "/assets/samhouse/menu/tra_sua_dao.jpg", description: "Trà sữa vị đào thơm dịu ngọt, ăn kèm miếng đào ngâm giòn dai thơm ngát.", tag: "trending" },
      { id: "sh6", name: "Trà vải lài (L)", price: 50000, category: "FruitTea", imageUrl: "/assets/samhouse/menu/tra_vai_lai.jpg", description: "Trà lài thanh mát hòa quyện nước quả vải ngọt lịm và thịt vải căng mọng.", tag: "none" },
      { id: "sh7", name: "Trà măng cụt", price: 50000, category: "FruitTea", imageUrl: "/assets/samhouse/menu/tra_mang_cut.jpg", description: "Thức uống giải nhiệt độc đáo kết hợp nước trà hảo hạng và thịt quả măng cụt tươi giòn ngọt.", tag: "trending" },
      { id: "sh8", name: "Olong trà sữa (L)", price: 42000, category: "MilkTea", imageUrl: "/assets/samhouse/menu/olong_tra_sua.jpg", description: "Trà Olong đậm vị hòa cùng sữa béo thơm mịn màng kích thước lớn cực đã.", tag: "none" },
      { id: "sh9", name: "Lục trà sữa mật ong + trân châu trắng (L)", price: 55000, category: "MilkTea", imageUrl: "/assets/samhouse/menu/luc_tra_sua_mat_ong.jpg", description: "Lục trà thanh mát quyện mật ong tự nhiên và trân châu trắng giòn sần sật.", tag: "signature" },
      { id: "sh10", name: "Sữa tươi trân châu đường đen", price: 39000, category: "MilkTea", imageUrl: "/assets/samhouse/menu/sua_tuoi_tran_chau_duong_den.jpg", description: "Sữa tươi thanh trùng mát lạnh kết hợp trân châu đường đen dai giòn ngọt lịm.", tag: "none" }
    ];
  }

  if (isMonQuanChat) {
    return [
      { id: "mq1", name: "Bánh tráng cuốn thịt heo ba chỉ", price: 99000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/banh_trang_thit_heo_ba_chi.jpg", description: "Thịt heo ba chỉ luộc mềm ngọt cuộn rau rừng Tây Ninh, chấm mắm nêm đậm đà chuẩn vị Quảng.", tag: "signature" },
      { id: "mq2", name: "Bánh tráng cuốn thịt heo quay", price: 149000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/banh_trang_thit_heo_quay.jpg", description: "Thịt heo quay giòn bì thơm phức cuốn bánh tráng, rau sống tươi ngon cùng mắm nêm đặc sản.", tag: "best_seller" },
      { id: "mq3", name: "Bánh xèo tôm thịt", price: 89000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/banh_xeo_tom_thit.jpg", description: "Bánh xèo vỏ giòn tan nhân tôm thịt đầy đặn, giá đỗ thanh ngọt ăn kèm rau sống và sốt đậu phộng béo bùi.", tag: "trending" },
      { id: "mq4", name: "Bún mắm nêm thịt luộc", price: 45000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/bun_mam_nem_thit_luoc.jpg", description: "Bún tươi ăn cùng thịt heo luộc ngọt mềm, rau sống xắt nhỏ, lạc rang rưới nước mắm nêm thơm nồng.", tag: "best_seller" },
      { id: "mq5", name: "Cao lầu", price: 45000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/cao_lau.jpg", description: "Sợi mì Cao lầu vàng giòn dai, thịt xá xíu đậm đà, da heo chiên phồng cùng nước dùng ngọt thanh xắt rau sống.", tag: "signature" },
      { id: "mq6", name: "Mỳ quảng tôm thịt", price: 45000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/my_quang_tom_thit.jpg", description: "Mỳ Quảng truyền thống với nước nhân tôm thịt đậm đà, trứng cút bùi ngậy ăn kèm bánh tráng giòn và rau sống.", tag: "signature" },
      { id: "mq7", name: "Mỳ quảng ếch", price: 45000, category: "MainCourse", imageUrl: "/assets/monquanchat/menu/my_quang_ech.jpg", description: "Mỳ Quảng ếch om sả nén thơm lừng, thịt ếch chắc ngọt đậm vị miền Trung đặc trưng.", tag: "trending" },
      { id: "mq8", name: "Cam vắt", price: 25000, category: "Drink", imageUrl: "/assets/monquanchat/menu/cam_vat.jpg", description: "Nước cam vắt nguyên chất ngọt mát thanh nhiệt dồi dào vitamin C cực tốt cho sức khỏe.", tag: "none" },
      { id: "mq9", name: "Thơm ép", price: 25000, category: "Drink", imageUrl: "/assets/monquanchat/menu/thom_ep.jpg", description: "Nước ép quả thơm (dứa) tươi nguyên chất chua ngọt thanh mát giải nhiệt ngày hè cực đã.", tag: "none" },
      { id: "mq10", name: "Trà tắc", price: 20000, category: "Drink", imageUrl: "/assets/monquanchat/menu/tra_tac.jpg", description: "Trà tắc mát lạnh chua ngọt sảng khoái đánh tan nắng nóng.", tag: "none" }
    ];
  }

  if (isHoaTeaRoom) {
    return [
      { id: "htr1", name: "ASA Corn Matcha", price: 49000, category: "MatchaSpecial", imageUrl: "/assets/hoatearoom/menu/asa_corn_matcha.jpg", description: "Matcha nguyên chất kết hợp cùng lớp sữa bắp thơm bùi ngọt dịu.", tag: "signature" },
      { id: "htr2", name: "KAZE Coco Matcha", price: 49000, category: "MatchaSpecial", imageUrl: "/assets/hoatearoom/menu/kaze_coco_matcha.jpg", description: "Sự kết hợp sảng khoái giữa matcha Nhật Bản đậm vị và nước dừa xiêm thanh ngọt.", tag: "best_seller" },
      { id: "htr3", name: "KUMORI Matcha Tiramisu", price: 49000, category: "MatchaSpecial", imageUrl: "/assets/hoatearoom/menu/kumori_matcha_tiramisu.jpg", description: "Matcha đá xay cùng tiramisu kem béo ngậy, bánh lady fingers giòn tan.", tag: "trending" },
      { id: "htr4", name: "UBE Matcha Khoai Mỡ", price: 49000, category: "MatchaSpecial", imageUrl: "/assets/hoatearoom/menu/ube_matcha.jpg", description: "Matcha Nhật Bản kết hợp cùng sốt khoai mỡ tím thơm ngon ngọt bùi độc đáo.", tag: "none" },
      { id: "htr5", name: "Matcha Latte Cổ Điển", price: 45000, category: "MatchaClassic", imageUrl: "/assets/hoatearoom/menu/matcha_latte.jpg", description: "Sự kết hợp cổ điển giữa matcha Nhật Bản thượng hạng và sữa tươi thanh trùng béo nhẹ.", tag: "none" },
      { id: "htr6", name: "Matcha Latte Coldwhisk", price: 45000, category: "MatchaClassic", imageUrl: "/assets/hoatearoom/menu/matcha_latte_coldwhisk.jpg", description: "Matcha tươi đánh bọt lạnh công phu quyện cùng sữa tươi nguyên chất thanh mát.", tag: "none" },
      { id: "htr7", name: "Flower Box Trà Sữa", price: 99000, category: "MilkTea", imageUrl: "/assets/hoatearoom/menu/flower_box.jpg", description: "Set quà tặng đặc biệt gồm một hộp hoa tươi xinh xắn kèm trà sữa lài Mia thơm ngát.", tag: "none" },
      { id: "htr8", name: "Workshop vẽ ly (Giá nước + 5.000₫)", price: 5000, category: "Experiences", imageUrl: "/assets/hoatearoom/menu/workshop_ve_ly.jpg", description: "Trải nghiệm tự tay thiết kế và tô vẽ chiếc ly gốm xinh xắn của riêng bạn tại quán.", tag: "none" }
    ];
  }

  // Fallback to Matcha
  return [
    { id: "m1", name: "Matcha Latte (Vũ Thuỷ)", price: 45000, category: "Latte", imageUrl: "/assets/yakishime/menu/matcha_latte.jpg", description: "Sự kết hợp hoàn hảo giữa bột matcha Uji nguyên chất và sữa tươi thanh trùng béo dịu.", tag: "normal" },
    { id: "m2", name: "Coco Matcha (Thanh Minh)", price: 49000, category: "Latte", imageUrl: "/assets/yakishime/menu/coco_matcha.jpg", description: "Sự kết hợp tươi mát độc đáo giữa vị đậm đà thanh khiết của trà xanh Uji và nước dừa xiêm tự nhiên.", tag: "best_seller" },
    { id: "m3", name: "Almond Latte (Tiểu Hàn)", price: 49000, category: "Latte", imageUrl: "/assets/yakishime/menu/almond_latte.jpg", description: "Matcha Latte thơm lừng kết hợp cùng sữa hạnh nhân béo bùi, giàu dinh dưỡng.", tag: "trending" },
    { id: "m4", name: "Mango Matcha (Xuân Phân)", price: 49000, category: "Latte", imageUrl: "/assets/yakishime/menu/mango_matcha.jpg", description: "Thức uống mùa hè sảng khoái với lớp mứt xoài chín ngọt lịm quyện cùng matcha nguyên chất.", tag: "new" },
    { id: "m5", name: "Coco Jasmine", price: 50000, category: "Traditional", imageUrl: "/assets/yakishime/menu/coco_jasmine.jpg", description: "Hương vị hoa nhài thanh tao hòa quyện nước dừa xiêm mát lành.", tag: "normal" },
    { id: "m6", name: "Pistachio Matcha", price: 50000, category: "Latte", imageUrl: "/assets/yakishime/menu/pistachio_matcha.jpg", description: "Matcha béo ngậy kết hợp lớp sốt hạt dẻ cười (pistachio) thơm bùi đặc trưng.", tag: "best_seller" }
  ];
}
