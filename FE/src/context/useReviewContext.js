import { useContext } from "react";

import { ReviewContext } from "./contextObjects.js";

export function useReviewContext() {
  return useContext(ReviewContext);
}
