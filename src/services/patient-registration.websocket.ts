import { API_BASE_URL } from "./axios";

export interface PatientRegistrationEvent {
  type: "PATIENT_REGISTRATION_CREATED";
  registrationId: number;
  registrationNumber: string;
  hospitalId: number | null;
  clinicId: number | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    patientId: number;
    patientName: string;
    mobileNumber?: string;
    gender: string;
    age: number;
    address?: string;
    state?: string;
    city?: string;
    pincode?: string;
    dateOfBirth?: string;
  };
}

function getWebSocketUrl() {
  const url = new URL(API_BASE_URL, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/patient-registrations";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function subscribeToPatientRegistrations(
  onRegistration: (event: PatientRegistrationEvent) => void,
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

      // Refetch after reconnect to recover events missed while offline.
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
          event.type === "PATIENT_REGISTRATION_CREATED"
        ) {
          onRegistration(event as PatientRegistrationEvent);
        }
      } catch (error) {
        console.error("Invalid patient WebSocket event", error);
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
