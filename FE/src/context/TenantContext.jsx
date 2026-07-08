import { createContext, useContext, useEffect, useState } from "react";
import { restaurantInfoGet } from "../services/apiClient.js";

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
        if (res.ok) {
          const rawData = res.data;
          const rawName = rawData.name || rawData.TenantName || "";
          const isMatcha = rawName.toLowerCase().includes("yaki") || rawName.toLowerCase().includes("matcha");
          const isComTam = rawName.toLowerCase().includes("cơm tấm");
          const isSamHouse = rawName.toLowerCase().includes("sam house") || rawName.toLowerCase().includes("samhouse");
          
          localStorage.setItem("tenant_is_comtam", isComTam ? "true" : "false");
          localStorage.setItem("tenant_is_samhouse", isSamHouse ? "true" : "false");
          
          if (isComTam) {
            document.documentElement.setAttribute('data-tenant', 'comtam');
          } else if (isSamHouse) {
            document.documentElement.setAttribute('data-tenant', 'samhouse');
          } else {
            document.documentElement.setAttribute('data-tenant', 'matcha');
          }
          
          const normalizedData = { ...rawData };
          if (isMatcha) {
            normalizedData.name = "yakishime";
            normalizedData.address = "57 Nguyễn Cư Trinh, Cần Thơ";
          }
          
          setTenant(normalizedData);
          
          // Set dynamic title and favicon
          const name = isMatcha ? "Yakishime" : (normalizedData.name || "Yakishime");
          document.title = name;
          const logo = normalizedData.logo || (isComTam ? "/assets/comtamno/logo.jpg" : (isSamHouse ? "/assets/samhouse/decor/logo.png" : "/assets/images/logo.jpg"));
          normalizedData.logo = logo;
          const favicon = document.querySelector("link[rel*='icon']");
          if (favicon) {
            favicon.href = logo;
          }
 
          // Apply dynamic theme color if available (only for non-Matcha tenants to preserve original css tokens)
          const themeColor = normalizedData.themeColor || normalizedData.ThemeColor || (isComTam ? "#E07B39" : (isSamHouse ? "#8B4513" : null));
          if (themeColor && !isMatcha) {
            const root = document.documentElement;
            const hsl = hexToHsl(themeColor);
            if (hsl) {
              const [h, s, l] = hsl;
              root.style.setProperty('--matcha', `hsl(${h}, ${s}%, ${l}%)`);
              root.style.setProperty('--matcha-light', `hsl(${h}, ${s}%, ${Math.min(l + 10, 95)}%)`);
              root.style.setProperty('--matcha-dark', `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`);
              root.style.setProperty('--forest', `hsl(${h}, ${Math.max(s - 15, 10)}%, ${Math.max(l - 15, 10)}%)`);
              root.style.setProperty('--forest-dark', `hsl(${h}, ${Math.max(s - 20, 10)}%, ${Math.max(l - 25, 5)}%)`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load tenant info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, []);

  return (
    <TenantCtx.Provider value={{ tenant, loading }}>
      {children}
    </TenantCtx.Provider>
  );
}

export const useTenant = () => useContext(TenantCtx);
