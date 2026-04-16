import "dotenv/config";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { checkBlockedTerms } from "./contentFilter.mjs";

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 3001);
const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5vl:7b";

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const roleMap = {
  STUDENT: "student",
  CLUB: "club",
  ADMIN: "admin",
};

const facultyMap = {
  ENGINEERING: "engineering",
  SCIENCE: "science",
  ARTS: "arts",
  BUSINESS: "business",
  MEDICINE: "medicine",
  LAW: "law",
};

const priorityMap = {
  NORMAL: "normal",
  HIGH: "high",
  EMERGENCY: "emergency",
};

const categoryMap = {
  EXAM: "exam",
  EVENT: "event",
  INTERNSHIP: "internship",
  ANNOUNCEMENT: "announcement",
  CLUB: "club",
  GENERAL: "general",
};

const notificationTypeMap = {
  COMMENT: "comment",
  LIKE: "like",
  ANNOUNCEMENT: "announcement",
  EVENT: "event",
  EXAM: "exam",
  SYSTEM: "system",
};

const reverseFacultyMap = Object.fromEntries(
  Object.entries(facultyMap).map(([key, value]) => [value, key]),
);

const reversePriorityMap = Object.fromEntries(
  Object.entries(priorityMap).map(([key, value]) => [value, key]),
);

const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryMap).map(([key, value]) => [value, key]),
);

function stripDataUrlPrefix(image) {
  if (typeof image !== "string") {
    return null;
  }

  const match = image.match(/^data:.+;base64,(.+)$/);
  return match ? match[1] : image;
}

function extractJsonObject(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Model returned an empty response");
  }

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model response did not contain valid JSON");
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

async function callOllama({ prompt, images = [] }) {
  let response;

  try {
    response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        images,
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
    });
  } catch (error) {
    throw new Error(
      "ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาเปิด Ollama และตรวจสอบว่าโหลดโมเดลไว้แล้ว",
    );
  }

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Ollama request failed: ${raw || response.status}`);
  }

  const payload = await response.json();
  return payload.response ?? "";
}

async function streamOllama({ prompt, images = [], onToken }) {
  let response;

  try {
    response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        images,
        stream: true,
        options: {
          temperature: 0.2,
        },
      }),
    });
  } catch {
    throw new Error(
      "ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาเปิด Ollama และตรวจสอบว่าโหลดโมเดลไว้แล้ว",
    );
  }

  if (!response.ok || !response.body) {
    const raw = await response.text();
    throw new Error(`Ollama request failed: ${raw || response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResponse = "";

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

      const part = JSON.parse(trimmed);
      const token = typeof part.response === "string" ? part.response : "";

      if (token) {
        finalResponse += token;
        onToken?.(token);
      }
    }
  }

  return finalResponse;
}

function writeStreamEvent(res, event) {
  res.write(`${JSON.stringify(event)}\n`);
}

function normalizeLanguage(language) {
  return language === "en" ? "en" : "th";
}

async function moderatePostContent(title, content) {
  const combinedText = `${title}\n${content}`;
  const blockedTerms = checkBlockedTerms(combinedText);

  if (blockedTerms.blocked) {
    const matchedPreview = blockedTerms.matches
      .slice(0, 5)
      .map((match) => match.term)
      .join(", ");

    return {
      allowed: false,
      containsProfanity: blockedTerms.containsProfanity,
      containsSpam: blockedTerms.containsSpam,
      reason: blockedTerms.containsSpam
        ? `พบคำที่เข้าข่ายสแปมหรือเนื้อหาไม่เหมาะสม เช่น ${matchedPreview}`
        : `พบคำหยาบหรือถ้อยคำไม่เหมาะสม เช่น ${matchedPreview}`,
      suggestedRewrite: "กรุณาปรับถ้อยคำให้สุภาพและเหมาะกับพื้นที่สาธารณะของมหาวิทยาลัย",
    };
  }

  const prompt = [
    "You are a campus community moderation assistant.",
    "Check whether the post below contains profanity, harassment, hate speech, explicit sexual content, or obvious spam.",
    "Return JSON only with this exact shape:",
    '{"allowed":true,"containsProfanity":false,"containsSpam":false,"reason":"short Thai explanation","suggestedRewrite":"clean rewrite or empty string"}',
    "Be strict about profanity and spam, but allow normal campus announcements.",
    "",
    `TITLE: ${title}`,
    `CONTENT: ${content}`,
  ].join("\n");

  const raw = await callOllama({ prompt });
  const result = extractJsonObject(raw);

  return {
    allowed: Boolean(result.allowed),
    containsProfanity: Boolean(result.containsProfanity),
    containsSpam: Boolean(result.containsSpam),
    reason:
      typeof result.reason === "string" && result.reason.trim()
        ? result.reason.trim()
        : "AI ไม่แนะนำให้เผยแพร่โพสต์นี้",
    suggestedRewrite:
      typeof result.suggestedRewrite === "string" && result.suggestedRewrite.trim()
        ? result.suggestedRewrite.trim()
        : undefined,
  };
}

