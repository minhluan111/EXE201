import { useMemo, useState } from "react";

import { ReviewContext } from "./contextObjects.js";

export function ReviewProvider({ children }) {
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const api = useMemo(
    () => ({ lastSubmitted, setLastSubmitted }),
    [lastSubmitted],
  );

  return (
    <ReviewContext.Provider value={api}>{children}</ReviewContext.Provider>
  );
}
