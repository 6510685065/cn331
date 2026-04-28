import { mockNotifications, mockPosts, mockUsers } from "../data/mockData";
import type { Notification } from "../components/NotificationPanel";
import type { Post, User } from "../types";
import { getAuthHeader } from "./auth";

interface BootstrapPayload {
  currentUser: User | null;
  users: User[];
  posts: Array<Omit<Post, "createdAt" | "comments"> & {
    createdAt: string;
    comments: Array<{
      id: string;
      author: User;
      content: string;
      createdAt: string;
      likes: number;
    }>;
  }>;
  notifications: Array<Omit<Notification, "timestamp"> & { timestamp: string }>;
}

export interface BootstrapData {
  currentUser: User;
  users: User[];
  posts: Post[];
  notifications: Notification[];
  source: "api" | "mock";
}

interface PostMutationInput {
  title: string;
  content: string;
  category: Post["category"];
  priority: Post["priority"];
  targetFaculties: Post["targetFaculties"];
  targetYears: number[];
  image?: string;
}

export interface PostModerationResult {
  allowed: boolean;
  containsProfanity: boolean;
  containsSpam: boolean;
  reason: string;
  suggestedRewrite?: string;
}

export interface GeneratedPostDraft {
  title: string;
  content: string;
  category: Post["category"];
  priority: Post["priority"];
  targetFaculties: Post["targetFaculties"];
  targetYears: number[];
}

export interface GenerationStreamEvent {
  type: "status" | "token" | "result" | "error";
  phase?: string;
  message?: string;
  progress?: number;
  token?: string;
  draft?: GeneratedPostDraft;
}

export interface TranslationResult {
  title: string;
  content: string;
  language: "th" | "en";
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function revivePost(post: BootstrapPayload["posts"][number]): Post {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    comments: post.comments.map((comment) => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
    })),
  };
}

function reviveNotification(notification: BootstrapPayload["notifications"][number]): Notification {
  return {
    ...notification,
    timestamp: new Date(notification.timestamp),
  };
}

export async function loadBootstrapData(): Promise<BootstrapData> {
  try {
    const response = await fetch("/api/bootstrap", {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error(`Bootstrap request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as BootstrapPayload;
    if (!payload.currentUser) {
      throw new Error("Bootstrap payload did not include a current user");
    }

    return {
      currentUser: payload.currentUser,
      users: payload.users,
      posts: payload.posts.map(revivePost),
      notifications: payload.notifications.map(reviveNotification),
      source: "api",
    };
  } catch (error) {
    console.warn("Falling back to mock data", error);
    return {
      currentUser: mockUsers[2],
      users: mockUsers,
      posts: mockPosts,
      notifications: mockNotifications,
      source: "mock",
    };
  }
}

export async function fetchBootstrapData(currentUserId?: string): Promise<BootstrapData> {
  const query = currentUserId ? `?currentUserId=${encodeURIComponent(currentUserId)}` : "";
  const response = await fetch(`/api/bootstrap${query}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!response.ok) {
    throw new Error(`Bootstrap request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as BootstrapPayload;
  if (!payload.currentUser) {
    throw new Error("Bootstrap payload did not include a current user");
  }

  return {
    currentUser: payload.currentUser,
    users: payload.users,
    posts: payload.posts.map(revivePost),
    notifications: payload.notifications.map(reviveNotification),
    source: "api",
  };
}

async function postJson(url: string, body?: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore non-JSON error payloads and use the default message.
    }

    throw new ApiError(message, response.status);
  }

  return response;
}

export async function createPost(userId: string, postData: PostMutationInput) {
  await postJson("/api/posts", {
    authorId: userId,
    ...postData,
  });
}

export async function deletePost(postId: string, userId: string) {
  await postJson(`/api/posts/${postId}`, { userId }, "DELETE");
}

export async function togglePostLike(postId: string, userId: string) {
  await postJson(`/api/posts/${postId}/like`, { userId });
}

export async function togglePostSave(postId: string, userId: string) {
  await postJson(`/api/posts/${postId}/save`, { userId });
}

export async function createComment(postId: string, userId: string, content: string) {
  await postJson(`/api/posts/${postId}/comments`, { userId, content });
}

export async function likeComment(commentId: string) {
  await postJson(`/api/comments/${commentId}/like`);
}

export async function reportPost(postId: string) {
  await postJson(`/api/posts/${postId}/report`);
}

export async function updateUserProfile(userId: string, updatedData: Partial<User>) {
  await postJson(`/api/users/${userId}`, updatedData, "PATCH");
}

export async function markNotificationAsRead(notificationId: string) {
  await postJson(`/api/notifications/${notificationId}/read`, undefined, "PATCH");
}

export async function markAllNotificationsAsRead(userId: string) {
  await postJson("/api/notifications/read-all", { userId }, "PATCH");
}

export async function generatePostFromImage(image: string) {
  const response = await postJson("/api/ai/generate-post-from-image", { image });
  return (await response.json()) as GeneratedPostDraft;
}

export async function streamGeneratePostFromImage(
  image: string,
  onEvent: (event: GenerationStreamEvent) => void,
) {
  const response = await fetch("/api/ai/generate-post-from-image/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok || !response.body) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore parsing failures.
    }

    throw new ApiError(message, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalDraft: GeneratedPostDraft | null = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const event = JSON.parse(trimmed) as GenerationStreamEvent;
      onEvent(event);

      if (event.type === "result" && event.draft) {
        finalDraft = event.draft;
      }

      if (event.type === "error") {
        throw new Error(event.message || "ไม่สามารถสร้างเนื้อหาจากภาพได้");
      }
    }
  }

  if (!finalDraft) {
    throw new Error("AI ไม่ส่งผลลัพธ์กลับมา");
  }

  return finalDraft;
}

export async function moderatePostDraft(title: string, content: string) {
  const response = await postJson("/api/ai/moderate-post", { title, content });
  return (await response.json()) as PostModerationResult;
}

export async function translatePostContent(
  title: string,
  content: string,
  targetLanguage: "th" | "en",
) {
  const response = await postJson("/api/ai/translate-post", {
    title,
    content,
    targetLanguage,
  });

  return (await response.json()) as TranslationResult;
}