async function generateDraftFromImage(image) {
  const encodedImage = stripDataUrlPrefix(image);
  if (!encodedImage) {
    throw new Error("รูปภาพไม่ถูกต้อง");
  }

  const prompt = [
    "You are helping a university user create a campus community post from an uploaded image.",
    "Look at the image and infer a likely campus-related post.",
    "Write the answer in Thai.",
    "Return JSON only with this exact shape:",
    '{"title":"...","content":"...","category":"general","priority":"normal","targetFaculties":[],"targetYears":[]}',
    "Allowed category values: exam, event, internship, announcement, club, general.",
    "Allowed priority values: normal, high, emergency.",
    "Allowed targetFaculties values: engineering, science, arts, business, medicine, law.",
    "Allowed targetYears values: 1, 2, 3, 4.",
    "Keep content concise and useful for a campus feed.",
  ].join("\n");

  const raw = await callOllama({
    prompt,
    images: [encodedImage],
  });
  const result = extractJsonObject(raw);

  const validCategories = new Set(Object.values(categoryMap));
  const validPriorities = new Set(Object.values(priorityMap));
  const validFaculties = new Set(Object.values(facultyMap));

  return {
    title: typeof result.title === "string" ? result.title.trim() : "",
    content: typeof result.content === "string" ? result.content.trim() : "",
    category: validCategories.has(result.category) ? result.category : "general",
    priority: validPriorities.has(result.priority) ? result.priority : "normal",
    targetFaculties: Array.isArray(result.targetFaculties)
      ? result.targetFaculties.filter((faculty) => validFaculties.has(faculty))
      : [],
    targetYears: Array.isArray(result.targetYears)
      ? result.targetYears.filter((year) => Number.isInteger(year) && year >= 1 && year <= 4)
      : [],
  };
}

async function streamDraftFromImage(image, onEvent) {
  const encodedImage = stripDataUrlPrefix(image);
  if (!encodedImage) {
    throw new Error("รูปภาพไม่ถูกต้อง");
  }

  onEvent?.({
    type: "status",
    phase: "prepare",
    message: "กำลังเตรียมรูปภาพสำหรับส่งเข้า AI",
    progress: 10,
  });

  const prompt = [
    "You are helping a university user create a campus community post from an uploaded image.",
    "Look at the image and infer a likely campus-related post.",
    "Write the answer in Thai.",
    "Before the final JSON, briefly explain what you detect from the image in Thai in 1-3 short sentences.",
    "Then return JSON only with this exact shape on the final line:",
    '{"title":"...","content":"...","category":"general","priority":"normal","targetFaculties":[],"targetYears":[]}',
    "Allowed category values: exam, event, internship, announcement, club, general.",
    "Allowed priority values: normal, high, emergency.",
    "Allowed targetFaculties values: engineering, science, arts, business, medicine, law.",
    "Allowed targetYears values: 1, 2, 3, 4.",
    "Keep content concise and useful for a campus feed.",
  ].join("\n");

  onEvent?.({
    type: "status",
    phase: "send",
    message: "กำลังส่งคำขอไปยัง Ollama",
    progress: 25,
  });

  let seenFirstToken = false;
  const raw = await streamOllama({
    prompt,
    images: [encodedImage],
    onToken(token) {
      if (!seenFirstToken) {
        seenFirstToken = true;
        onEvent?.({
          type: "status",
          phase: "analyze",
          message: "AI กำลังวิเคราะห์ภาพและร่างเนื้อหาโพสต์",
          progress: 60,
        });
      }

      onEvent?.({
        type: "token",
        token,
      });
    },
  });

  onEvent?.({
    type: "status",
    phase: "finalize",
    message: "กำลังจัดรูปแบบผลลัพธ์",
    progress: 90,
  });

  const draft = extractJsonObject(raw);
  const validCategories = new Set(Object.values(categoryMap));
  const validPriorities = new Set(Object.values(priorityMap));
  const validFaculties = new Set(Object.values(facultyMap));

  return {
    title: typeof draft.title === "string" ? draft.title.trim() : "",
    content: typeof draft.content === "string" ? draft.content.trim() : "",
    category: validCategories.has(draft.category) ? draft.category : "general",
    priority: validPriorities.has(draft.priority) ? draft.priority : "normal",
    targetFaculties: Array.isArray(draft.targetFaculties)
      ? draft.targetFaculties.filter((faculty) => validFaculties.has(faculty))
      : [],
    targetYears: Array.isArray(draft.targetYears)
      ? draft.targetYears.filter((year) => Number.isInteger(year) && year >= 1 && year <= 4)
      : [],
  };
}

