import jwt from "jsonwebtoken";
import type { HttpRequest } from "@azure/functions";

export interface VlToken {
  sub: string;
  email: string;
  org_id: number;
  role_name: string;
  permissions: string[];
  access_level: string;
  is_owner: boolean;
}

export function signToken(payload: VlToken): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? "86400"),
  });
}

export function requireAuth(
  req: HttpRequest,
): { user: VlToken } | { error: string } {
  try {
    const header = req.headers.get("Authorization") ?? "";
    if (!header.startsWith("Bearer ")) return { error: "Missing token" };

    const token = header.replace("Bearer ", "");
    const user = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as VlToken;

    return { user };
  } catch (e: unknown) {
    return {
      error:
        e instanceof Error && e.message === "jwt expired"
          ? "Session expired"
          : "Invalid token",
    };
  }
}

export function hasPermission(user: VlToken, permission: string): boolean {
  if (user.is_owner) return true;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}
