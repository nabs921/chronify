import type {
  EventResponse,
  LoginPayload,
  RegisterPayload,
  Timeline,
} from "../types/types";

const API_BASE_URL = "http://localhost:8080";

/* ---------------- Auth ---------------- */

export const login = async (data: LoginPayload): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
};

export const register = async (data: RegisterPayload): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
};

/* ---------------- Timelines ---------------- */

export const getTimelines = async (token: string): Promise<Timeline[]> => {
  const res = await fetch(`${API_BASE_URL}/timelines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch timelines");
  const data = await res.json();
  return data.data;
};

export const getTimelineById = async (
  token: string,
  id: string,
): Promise<Timeline> => {
  const res = await fetch(`${API_BASE_URL}/timelines/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch timeline");
  const data = await res.json();
  return data.data;
};

export const createTimeline = async (
  token: string,
  payload: any,
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/timelines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create timeline");
  }

  return data;
};

export const updateTimeline = async (
  token: string,
  id: string,
  payload: any,
) => {
  const res = await fetch(`${API_BASE_URL}/timelines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update timeline");
  }

  return data;
};

export const deleteTimeline = async (token: string, id: string) => {
  const res = await fetch(`${API_BASE_URL}/timelines/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
};

export const searchTimelines = async (
  token: string,
  query: string,
): Promise<Timeline[]> => {
  const res = await fetch(
    `${API_BASE_URL}/timelines/search?title=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to search timelines");
  return data.data;
};

export const searchPublicTimelines = async (
  token: string,
  query: string,
): Promise<Timeline[]> => {
  const res = await fetch(
    `${API_BASE_URL}/timelines/public/search?title=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to search public timelines");
  return data.data || [];
};

export const getPublicTimelines = async (
  token: string,
): Promise<Timeline[]> => {
  const res = await fetch(`${API_BASE_URL}/timelines/public`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to fetch public timelines");
  return data.data || [];
};

/* ---------------- Events ---------------- */

export const getEventsByTimelineId = async (
  token: string,
  timelineId: string,
): Promise<{ events: EventResponse[] }> => {
  const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch events");
  }

  return data;
};

export const upsertEvents = async (
  token: string,
  timelineId: string,
  events: any[],
): Promise<{ events: EventResponse[] }> => {
  const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(events),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to save events");
  }
  return data;
};

export const deleteEvent = async (
  token: string,
  timelineId: string,
  eventId: string,
): Promise<any> => {
  const res = await fetch(
    `${API_BASE_URL}/timelines/${timelineId}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete event");
  }

  return res.json();
};
export const generateAIEvents = async (
  token: string,
  timelineId: string,
  prompt: string,
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/aievents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to generate AI events");
  }

  return res.json();
};

export const updateAIEvents = async (
  token: string,
  timelineId: string,
  prompt: string,
): Promise<{ events: EventResponse[] }> => {
  const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/aievents`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update AI events");
  }
  return data;
};

/* ---------------- Bookmarks ---------------- */

export const getBookmarks = async (token: string): Promise<Timeline[]> => {
  const res = await fetch(`${API_BASE_URL}/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  const data = await res.json();
  return data.data || [];
};

export const addBookmark = async (
  token: string,
  timelineId: string,
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/bookmarks/${timelineId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to add bookmark");
  }
};

export const removeBookmark = async (
  token: string,
  timelineId: string,
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/bookmarks/${timelineId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to remove bookmark");
  }
};
