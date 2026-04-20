import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { ApiResponse } from "../types/index";
import { AppError } from "../middleware/errorHandler";

const JWT_SECRET = process.env.JWT_SECRET || "dummy-secret-for-now";
const DUMMY_ORG_ID = process.env.DUMMY_ORG_ID || "00000000-0000-0000-0000-000000000001";

interface LoginRequest {
  email: string;
  password?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    org_id: string;
  };
}

interface RefreshResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
  tenant_id: string;
  permissions: string[];
}

/**
 * @POST /api/tenant-login
 * Handle login (dummy implementation)
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as LoginRequest;

    if (!email) {
      throw new AppError(400, "Email is required");
    }

    console.log(`[AUTH] Dummy login attempt for: ${email}`);

    const token = jwt.sign(
      {
        id: "user-123",
        email,
        role: "admin",
        org_id: DUMMY_ORG_ID,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: "user-123",
          name: "Administrator",
          email,
          role: "admin",
          org_id: DUMMY_ORG_ID,
        },
      },
    } as ApiResponse<LoginResponse>);
  } catch (error) {
    next(error);
  }
}

/**
 * @GET /api/refreshMe
 * Validate and refresh token
 */
export async function refreshMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    res.json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        roles: [req.user.role],
        tenant_id: req.user.org_id,
        permissions: ["manage_fleet", "view_reports"],
      },
    } as ApiResponse<RefreshResponse>);
  } catch (error) {
    next(error);
  }
}
