import { app, HttpRequest, InvocationContext } from "@azure/functions";
import type { HttpResponseInit } from "@azure/functions";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dummy-secret-for-now";
const DUMMY_ORG_ID = "00000000-0000-0000-0000-000000000001"; // Hardcoded org_id for dev

/**
 * Handle Dummy Login
 */
export async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const body = (await request.json()) as any;
    
    // Dummy validation: accept any credentials for now
    context.log(`Dummy login attempt for: ${body.email}`);

    const token = jwt.sign(
        {
            id: "user-123",
            email: body.email,
            role: "admin",
            org_id: DUMMY_ORG_ID,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    return {
        status: 200,
        jsonBody: {
            token,
            user: {
                id: "user-123",
                name: "Dummy Administrator",
                email: body.email,
                role: "admin",
                org_id: DUMMY_ORG_ID,
            }
        }
    };
}

/**
 * Handle refreshMe (Token Validation)
 */
export async function refreshMe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 401, jsonBody: { message: "Unauthorized" } };
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return { status: 401, jsonBody: { message: "Unauthorized" } };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        return {
            status: 200,
            jsonBody: {
                id: decoded.id,
                name: "Dummy Administrator",
                email: decoded.email,
                roles: ["admin"],
                tenant_id: decoded.org_id, // Frontend expects tenant_id
                permissions: ["manage_fleet", "view_reports"]
            }
        };
    } catch (err) {
        return { status: 401, jsonBody: { message: "Invalid token" } };
    }
}

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'tenant-login', // Match frontend expectation
    handler: login
});

app.http('refreshMe', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'refreshMe',
    handler: refreshMe
});
