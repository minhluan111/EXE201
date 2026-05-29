import { useMemo, useState } from "react";

import { BookingContext } from "./contextObjects.js";

export function BookingProvider({ children }) {
  const [selected, setSelected] = useState(null);

  const api = useMemo(
    () => ({
      selected,
      setSelected,
      clear: () => setSelected(null),
    }),
    [selected],
  );

  return (
    <BookingContext.Provider value={api}>{children}</BookingContext.Provider>
  );
}
