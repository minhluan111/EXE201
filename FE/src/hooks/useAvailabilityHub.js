import { useEffect, useRef, useCallback } from "react";
import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:52818"
).replace(/\/$/, "");

/**
 * Hook to subscribe to the AvailabilityHub on the backend.
 * Calls `onChanged` whenever the server emits "AvailabilityChanged".
 *
 * @param {() => void} onChanged - callback to run when the event fires
 * @param {boolean} enabled - set to false to disable the connection
 */
export function useAvailabilityHub(onChanged, enabled = true) {
  const connectionRef = useRef(null);
  const onChangedRef = useRef(onChanged);

  // Keep callback ref up-to-date so we don't need to restart the connection
  useEffect(() => {
    onChangedRef.current = onChanged;
  });

  useEffect(() => {
    if (!enabled) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hub/availability`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("AvailabilityChanged", () => {
      onChangedRef.current?.();
    });

    const startConnection = async () => {
      try {
        await connection.start();
      } catch (err) {
        console.warn("[SignalR] Could not connect to AvailabilityHub:", err);
      }
    };

    startConnection();
    connectionRef.current = connection;

    return () => {
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Connecting
      ) {
        connection.stop();
      }
    };
  }, [enabled]);
}
