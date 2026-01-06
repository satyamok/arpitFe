const API_BASE = "http://localhost:5454/api";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: "user" | "admin" | "master";
  createdAt: string;
  panCardCount: number;
}

export interface PanCard {
  _id: string;
  panCardName: string;
  panCardNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  documentName: string;
  panCard: {
    _id: string;
    panCardName: string;
    panCardNumber: string;
  };
  documentUrl: string;
  aboutDocument: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  user: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  panCards: PanCard[];
  documents: Document[];
}

export interface FetchUsersParams {
  cursor?: string | null;
  limit?: number;
  search?: string;
  role?: string;
  sort?: "newest" | "oldest";
}

export interface FetchUsersResponse {
  success: boolean;
  data: AdminUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<FetchUsersResponse> {
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.cursor) queryParams.set("cursor", params.cursor);
  if (params.search) queryParams.set("search", params.search);
  if (params.role) queryParams.set("role", params.role);
  if (params.sort) queryParams.set("sort", params.sort);

  const url = `${API_BASE}/auth/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function searchUsers(search: string): Promise<FetchUsersResponse> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/auth/search-user?search=${encodeURIComponent(search)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search users");
  }

  return response.json();
}

export async function fetchUserDetails(
  userId: string
): Promise<{ success: boolean; data: UserDetails }> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/auth/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  return response.json();
}

export async function addPanCardToUser(
  userId: string,
  panCardData: { panCardName: string; panCardNumber: string }
): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/auth/user/${userId}/pancard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(panCardData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to add PAN card");
  }

  return response.json();
}

export async function addDocumentToUser(
  userId: string,
  documentData: {
    documentName: string;
    panCard: string;
    documentUrl: string;
    aboutDocument?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/auth/user/${userId}/document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to add document");
  }

  return response.json();
}
