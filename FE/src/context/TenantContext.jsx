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

  useEffect(() => {
    async function loadTenant() {
      try {
        const res = await restaurantInfoGet();
        if (!res.ok) {
          throw new Error("API failed");
        }
        const rawData = res.data;
          const rawName = rawData.name || rawData.TenantName || "";
          const isMatcha = rawName.toLowerCase().includes("yaki") || rawName.toLowerCase().includes("matcha");
          const isComTam = rawName.toLowerCase().includes("cơm tấm");
          const isSamHouse = rawName.toLowerCase().includes("sam house") || rawName.toLowerCase().includes("samhouse");
          const isMonQuanChat = rawName.toLowerCase().includes("quảng") || rawName.toLowerCase().includes("monquanchat");
          const isHoaTeaRoom = rawName.toLowerCase().includes("hoa") || rawName.toLowerCase().includes("hoà") || rawName.toLowerCase().includes("hòa");
          const isMonari = rawName.toLowerCase().includes("monari") || String(rawData.domain || "").toLowerCase().includes("monari");
          
          localStorage.setItem("tenant_is_comtam", isComTam ? "true" : "false");
          localStorage.setItem("tenant_is_samhouse", isSamHouse ? "true" : "false");
          localStorage.setItem("tenant_is_monquanchat", isMonQuanChat ? "true" : "false");
          localStorage.setItem("tenant_is_hoatearoom", isHoaTeaRoom ? "true" : "false");
          localStorage.setItem("tenant_is_monari", isMonari ? "true" : "false");
          
          if (isMonari) {
            document.documentElement.setAttribute('data-tenant', 'monari');
          } else if (isComTam) {
            document.documentElement.setAttribute('data-tenant', 'comtam');
          } else if (isSamHouse) {
            document.documentElement.setAttribute('data-tenant', 'samhouse');
          } else if (isMonQuanChat) {
            document.documentElement.setAttribute('data-tenant', 'monquanchat');
          } else if (isHoaTeaRoom) {
            document.documentElement.setAttribute('data-tenant', 'hoatearoom');
          } else {
            document.documentElement.setAttribute('data-tenant', 'matcha');
          }
          
          const normalizedData = { ...rawData };
          if (isMatcha) {
            normalizedData.name = "yakishime";
            normalizedData.address = "57 Nguyễn Cư Trinh, Cần Thơ";
          } else if (isMonari) {
            normalizedData.name = "MONARI";
            normalizedData.address = "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam";
          } else if (isMonQuanChat && !normalizedData.address) {
            normalizedData.address = "201 QL1K, Đông Hòa, Dĩ An, Bình Dương";
          } else if (isHoaTeaRoom && !normalizedData.address) {
            normalizedData.address = "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương";
          }
          
          setTenant(normalizedData);
          
          // Set dynamic title and favicon
          const name = isMatcha ? "Yakishime" : (normalizedData.name || "Yakishime");
          document.title = name;
          const logo = normalizedData.logo || (isMonari ? "/assets/monari/decor/logo.png" : (isComTam ? "/assets/comtamno/logo.jpg" : (isSamHouse ? "/assets/samhouse/decor/logo.png" : (isHoaTeaRoom ? "/assets/hoatearoom/decor/logo.png" : "/assets/images/logo.jpg"))));
          normalizedData.logo = logo;
          const favicon = document.querySelector("link[rel*='icon']");
          if (favicon) {
            favicon.href = logo;
          }

      } catch (err) {
        console.error("Failed to load tenant info, using offline fallback:", err);
        const urlParams = new URLSearchParams(window.location.search);
        const tenantQuery = urlParams.get("tenant") || "";
        const host = (tenantQuery + " " + window.location.hostname + " " + (import.meta.env.VITE_TENANT_DOMAIN || "")).toLowerCase();
        
        const isMonari = host.includes("monari");
        const isComTam = host.includes("comtam");
        const isSamHouse = host.includes("samhouse") || host.includes("sam house") || host.includes("sam");
        const isMonQuanChat = host.includes("quang") || host.includes("monquanchat");
        const isHoaTeaRoom = host.includes("hoa") || host.includes("hoà") || host.includes("hòa");
        
        const fallbackTenant = {
          id: isMonari ? "9523724e-1e6f-428f-a355-4394fcef1b9f" : (isComTam ? "0af4c82f-e6fb-4711-805f-9413e216536c" : (isSamHouse ? "a03d87a2-72d4-48c3-8fc4-a04f2234f0d8" : (isMonQuanChat ? "147f2752-1116-4a07-ae77-f17c283bcf53" : (isHoaTeaRoom ? "6f9c9e88-3482-45e0-b6a3-2f801bfb7f8c" : "11111111-0000-0000-0000-000000000001")))),
          name: isMonari ? "MONARI" : (isComTam ? "Cơm Tấm Ngọ" : (isSamHouse ? "Sam Houses" : (isMonQuanChat ? "Món Quảng Chất" : (isHoaTeaRoom ? "Hòa Tea Room" : "Yakishime")))),
          tenantName: isMonari ? "monari" : (isComTam ? "comtam" : (isSamHouse ? "samhouse" : (isMonQuanChat ? "monquanchat" : (isHoaTeaRoom ? "hoatearoom" : "matcha")))),
          logo: isMonari ? "/assets/monari/decor/logo.png" : (isComTam ? "/assets/comtamno/logo.jpg" : (isSamHouse ? "/assets/samhouse/decor/logo.png" : (isMonQuanChat ? "/assets/monquanchat/decor/logo.png" : (isHoaTeaRoom ? "/assets/hoatearoom/decor/logo.png" : "/assets/images/logo.jpg")))),
          address: isMonari ? "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam" : (isComTam ? "57 Nguyễn Cư Trinh, Cần Thơ" : (isSamHouse ? "Đường GS1, Đông Hòa, Dĩ An, Bình Dương" : (isMonQuanChat ? "201 QL1K, Đông Hòa, Dĩ An, Bình Dương" : (isHoaTeaRoom ? "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương" : "57 Nguyễn Cư Trinh, Cần Thơ")))),
          hotline: isMonari ? "0908 123 456" : (isComTam ? "0338353868" : (isSamHouse ? "0762 801 234" : (isMonQuanChat ? "0907 888 999" : (isHoaTeaRoom ? "0356 789 012" : "0945781173")))),
          email: isMonari ? "contact@monari.vn" : (isComTam ? "comtamno@gmail.com" : (isSamHouse ? "cafesamhouse@gmail.com" : (isMonQuanChat ? "monquanchat@gmail.com" : (isHoaTeaRoom ? "contact@hoatearoom.vn" : "hello@yakicafe.local")))),
          openHours: isMonari ? "07:30 – 22:30" : (isComTam ? "07:00 – 14:00" : (isSamHouse ? "07:30 – 22:00" : (isMonQuanChat ? "10:00 – 22:00" : (isHoaTeaRoom ? "08:30 – 22:00" : "08:00 - 22:00")))),
          themeColor: isMonari ? "#C86D51" : (isComTam ? "#E07B39" : (isSamHouse ? "#8B4513" : (isMonQuanChat ? "#8B1A1A" : (isHoaTeaRoom ? "#1E4620" : "#2D6A4F"))))
        };
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
    const rawName = tenant.name || tenant.TenantName || "";
    const isMonari = rawName.toLowerCase().includes("monari") || String(tenant.tenantName).toLowerCase().includes("monari");
    const isComTam = rawName.toLowerCase().includes("cơm tấm") || String(tenant.tenantName).toLowerCase().includes("comtam");
    const isSamHouse = rawName.toLowerCase().includes("sam house") || rawName.toLowerCase().includes("samhouse") || String(tenant.tenantName).toLowerCase().includes("samhouse");
    const isMonQuanChat = rawName.toLowerCase().includes("quảng") || rawName.toLowerCase().includes("monquanchat") || String(tenant.tenantName).toLowerCase().includes("monquanchat");
    const isHoaTeaRoom = rawName.toLowerCase().includes("hoa") || rawName.toLowerCase().includes("hoà") || rawName.toLowerCase().includes("hòa") || String(tenant.tenantName).toLowerCase().includes("hoatearoom");
    const isMatcha = rawName.toLowerCase().includes("yaki") || rawName.toLowerCase().includes("matcha") || String(tenant.tenantName).toLowerCase().includes("matcha");

    const themeColor = tenant.themeColor || tenant.ThemeColor || (isMonari ? "#C86D51" : (isComTam ? "#E07B39" : (isSamHouse ? "#8B4513" : (isHoaTeaRoom ? "#1E4620" : null))));
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
    <TenantCtx.Provider value={{ tenant, loading }}>
      {children}
    </TenantCtx.Provider>
  );
}

export const useTenant = () => useContext(TenantCtx);