async function translatePost(title, content, targetLanguage) {
  const languageName = normalizeLanguage(targetLanguage) === "en" ? "English" : "Thai";
  const prompt = [
    `Translate the following campus community post into ${languageName}.`,
    "Preserve meaning, dates, urgency, and names.",
    "Return JSON only with this exact shape:",
    `{"title":"translated title","content":"translated content","language":"${normalizeLanguage(targetLanguage)}"}`,
    "",
    `TITLE: ${title}`,
    `CONTENT: ${content}`,
  ].join("\n");

  const raw = await callOllama({ prompt });
  const result = extractJsonObject(raw);

  return {
    title: typeof result.title === "string" ? result.title.trim() : title,
    content: typeof result.content === "string" ? result.content.trim() : content,
    language: normalizeLanguage(result.language ?? targetLanguage),
  };
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleMap[user.role],
    faculty: user.faculty ? facultyMap[user.faculty] : undefined,
    year: user.year ?? undefined,
    interests: user.interests,
    avatar: user.avatarUrl ?? undefined,
  };
}

function mapComment(comment) {
  return {
    id: comment.id,
    author: mapUser(comment.author),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    likes: comment.likesCount,
  };
}

function mapPost(post) {
  return {
    id: post.id,
    author: mapUser(post.author),
    title: post.title,
    content: post.content,
    category: categoryMap[post.category],
    priority: priorityMap[post.priority],
    targetFaculties: post.targetFaculties.map((faculty) => facultyMap[faculty]),
    targetYears: post.targetYears,
    image: post.imageUrl ?? undefined,
    createdAt: post.createdAt.toISOString(),
    likes: post.likesCount,
    comments: post.comments.map(mapComment),
    saves: post.savesCount,
    reports: post.reportsCount,
    isPinned: post.isPinned,
    likedBy: post.likes.map((like) => like.userId),
    savedBy: post.saves.map((save) => save.userId),
  };
}

