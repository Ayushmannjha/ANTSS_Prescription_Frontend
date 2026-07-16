import { API_BASE_URL } from "./axios";

export interface ConsultationRequestEvent {
  type: "CONSULTATION_REQUEST_CREATED";
  consultationId: number;
  consultationNumber?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  registrationId: number;
  registrationNumber?: string | null;
  patientName: string;
  mobileNumber?: string | null;
  gender?: string | null;
  age?: number | null;
  priority?: "ROUTINE" | "URGENT" | "EMERGENCY" | null;
  status?: "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null;
  consultReason?: string | null;
  requestedAt?: string | null;
}

function getWebSocketUrl() {
  const url = new URL(API_BASE_URL, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/consultation-requests";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function subscribeToConsultationRequests(
  onConsultationRequest: (event: ConsultationRequestEvent) => void,
  onReconnect?: () => void,
) {
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let attempts = 0;
  let hasConnected = false;

  const connect = () => {
    socket = new WebSocket(getWebSocketUrl());

    socket.onopen = () => {
      attempts = 0;
      if (hasConnected) onReconnect?.();
      hasConnected = true;
    };

    socket.onmessage = (message) => {
      try {
        const event: unknown = JSON.parse(message.data);

        if (
          typeof event === "object" &&
          event !== null &&
          "type" in event &&
          event.type === "CONSULTATION_REQUEST_CREATED"
        ) {
          onConsultationRequest(event as ConsultationRequestEvent);
        }
      } catch (error) {
        console.error("Invalid consultation request WebSocket event", error);
      }
    };

    socket.onclose = () => {
      if (stopped) return;

      const delay = Math.min(1000 * 2 ** attempts++, 30_000);
      retryTimer = setTimeout(connect, delay);
    };

    socket.onerror = () => socket?.close();
  };

  connect();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
}
