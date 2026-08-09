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

  const switchTenant = (shopKey) => {
    localStorage.setItem("dev_tenant_domain", shopKey);
    localStorage.removeItem("vizza.session");

    const url = new URL(window.location.href);
    url.searchParams.set("tenant", shopKey);

    // If accessing via *.localhost domain (e.g. monari.localhost or taotaocafe.localhost)
    if (window.location.hostname.includes(".localhost")) {
      const port = window.location.port ? `:${window.location.port}` : "";
      const targetSubdomain = shopKey === "taotao" ? "taotaocafe" : shopKey;
      window.location.href = `${window.location.protocol}//${targetSubdomain}.localhost${port}${window.location.pathname}?tenant=${shopKey}`;
    } else {
      window.location.href = url.toString();
    }
  };

  useEffect(() => {
    async function loadTenant() {
      try {
        const res = await restaurantInfoGet();
        if (!res.ok) {
          throw new Error("API failed: " + (res.message || "Unknown error"));
        }
        const rawData = res.data;
        const rawName = String(rawData.name || rawData.TenantName || "").toLowerCase();
        const rawDomain = String(rawData.domain || "").toLowerCase();

        const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || rawName.includes("tao tao") || rawDomain.includes("taotao");
        const isMonari = rawName.includes("monari") || rawDomain.includes("monari");
        const isComGa = rawName.includes("cơm gà") || rawName.includes("comga") || rawName.includes("ông bách") || rawName.includes("ong bach") || rawDomain.includes("comga");
        const isEmCoffee = rawName.includes("em coffee") || rawName.includes("em") || rawDomain.includes("em");
        const isComTam = rawName.includes("cơm tấm") || rawDomain.includes("comtam");
        const isSamHouse = rawName.includes("sam house") || rawName.includes("samhouse") || rawDomain.includes("samhouse");
        const isMonQuanChat = rawName.includes("quảng") || rawName.includes("monquanchat") || rawDomain.includes("monquan");
        const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || rawDomain.includes("hoa");
        const isHanHuyen = rawName.includes("hàn huyên") || rawName.includes("hanhuyen") || rawDomain.includes("hanhuyen");
        const isCochin = rawName.includes("cochin") || rawDomain.includes("cochin");
        const isMatcha = rawName.includes("yaki") || rawName.includes("matcha") || rawDomain.includes("matcha");

        localStorage.setItem("tenant_is_taotao", isTaoTao ? "true" : "false");
        localStorage.setItem("tenant_is_monari", isMonari ? "true" : "false");
        localStorage.setItem("tenant_is_comga", isComGa ? "true" : "false");
        localStorage.setItem("tenant_is_emcoffee", isEmCoffee ? "true" : "false");
        localStorage.setItem("tenant_is_comtam", isComTam ? "true" : "false");
        localStorage.setItem("tenant_is_samhouse", isSamHouse ? "true" : "false");
        localStorage.setItem("tenant_is_monquanchat", isMonQuanChat ? "true" : "false");
        localStorage.setItem("tenant_is_hoatearoom", isHoaTeaRoom ? "true" : "false");
        localStorage.setItem("tenant_is_hanhuyen", isHanHuyen ? "true" : "false");
        localStorage.setItem("tenant_is_cochin", isCochin ? "true" : "false");

        let activeKey = "matcha";
        if (isTaoTao) activeKey = "taotao";
        else if (isMonari) activeKey = "monari";
        else if (isComGa) activeKey = "comga";
        else if (isEmCoffee) activeKey = "emcoffee";
        else if (isComTam) activeKey = "comtam";
        else if (isSamHouse) activeKey = "samhouse";
        else if (isMonQuanChat) activeKey = "monquanchat";
        else if (isHoaTeaRoom) activeKey = "hoatearoom";
        else if (isHanHuyen) activeKey = "hanhuyen";
        else if (isCochin) activeKey = "cochin";

        document.documentElement.setAttribute('data-tenant', activeKey);

        const normalizedData = { ...rawData, tenantName: activeKey };
        if (isTaoTao) {
          normalizedData.name = "Táo Tào cà phê";
          normalizedData.logo = "/assets/taotao/logo.jpg";
          if (!normalizedData.address) normalizedData.address = "32A Thống Nhất, P. 10, Gò Vấp, TP.HCM";
        } else if (isMonari) {
          normalizedData.name = "MONARI";
          normalizedData.logo = "/assets/monari/decor/logo.png";
          if (!normalizedData.address) normalizedData.address = "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam";
        } else if (isComGa) {
          normalizedData.name = "Cơm Gà Ông Bách";
          normalizedData.logo = "/assets/comgaongbach/decor/logo.png";
          if (!normalizedData.address) normalizedData.address = "146 Đường GS1, Đông Hòa, Hồ Chí Minh, Vietnam";
        } else if (isEmCoffee) {
          normalizedData.name = "Em Coffee";
          normalizedData.logo = "/assets/emcoffee/logo.jpg";
          if (!normalizedData.address) normalizedData.address = "27 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM";
        } else if (isComTam) {
          normalizedData.name = "Cơm Tấm Ngọ";
          normalizedData.logo = "/assets/comtamno/logo.jpg";
          if (!normalizedData.address) normalizedData.address = "57 Nguyễn Cư Trinh, Cần Thơ";
        } else if (isSamHouse) {
          normalizedData.name = "Cafe Sam Houses";
          normalizedData.logo = "/assets/samhouse/decor/logo.png";
          if (!normalizedData.address) normalizedData.address = "Đường GS1, Đông Hòa, Dĩ An, Bình Dương";
        } else if (isMonQuanChat) {
          normalizedData.name = "Món Quảng Chất";
          normalizedData.logo = "/assets/monquanchat/decor/logo.png";
          if (!normalizedData.address) normalizedData.address = "201 QL1K, Đông Hòa, Dĩ An, Bình Dương";
        } else if (isHanHuyen) {
          normalizedData.name = "Quán Nước Hàn Huyên";
          normalizedData.logo = "/assets/hanhuyen/Logo.jpg";
          if (!normalizedData.address) normalizedData.address = "45/3 Hàn Huyên, Bến Nghé, Quận 1, TP.HCM";
        } else if (isCochin) {
          normalizedData.name = "Cochin Café";
          normalizedData.logo = "/assets/cochin/logo.jpg";
          if (!normalizedData.address) normalizedData.address = "12 Đặng Dung, Tân Định, Quận 1, TP.HCM";
        } else if (isHoaTeaRoom) {
          normalizedData.name = "Hòa Tea Room";
          normalizedData.logo = "/assets/hoatearoom/decor/logo.png";
          if (!normalizedData.address) normalizedData.address = "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương";
        } else if (isMatcha) {
          normalizedData.name = "Yakishime";
          normalizedData.logo = "/assets/images/logo.jpg";
          normalizedData.address = "57 Nguyễn Cư Trinh, Cần Thơ";
        }

        setTenant(normalizedData);
        document.title = normalizedData.name;

        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon && normalizedData.logo) {
          favicon.href = normalizedData.logo;
          if (isMonari) favicon.type = "image/png";
        }

      } catch (err) {
        console.error("Failed to load tenant info, using offline fallback:", err);
        const urlParams = new URLSearchParams(window.location.search);
        const tenantQuery = urlParams.get("tenant") || localStorage.getItem("dev_tenant_domain") || "";
        const host = (tenantQuery + " " + window.location.hostname + " " + (import.meta.env.VITE_TENANT_DOMAIN || "")).toLowerCase();

        const isTaoTao = host.includes("taotao") || host.includes("táo tào") || host.includes("tao");
        const isMonari = host.includes("monari");
        const isComGa = host.includes("comga") || host.includes("cơm gà") || host.includes("ông bách") || host.includes("ong bach");
        const isEmCoffee = host.includes("emcoffee") || host.includes("em");
        const isComTam = host.includes("comtam");
        const isSamHouse = host.includes("samhouse") || host.includes("sam house") || host.includes("sam");
        const isMonQuanChat = host.includes("quang") || host.includes("monquanchat");
        const isHoaTeaRoom = host.includes("hoa") || host.includes("hoà") || host.includes("hòa");
        const isHanHuyen = host.includes("hanhuyen") || host.includes("hàn huyên");
        const isCochin = host.includes("cochin");

        let fallbackTenant;
        if (isTaoTao) {
          fallbackTenant = {
            id: "55555555-5555-5555-5555-555555555555",
            name: "Táo Tào cà phê",
            tenantName: "taotao",
            logo: "/assets/taotao/logo.jpg",
            address: "32A Thống Nhất, P. 10, Gò Vấp, TP.HCM",
            hotline: "0901 234 567",
            email: "contact@taotaocafe.vn",
            openHours: "07:00 – 22:30",
            themeColor: "#C86828"
          };
        } else if (isMonari) {
          fallbackTenant = {
            id: "9523724e-1e6f-428f-a355-4394fcef1b9f",
            name: "MONARI",
            tenantName: "monari",
            logo: "/assets/monari/decor/logo.png",
            address: "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam",
            hotline: "0908 123 456",
            email: "contact@monari.vn",
            openHours: "07:30 – 22:30",
            themeColor: "#C86D51"
          };
        } else if (isComGa) {
          fallbackTenant = {
            id: "ea2982a7-d7e1-4e05-874a-66d8f53b3408",
            name: "Cơm Gà Ông Bách",
            tenantName: "comga",
            logo: "/assets/comgaongbach/decor/logo.png",
            address: "146 Đường GS1, Đông Hòa, Hồ Chí Minh, Vietnam",
            hotline: "0938 123 789",
            email: "contact@comgaongbach.com",
            openHours: "09:30 – 21:30",
            themeColor: "#D97706"
          };
        } else if (isEmCoffee) {
          fallbackTenant = {
            id: "44444444-4444-4444-4444-444444444444",
            name: "Em Coffee",
            tenantName: "emcoffee",
            logo: "/assets/emcoffee/logo.jpg",
            address: "27 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
            hotline: "0909 333 444",
            email: "contact@emcoffee.vn",
            openHours: "07:00 – 22:00",
            themeColor: "#8B5A2B"
          };
        } else if (isComTam) {
          fallbackTenant = {
            id: "0af4c82f-e6fb-4711-805f-9413e216536c",
            name: "Cơm Tấm Ngọ",
            tenantName: "comtam",
            logo: "/assets/comtamno/logo.jpg",
            address: "57 Nguyễn Cư Trinh, Cần Thơ",
            hotline: "0338353868",
            email: "comtamno@gmail.com",
            openHours: "07:00 – 14:00",
            themeColor: "#E07B39"
          };
        } else if (isSamHouse) {
          fallbackTenant = {
            id: "a03d87a2-72d4-48c3-8fc4-a04f2234f0d8",
            name: "Sam Houses",
            tenantName: "samhouse",
            logo: "/assets/samhouse/decor/logo.png",
            address: "Đường GS1, Đông Hòa, Dĩ An, Bình Dương",
            hotline: "0762 801 234",
            email: "cafesamhouse@gmail.com",
            openHours: "07:30 – 22:00",
            themeColor: "#8B4513"
          };
        } else if (isMonQuanChat) {
          fallbackTenant = {
            id: "147f2752-1116-4a07-ae77-f17c283bcf53",
            name: "Món Quảng Chất",
            tenantName: "monquanchat",
            logo: "/assets/monquanchat/decor/logo.png",
            address: "201 QL1K, Đông Hòa, Dĩ An, Bình Dương",
            hotline: "0907 888 999",
            email: "monquanchat@gmail.com",
            openHours: "10:00 – 22:00",
            themeColor: "#8B1A1A"
          };
        } else if (isHoaTeaRoom) {
          fallbackTenant = {
            id: "6f9c9e88-3482-45e0-b6a3-2f801bfb7f8c",
            name: "Hòa Tea Room",
            tenantName: "hoatearoom",
            logo: "/assets/hoatearoom/decor/logo.png",
            address: "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương",
            hotline: "0356 789 012",
            email: "contact@hoatearoom.vn",
            openHours: "08:30 – 22:00",
            themeColor: "#1E4620"
          };
        } else if (isHanHuyen) {
          fallbackTenant = {
            id: "77777777-7777-7777-7777-777777777777",
            name: "Quán Nước Hàn Huyên",
            tenantName: "hanhuyen",
            logo: "/assets/hanhuyen/Logo.jpg",
            address: "45/3 Hàn Huyên, Bến Nghé, Quận 1, TP.HCM",
            hotline: "0903 888 777",
            email: "contact@hanhuyen.vn",
            openHours: "07:00 – 22:00",
            themeColor: "#618269"
          };
        } else if (isCochin) {
          fallbackTenant = {
            id: "88888888-8888-8888-8888-888888888888",
            name: "Cochin Café",
            tenantName: "cochin",
            logo: "/assets/cochin/logo.jpg",
            address: "12 Đặng Dung, Tân Định, Quận 1, TP.HCM",
            hotline: "0902 444 888",
            email: "contact@cochin.vn",
            openHours: "07:30 – 22:30",
            themeColor: "#2A5944"
          };
        } else {
          fallbackTenant = {
            id: "11111111-0000-0000-0000-000000000001",
            name: "Yakishime",
            tenantName: "matcha",
            logo: "/assets/images/logo.jpg",
            address: "57 Nguyễn Cư Trinh, Cần Thơ",
            hotline: "0945781173",
            email: "hello@yakicafe.local",
            openHours: "08:00 - 22:00",
            themeColor: "#2D6A4F"
          };
        }

        const activeKey = fallbackTenant.tenantName;
        document.documentElement.setAttribute('data-tenant', activeKey);
        document.title = fallbackTenant.name;
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon && fallbackTenant.logo) {
          favicon.href = fallbackTenant.logo;
        }

        setTenant(fallbackTenant);
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
    const rawName = String(tenant.name || tenant.TenantName || "").toLowerCase();
    const tName = String(tenant.tenantName || "").toLowerCase();

    const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || tName.includes("taotao");
    const isMonari = rawName.includes("monari") || tName.includes("monari");
    const isEmCoffee = rawName.includes("em coffee") || rawName.includes("em") || tName.includes("em");
    const isComTam = rawName.includes("cơm tấm") || tName.includes("comtam");
    const isSamHouse = rawName.includes("sam house") || rawName.includes("samhouse") || tName.includes("samhouse");
    const isMonQuanChat = rawName.includes("quảng") || rawName.includes("monquanchat") || tName.includes("monquanchat");
    const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || tName.includes("hoatearoom");
    const isHanHuyen = rawName.includes("hàn huyên") || tName.includes("hanhuyen");
    const isCochin = rawName.includes("cochin") || tName.includes("cochin");
    const isMatcha = rawName.includes("yaki") || rawName.includes("matcha") || tName.includes("matcha");

    const themeColor = tenant.themeColor || tenant.ThemeColor || (
      isTaoTao ? "#C86828" :
      isMonari ? "#C86D51" :
      isEmCoffee ? "#8B5A2B" :
      isComTam ? "#E07B39" :
      isSamHouse ? "#8B4513" :
      isMonQuanChat ? "#8B1A1A" :
      isHoaTeaRoom ? "#1E4620" :
      isHanHuyen ? "#618269" :
      isCochin ? "#2A5944" : null
    );

    if (themeColor && !isMatcha) {
      const root = document.documentElement;
      const hsl = hexToHsl(themeColor);
      if (hsl) {
        let [h, s, l] = hsl;
        if (isDark) {
          l = 52;
          s = 38;
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
