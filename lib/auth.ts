import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

// Secret key for JWT signing and verification
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_replace_in_production"
);

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
};

// Create a JWT token
export async function createToken(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 day expiration
    .sign(JWT_SECRET);
}

// Verify a JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionUser & { exp: number };
  } catch (error) {
    return null;
  }
}

// Get the current session from cookies
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return await verifyToken(token);
}

// Check if a user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

// Check if a user is an admin
export async function isAdmin() {
  const session = await getSession();
  return session?.role === "ADMIN";
}

// Middleware to protect routes that require authentication
export async function requireAuth() {
  const isAuthed = await isAuthenticated();

  if (!isAuthed) {
    redirect("/auth/login");
  }
}

// Middleware to protect routes that require admin role
export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }
}

// Helper to create API response for unauthenticated requests
export function unauthenticatedResponse(message = "Unauthenticated") {
  return NextResponse.json({ error: message }, { status: 401 });
}

// Helper to create API response for unauthorized requests
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 403 });
}
