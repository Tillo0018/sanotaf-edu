export const API_URL = "https://sanotaf-edu.up.railway.app/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("sanotaf_token") || "";
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || "Xatolik yuz berdi",
      errors: data?.errors || {},
    };
  }

  return data;
}

// Upload file (multipart/form-data) — do NOT set Content-Type manually
export async function uploadFile(endpoint: string, formData: FormData) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("sanotaf_token") || "";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || "Fayl yuklashda xatolik",
      errors: data?.errors || {},
    };
  }

  return data;
}