function mapNotification(notification) {
  return {
    id: notification.id,
    type: notificationTypeMap[notification.type],
    title: notification.title,
    message: notification.message,
    timestamp: notification.createdAt.toISOString(),
    isRead: notification.isRead,
    postId: notification.postId ?? undefined,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/bootstrap", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    const requestedCurrentUserId = typeof req.query.currentUserId === "string" ? req.query.currentUserId : null;
    const currentUserRecord =
      users.find((user) => user.id === requestedCurrentUserId) ??
      users.find((user) => user.email === "somchai.j@university.ac.th") ??
      users.find((user) => user.role === "STUDENT") ??
      users[0] ??
      null;

    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: true,
        saves: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const notifications = currentUserRecord
      ? await prisma.notification.findMany({
          where: {
            recipientId: currentUserRecord.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    res.json({
      currentUser: currentUserRecord ? mapUser(currentUserRecord) : null,
      users: users.map(mapUser),
      posts: posts.map(mapPost),
      notifications: notifications.map(mapNotification),
    });
  } catch (error) {
    console.error("Failed to load bootstrap data", error);
    res.status(500).json({
      message: "Failed to load bootstrap data",
    });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const {
      authorId,
      title,
      content,
      category,
      priority,
      targetFaculties,
      targetYears,
      image,
    } = req.body;

    if (!authorId || !title || !content || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const moderation = await moderatePostContent(title, content);
    if (!moderation.allowed) {
      return res.status(422).json({
        message: moderation.reason,
        moderation,
      });
    }

    const createdPost = await prisma.post.create({
      data: {
        authorId,
        title,
        content,
        category: reverseCategoryMap[category] ?? "GENERAL",
        priority: reversePriorityMap[priority] ?? "NORMAL",
        targetFaculties: Array.isArray(targetFaculties)
          ? targetFaculties.map((faculty) => reverseFacultyMap[faculty]).filter(Boolean)
          : [],
        targetYears: Array.isArray(targetYears) ? targetYears : [],
        imageUrl: image ?? null,
      },
    });

    res.status(201).json({ id: createdPost.id });
  } catch (error) {
    console.error("Failed to create post", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

app.delete("/api/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ลบโพสต์นี้" });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete post", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

app.post("/api/ai/generate-post-from-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "image is required" });
    }

    const draft = await generateDraftFromImage(image);

    if (!draft.title || !draft.content) {
      return res.status(502).json({
        message: "AI ไม่สามารถสร้างเนื้อหาจากรูปนี้ได้",
      });
    }

    res.json(draft);
  } catch (error) {
    console.error("Failed to generate post from image", error);
    res.status(503).json({
      message:
        error instanceof Error
          ? error.message
          : "ไม่สามารถสร้างเนื้อหาจากรูปได้",
    });
  }
});

app.post("/api/ai/generate-post-from-image/stream", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { image } = req.body;

    if (!image) {
      writeStreamEvent(res, {
        type: "error",
        message: "image is required",
      });
      return res.end();
    }

    const draft = await streamDraftFromImage(image, (event) => {
      writeStreamEvent(res, event);
    });

    writeStreamEvent(res, {
      type: "status",
      phase: "done",
      message: "สร้างร่างโพสต์เสร็จแล้ว",
      progress: 100,
    });
    writeStreamEvent(res, {
      type: "result",
      draft,
    });
    res.end();
  } catch (error) {
    console.error("Failed to stream generated post from image", error);
    writeStreamEvent(res, {
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "ไม่สามารถสร้างเนื้อหาจากภาพได้",
    });
    res.end();
  }
});

app.post("/api/ai/moderate-post", async (req, res) => {
  try {
    const { title = "", content = "" } = req.body;

    if (!title.trim() && !content.trim()) {
      return res.status(400).json({ message: "title or content is required" });
    }

    const moderation = await moderatePostContent(title, content);
    res.json(moderation);
  } catch (error) {
    console.error("Failed to moderate post", error);
    res.status(503).json({
      message:
        error instanceof Error
          ? error.message
          : "ไม่สามารถตรวจสอบเนื้อหาโพสต์ได้",
    });
  }
});

app.post("/api/ai/translate-post", async (req, res) => {
  try {
    const { title = "", content = "", targetLanguage = "th" } = req.body;

    if (!title.trim() && !content.trim()) {
      return res.status(400).json({ message: "title or content is required" });
    }

    const translated = await translatePost(title, content, targetLanguage);
    res.json(translated);
  } catch (error) {
    console.error("Failed to translate post", error);
    res.status(503).json({
      message:
        error instanceof Error
          ? error.message
          : "ไม่สามารถแปลโพสต์ได้",
    });
  }
});

app.post("/api/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.postLike.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            postId,
            userId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likesCount: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to toggle like", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

app.post("/api/posts/:postId/save", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const existingSave = await prisma.postSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingSave) {
      await prisma.$transaction([
        prisma.postSave.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            savesCount: {
              decrement: 1,
            },
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.postSave.create({
          data: {
            postId,
            userId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            savesCount: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to toggle save", error);
    res.status(500).json({ message: "Failed to toggle save" });
  }
});

app.post("/api/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content?.trim()) {
      return res.status(400).json({ message: "userId and content are required" });
    }

    await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          content: content.trim(),
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Failed to create comment", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

app.post("/api/comments/:commentId/like", async (req, res) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to like comment", error);
    res.status(500).json({ message: "Failed to like comment" });
  }
});

app.post("/api/posts/:postId/report", async (req, res) => {
  try {
    const { postId } = req.params;

    await prisma.post.update({
      where: { id: postId },
      data: {
        reportsCount: {
          increment: 1,
        },
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to report post", error);
    res.status(500).json({ message: "Failed to report post" });
  }
});

app.patch("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, faculty, year, interests } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(faculty !== undefined ? { faculty: faculty ? reverseFacultyMap[faculty] : null } : {}),
        ...(year !== undefined ? { year: year ?? null } : {}),
        ...(interests !== undefined ? { interests: Array.isArray(interests) ? interests : [] } : {}),
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to update user", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

app.patch("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark notification as read", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

app.patch("/api/notifications/read-all", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark all notifications as read", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
