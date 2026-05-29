import { useMemo, useState } from "react";

import { MenuContext } from "./contextObjects.js";

export function MenuProvider({ children }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");

  const api = useMemo(
    () => ({ q, setQ, category, setCategory, tag, setTag }),
    [q, category, tag],
  );

  return <MenuContext.Provider value={api}>{children}</MenuContext.Provider>;
}
