import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smart-campus-jwt-secret-dev-only";
const TU_API_KEY = process.env.TU_API_KEY || "";
const TU_API_URL = "https://restapi.tu.ac.th/api/v1/auth/Ad/verify2";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Determine the role for a TU-authenticated user.
 * 1. If the email is in ADMIN_EMAILS → ADMIN
 * 2. If TU API type is "student" → STUDENT
 * 3. If TU API type is "employee" → PROFESSOR
 * 4. Fallback → STUDENT
 */
function determineRole(email, tuType) {
  const normalizedEmail = email.toLowerCase();

  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    return "ADMIN";
  }

  if (tuType === "student") {
    return "STUDENT";
  }

  if (tuType === "employee") {
    return "PROFESSOR";
  }

  return "STUDENT";
}

/**
 * Call TU API to verify credentials.
 * Returns the TU API response or throws on failure.
 */
async function verifyWithTuApi(username, password) {
  if (!TU_API_KEY) {
    throw new Error("TU_API_KEY is not configured on the server");
  }

  const response = await fetch(TU_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Application-Key": TU_API_KEY,
    },
    body: JSON.stringify({
      UserName: username,
      PassWord: password,
    }),
  });

  // Parse the response body regardless of status code
  // TU API may return 200 with status:false for invalid credentials
  // or 403 with an error message for invalid Application-Key
  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`TU API returned unparseable response (HTTP ${response.status}): ${text.slice(0, 200)}`);
  }

  // If we got a 403 with "invalid token", it means the Application-Key is wrong
  if (response.status === 403) {
    const errorMsg = data.error || data.message || "Application-Key ไม่ถูกต้อง";
    throw new Error(`TU API rejected the Application-Key: ${errorMsg}`);
  }

  // For other non-OK statuses, throw with details
  if (!response.ok && response.status !== 200) {
    throw new Error(`TU API returned status ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Sign a JWT for the given user ID.
 */
function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify a JWT and return the payload (or null if invalid).
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware to extract the current user from the Authorization header.
 * Sets req.userId if a valid token is found.
 */
function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (payload && payload.userId) {
      req.userId = payload.userId;
    }
  }

  next();
}

/**
 * Mount auth routes on the given Express app.
 */
export function mountAuthRoutes(app, prisma) {
  /**
   * POST /api/auth/login
   * Body: { username: string, password: string }
   *
   * Authenticates via TU API, creates/updates the user in the database,
   * and returns a JWT along with the user info.
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
      }

      // --- TEST ACCOUNT BACKDOOR ---
      const isMockLogin = username.startsWith("mock_");
      
      let tuData;
      if (isMockLogin) {
        // Bypass TU API and create dummy data for testing
        const roleStr = username.replace("mock_", "").toUpperCase(); // e.g. "STUDENT", "ADMIN"
        tuData = {
          status: true,
          email: `${username}@test.com`,
          displayname_th: `บัญชีทดสอบ (${roleStr})`,
          type: roleStr === "PROFESSOR" ? "employee" : "student",
          department: "คณะจำลองสำหรับการทดสอบ"
        };
        // For mock admin to work with determineRole, we'll temporarily append it to ADMIN_EMAILS
        if (roleStr === "ADMIN" && !ADMIN_EMAILS.includes(`${username}@test.com`)) {
          ADMIN_EMAILS.push(`${username}@test.com`);
        }
      } else {
        // Normal flow: Call real TU API
        try {
          tuData = await verifyWithTuApi(username, password);
        } catch (error) {
          console.error("TU API call failed:", error);
          return res.status(503).json({
            message: error instanceof Error
              ? error.message
              : "ไม่สามารถเชื่อมต่อกับ TU API ได้ กรุณาลองใหม่อีกครั้ง",
          });
        }

        // Check if authentication succeeded
        if (!tuData.status) {
          return res.status(401).json({
            message: tuData.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          });
        }
      }
      // ----------------------------

      // Extract user info from TU API response
      const email = (tuData.email || `${username}@dome.tu.ac.th`).toLowerCase();
      const displayNameTh = tuData.displayname_th || username;
      const displayNameEn = tuData.displayname_en || username;
      const tuType = tuData.type || "student";
      const department = tuData.department || "";
      const organization = tuData.organization || "";

      // Helper to map TU department string to our Faculty enum
      const mapTuDepartmentToFaculty = (dept) => {
        if (!dept) return null;
        const d = dept.toLowerCase();
        if (d.includes("วิศวกรรม") || d.includes("engineering")) return "ENGINEERING";
        if (d.includes("วิทย") || d.includes("science")) return "SCIENCE";
        if (d.includes("ศิลป") || d.includes("arts")) return "ARTS";
        if (d.includes("พาณิชย") || d.includes("business") || d.includes("บริหาร")) return "BUSINESS";
        if (d.includes("แพทย") || d.includes("medicine")) return "MEDICINE";
        if (d.includes("นิติ") || d.includes("law")) return "LAW";
        return null;
      };

      const mappedFaculty = mapTuDepartmentToFaculty(department);

      // Determine role
      const role = determineRole(email, tuType);

      // Create or update user in the database
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { email },
          data: {
            name: displayNameTh,
            role,
            faculty: mappedFaculty,
            authProvider: "tu-api",
            tuType,
            isActive: true,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: displayNameTh,
            role,
            faculty: mappedFaculty,
            authProvider: "tu-api",
            tuType,
            interests: [],
          },
        });
      }

      // Sign JWT
      const token = signToken(user.id);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role.toLowerCase(),
          faculty: user.faculty || undefined,
          year: user.year || undefined,
          interests: user.interests,
          avatar: user.avatarUrl || undefined,
        },
        tuProfile: {
          displayNameTh,
          displayNameEn,
          type: tuType,
          department,
          organization,
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
  });

  /**
   * GET /api/auth/me
   * Header: Authorization: Bearer <token>
   *
   * Returns the current user from the JWT token.
   */
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
      }

      const token = authHeader.slice(7);
      const payload = verifyToken(token);

      if (!payload || !payload.userId) {
        return res.status(401).json({ message: "โทเค็นหมดอายุหรือไม่ถูกต้อง" });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "ไม่พบบัญชีผู้ใช้" });
      }

      const roleMap = {
        STUDENT: "student",
        CLUB: "club",
        PROFESSOR: "professor",
        ADMIN: "admin",
      };

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleMap[user.role] || "student",
          faculty: user.faculty || undefined,
          year: user.year || undefined,
          interests: user.interests,
          avatar: user.avatarUrl || undefined,
        },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  });

  /**
   * POST /api/auth/logout
   * Just a placeholder — actual logout is handled client-side by clearing the token.
   */
  app.post("/api/auth/logout", (_req, res) => {
    res.json({ ok: true });
  });
}

export { authMiddleware, verifyToken, signToken };
