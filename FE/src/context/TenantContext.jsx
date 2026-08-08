import { createContext, useContext, useEffect, useState } from "react";
import { restaurantInfoGet } from "../services/apiClient.js";
import { useThemeMode } from "./ThemeContext.jsx";

const TenantCtx = createContext(null);

const hexToHsl = (hex) => {
  if (!hex || !hex.startsWith('#')) return null;
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTenantData = (targetData, key) => {
    const rawName = targetData.name || targetData.TenantName || "";
    const isMatcha = key === "matcha" || rawName.toLowerCase().includes("yaki") || rawName.toLowerCase().includes("matcha");
    const isComTam = key === "comtam" || rawName.toLowerCase().includes("cơm tấm");
    const isSamHouse = key === "samhouse" || rawName.toLowerCase().includes("sam house") || rawName.toLowerCase().includes("samhouse");
    const isMonQuanChat = key === "monquanchat" || rawName.toLowerCase().includes("quảng") || rawName.toLowerCase().includes("monquanchat");
    const isHoaTeaRoom = key === "hoatearoom" || rawName.toLowerCase().includes("hoa") || rawName.toLowerCase().includes("hoà") || rawName.toLowerCase().includes("hòa");
    const isEmCoffee = key === "emcoffee" || rawName.toLowerCase().includes("em coffee") || rawName.toLowerCase() === "em" || rawName.toLowerCase().includes("emcoffee");
    const isTaoTao = key === "taotao" || rawName.toLowerCase().includes("táo") || rawName.toLowerCase().includes("taotao");
    const isHanHuyen = key === "hanhuyen" || rawName.toLowerCase().includes("hàn huyên") || rawName.toLowerCase().includes("hanhuyen");
    const isCochin = key === "cochin" || rawName.toLowerCase().includes("cochin");

    localStorage.setItem("tenant_is_comtam", isComTam ? "true" : "false");
    localStorage.setItem("tenant_is_samhouse", isSamHouse ? "true" : "false");
    localStorage.setItem("tenant_is_monquanchat", isMonQuanChat ? "true" : "false");
    localStorage.setItem("tenant_is_hoatearoom", isHoaTeaRoom ? "true" : "false");
    localStorage.setItem("tenant_is_emcoffee", isEmCoffee ? "true" : "false");
    localStorage.setItem("tenant_is_taotao", isTaoTao ? "true" : "false");
    localStorage.setItem("tenant_is_hanhuyen", isHanHuyen ? "true" : "false");
    localStorage.setItem("tenant_is_cochin", isCochin ? "true" : "false");
    localStorage.setItem("tenant_is_yakishime", isMatcha ? "true" : "false");

    if (isComTam) {
      document.documentElement.setAttribute('data-tenant', 'comtam');
    } else if (isSamHouse) {
      document.documentElement.setAttribute('data-tenant', 'samhouse');
    } else if (isMonQuanChat) {
      document.documentElement.setAttribute('data-tenant', 'monquanchat');
    } else if (isHoaTeaRoom) {
      document.documentElement.setAttribute('data-tenant', 'hoatearoom');
    } else if (isEmCoffee) {
      document.documentElement.setAttribute('data-tenant', 'emcoffee');
    } else if (isTaoTao) {
      document.documentElement.setAttribute('data-tenant', 'taotao');
    } else if (isHanHuyen) {
      document.documentElement.setAttribute('data-tenant', 'hanhuyen');
    } else if (isCochin) {
      document.documentElement.setAttribute('data-tenant', 'cochin');
    } else {
      document.documentElement.setAttribute('data-tenant', 'matcha');
    }

    const normalizedData = { ...targetData };
    if (isMatcha) {
      normalizedData.name = "Yakishime";
      normalizedData.address = "57 Nguyễn Cư Trinh, Cần Thơ";
    } else if (isMonQuanChat && !normalizedData.address) {
      normalizedData.address = "201 QL1K, Đông Hòa, Dĩ An, Bình Dương";
    } else if (isHoaTeaRoom && !normalizedData.address) {
      normalizedData.address = "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương";
    } else if (isEmCoffee && !normalizedData.address) {
      normalizedData.address = "Thủ Đức, TP. Hồ Chí Minh";
    } else if (isTaoTao && !normalizedData.address) {
      normalizedData.address = "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ 94000";
    } else if (isHanHuyen && !normalizedData.address) {
      normalizedData.address = "160 Đ. 30 Tháng 4, An Phú, Ninh Kiều, Cần Thơ";
    } else if (isCochin && !normalizedData.address) {
      normalizedData.address = "58 Đ. D2A, khu đô thị Vinhomes Grand Park, Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh";
    }

    const name = isMatcha ? "Yakishime" : (normalizedData.name || "Yakishime");
    document.title = name;
    const logo = normalizedData.logo || (isComTam ? "/assets/comtamno/logo.jpg" : (isSamHouse ? "/assets/samhouse/decor/logo.png" : (isMonQuanChat ? "/assets/monquanchat/decor/logo.png" : (isHoaTeaRoom ? "/assets/hoatearoom/decor/logo.png" : (isEmCoffee ? "/assets/emcoffee/logo.jpg" : (isTaoTao ? "/assets/taotao/logo.jpg" : (isHanHuyen ? "/assets/hanhuyen/Logo.jpg" : (isCochin ? "/assets/cochin/logo.jpg" : "/assets/images/logo.jpg"))))))));
    normalizedData.logo = logo;
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) {
      favicon.href = logo;
    }

    setTenant(normalizedData);
  };

  const getFallbackFor = (key) => {
    const FALLBACKS = {
      comtam: {
        id: "0af4c82f-e6fb-4711-805f-9413e216536c",
        name: "Cơm Tấm Ngọ",
        tenantName: "comtam",
        logo: "/assets/comtamno/logo.jpg",
        address: "57 Nguyễn Cư Trinh, Cần Thơ",
        hotline: "0338353868",
        email: "comtamno@gmail.com",
        openHours: "07:00 – 14:00",
        themeColor: "#E07B39",
      },
      samhouse: {
        id: "a03d87a2-72d4-48c3-8fc4-a04f2234f0d8",
        name: "Sam Houses",
        tenantName: "samhouse",
        logo: "/assets/samhouse/decor/logo.png",
        address: "Đường GS1, Đông Hòa, Dĩ An, Bình Dương",
        hotline: "0762 801 234",
        email: "cafesamhouse@gmail.com",
        openHours: "07:30 – 22:00",
        themeColor: "#8B4513",
      },
      monquanchat: {
        id: "147f2752-1116-4a07-ae77-f17c283bcf53",
        name: "Món Quảng Chất",
        tenantName: "monquanchat",
        logo: "/assets/monquanchat/decor/logo.png",
        address: "201 QL1K, Đông Hòa, Dĩ An, Bình Dương",
        hotline: "0907 888 999",
        email: "monquanchat@gmail.com",
        openHours: "10:00 – 22:00",
        themeColor: "#8B1A1A",
      },
      hoatearoom: {
        id: "6f9c9e88-3482-45e0-b6a3-2f801bfb7f8c",
        name: "Hòa Tea Room",
        tenantName: "hoatearoom",
        logo: "/assets/hoatearoom/decor/logo.png",
        address: "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương",
        hotline: "0356 789 012",
        email: "contact@hoatearoom.vn",
        openHours: "08:30 – 22:00",
        themeColor: "#1E4620",
      },
      emcoffee: {
        id: "88888888-4444-4444-4444-888888888888",
        name: "Em Coffee",
        tenantName: "emcoffee",
        logo: "/assets/emcoffee/logo.jpg",
        address: "Thủ Đức, TP. Hồ Chí Minh",
        hotline: "0901 234 567",
        email: "contact@emcoffee.vn",
        openHours: "07:00 – 22:30",
        themeColor: "#8B5A2B",
      },
      taotao: {
        id: "77777777-5555-5555-5555-777777777777",
        name: "Táo Tào cà phê",
        tenantName: "taotao",
        logo: "/assets/taotao/logo.jpg",
        address: "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ 94000",
        hotline: "0766 853 358",
        email: "contact@taotao.vn",
        openHours: "07:30 – 22:30",
        themeColor: "#9B2E22",
      },
      hanhuyen: {
        id: "99999999-6666-6666-6666-999999999999",
        name: "Quán Nước Hàn Huyên",
        tenantName: "hanhuyen",
        logo: "/assets/hanhuyen/Logo.jpg",
        address: "160 Đ. 30 Tháng 4, An Phú, Ninh Kiều, Cần Thơ",
        hotline: "0988 888 888",
        email: "contact@hanhuyen.vn",
        openHours: "07:00 – 22:00",
        themeColor: "#618269",
      },
      cochin: {
        id: "88888888-2222-2222-2222-888888888888",
        name: "Cochin Café",
        tenantName: "cochin",
        logo: "/assets/cochin/logo.jpg",
        address: "58 Đ. D2A, khu đô thị Vinhomes Grand Park, Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh",
        hotline: "0909 686 868",
        email: "contact@cochincafe.vn",
        openHours: "07:00 – 22:00",
        themeColor: "#2A5944",
      },
      matcha: {
        id: "11111111-0000-0000-0000-000000000001",
        name: "Yakishime",
        tenantName: "matcha",
        logo: "/assets/images/logo.jpg",
        address: "57 Nguyễn Cư Trinh, Cần Thơ",
        hotline: "0945781173",
        email: "hello@yakicafe.local",
        openHours: "08:00 – 22:00",
        themeColor: "#2D6A4F",
      }
    };

    const normKey = String(key || "").toLowerCase();
    if (FALLBACKS[normKey]) return FALLBACKS[normKey];
    if (normKey.includes("tam")) return FALLBACKS.comtam;
    if (normKey.includes("sam")) return FALLBACKS.samhouse;
    if (normKey.includes("quang") || normKey.includes("quảng")) return FALLBACKS.monquanchat;
    if (normKey.includes("hoa") || normKey.includes("hoà") || normKey.includes("hòa")) return FALLBACKS.hoatearoom;
    if (normKey.includes("em")) return FALLBACKS.emcoffee;
    if (normKey.includes("tao") || normKey.includes("táo")) return FALLBACKS.taotao;
    if (normKey.includes("han") || normKey.includes("hàn")) return FALLBACKS.hanhuyen;
    if (normKey.includes("cochin")) return FALLBACKS.cochin;
    return FALLBACKS.matcha;
  };

  const switchTenant = (targetKey) => {
    localStorage.setItem("dev_tenant_domain", targetKey);
    const fb = getFallbackFor(targetKey);
    applyTenantData(fb, targetKey);
    const url = new URL(window.location.href);
    url.searchParams.set("tenant", targetKey);
    window.history.replaceState({}, "", url.toString());
  };

  useEffect(() => {
    async function loadTenant() {
      // 1. Detect target tenant key from URL/Path/Storage/Host
      const urlParams = new URLSearchParams(window.location.search);
      let targetKey = urlParams.get("tenant");
      if (targetKey) {
        localStorage.setItem("dev_tenant_domain", targetKey);
      } else {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("taotao") || path.includes("taotaocafe")) targetKey = "taotao";
        else if (path.includes("emcoffee")) targetKey = "emcoffee";
        else if (path.includes("hoatearoom") || path.includes("hoatea")) targetKey = "hoatearoom";
        else if (path.includes("monquanchat") || path.includes("quang")) targetKey = "monquanchat";
        else if (path.includes("samhouse")) targetKey = "samhouse";
        else if (path.includes("comtam")) targetKey = "comtam";
        else if (path.includes("hanhuyen")) targetKey = "hanhuyen";
        else if (path.includes("cochin")) targetKey = "cochin";
        else {
          targetKey = localStorage.getItem("dev_tenant_domain") || "";
        }
      }

      const cleanKey = (targetKey || "").toLowerCase();

      try {
        const res = await restaurantInfoGet();
        if (res && res.ok && res.data) {
          applyTenantData(res.data, cleanKey);
        } else {
          throw new Error("API returned no data");
        }
      } catch (err) {
        console.warn("Using offline tenant fallback:", err);
        const fb = getFallbackFor(cleanKey);
        applyTenantData(fb, cleanKey);
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, []);

  const themeMode = useThemeMode();
  const isDark = themeMode ? themeMode.isDark : false;

  useEffect(() => {
    if (!tenant) return;
    const rawName = tenant.name || tenant.TenantName || "";
    const isComTam = rawName.toLowerCase().includes("cơm tấm") || String(tenant.tenantName).toLowerCase().includes("comtam");
    const isSamHouse = rawName.toLowerCase().includes("sam house") || rawName.toLowerCase().includes("samhouse") || String(tenant.tenantName).toLowerCase().includes("samhouse");
    const isMonQuanChat = rawName.toLowerCase().includes("quảng") || rawName.toLowerCase().includes("monquanchat") || String(tenant.tenantName).toLowerCase().includes("monquanchat");
    const isHoaTeaRoom = rawName.toLowerCase().includes("hoa") || rawName.toLowerCase().includes("hoà") || rawName.toLowerCase().includes("hòa") || String(tenant.tenantName).toLowerCase().includes("hoatearoom");
    const isEmCoffee = rawName.toLowerCase().includes("em coffee") || rawName.toLowerCase() === "em" || String(tenant.tenantName).toLowerCase().includes("emcoffee");
    const isTaoTao = rawName.toLowerCase().includes("táo") || rawName.toLowerCase().includes("taotao") || String(tenant.tenantName).toLowerCase().includes("taotao");
    const isHanHuyen = rawName.toLowerCase().includes("hàn huyên") || rawName.toLowerCase().includes("hanhuyen") || String(tenant.tenantName).toLowerCase().includes("hanhuyen");
    const isMatcha = rawName.toLowerCase().includes("yaki") || rawName.toLowerCase().includes("matcha") || String(tenant.tenantName).toLowerCase().includes("matcha");

    const themeColor = tenant.themeColor || tenant.ThemeColor || (isComTam ? "#E07B39" : (isSamHouse ? "#8B4513" : (isMonQuanChat ? "#8B1A1A" : (isHoaTeaRoom ? "#1E4620" : (isEmCoffee ? "#8B5A2B" : (isTaoTao ? "#9B2E22" : (isHanHuyen ? "#618269" : null)))))));
    if (themeColor && !isMatcha) {
      const root = document.documentElement;
      const hsl = hexToHsl(themeColor);
      if (hsl) {
        let [h, s, l] = hsl;
        
        // If dark mode is active, make the dynamic colors soft and not glaring (pastel sage/matcha style)
        if (isDark) {
          l = 52; // Soft legibility on dark background
          s = 38; // Muted saturation for pastel comfort (no neon glare)
        }
        
        root.style.setProperty('--matcha', `hsl(${h}, ${s}%, ${l}%)`);
        root.style.setProperty('--matcha-light', `hsl(${h}, ${s}%, ${Math.min(l + 10, 95)}%)`);
        root.style.setProperty('--matcha-dark', `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`);
        root.style.setProperty('--forest', `hsl(${h}, ${Math.max(s - 15, 10)}%, ${isDark ? 60 : Math.max(l - 15, 10)}%)`);
        root.style.setProperty('--forest-dark', `hsl(${h}, ${Math.max(s - 20, 10)}%, ${isDark ? 10 : Math.max(l - 25, 5)}%)`);
      }
    } else if (isMatcha) {
      const root = document.documentElement;
      root.style.removeProperty('--matcha');
      root.style.removeProperty('--matcha-light');
      root.style.removeProperty('--matcha-dark');
      root.style.removeProperty('--forest');
      root.style.removeProperty('--forest-dark');
    }
  }, [tenant, isDark]);

  return (
    <TenantCtx.Provider value={{ tenant, loading, switchTenant }}>
      {children}
    </TenantCtx.Provider>
  );
}

export const useTenant = () => useContext(TenantCtx);
