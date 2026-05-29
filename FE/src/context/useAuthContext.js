import { useContext } from "react";

import { AuthContext } from "./contextObjects.js";

export function useAuth() {
  return useContext(AuthContext);
}
