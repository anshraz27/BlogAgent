import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "blog_agent_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const registerUser = async ({ email, password }) => {
  const response = await apiClient.post("/api/auth/register", { email, password });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await apiClient.post("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  setStoredToken(response.data.access_token);
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
};

export const generateBlog = async (topic) => {
  try {
    const response = await apiClient.post("/api/generate", { topic });
    return response.data;
  } catch (error) {
    console.error("Error generating blog:", error);
    throw error;
  }
};

export const fetchAllBlogs = async () => {
  try {
    const response = await apiClient.get("/api/blogs/");
    return response.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

export const fetchBlogById = async (blogId) => {
  try {
    const response = await apiClient.get(`/api/blogs/${blogId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    throw error;
  }
};

export const deleteBlog = async (blogId) => {
  try {
    const response = await apiClient.delete(`/api/blogs/${blogId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

export const updateBlog = async (blogId, payload) => {
  try {
    const response = await apiClient.patch(`/api/blogs/${blogId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const streamBlog = async (topic, threadId, onData) => {
  const response = await fetch(`${API_BASE_URL}/api/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getStoredToken()}`,
    },
    body: JSON.stringify({ topic, thread_id: threadId }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Unable to open generation stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    decoder
      .decode(value)
      .split("\n\n")
      .filter((line) => line.startsWith("data: "))
      .forEach((line) => onData(JSON.parse(line.replace("data: ", ""))));
  }
};
