import { useContext } from "react";

import { BookingContext } from "./contextObjects.js";

export function useBookingContext() {
  return useContext(BookingContext);
}
