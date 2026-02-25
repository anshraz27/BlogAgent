import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    const response = await apiClient.get("/api/blogs");
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

export const streamBlog = (topic, onData, onError) => {
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/stream?topic=${encodeURIComponent(topic)}`,
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (error) {
      console.error("Error parsing stream data:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("Stream error:", error);
    eventSource.close();
    onError(error);
  };

  return eventSource;
};
