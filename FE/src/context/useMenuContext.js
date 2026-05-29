import { useContext } from "react";

import { MenuContext } from "./contextObjects.js";

export function useMenuContext() {
  return useContext(MenuContext);
}
