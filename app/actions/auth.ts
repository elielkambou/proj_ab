"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie, signSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

function toPublicRole(v: unknown): Role {
  return v === "TEACHER" ? "TEACHER" : "PARENT";
}

function safeReturnTo(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function dashboardFor(role: Role) {
  if (role === "TEACHER") return "/teacher/onboarding";
  if (role === "ADMIN") return "/admin";
  return "/parent/dashboard";
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = toPublicRole(formData.get("role"));
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!email || !password || password.length < 8 || !fullName || !phone) {
    redirect(
      `/register?role=${role}&returnTo=${encodeURIComponent(
        returnTo
      )}&error=invalid`
    );
  }

  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}&error=exists`);
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      role,
      ...(role === "TEACHER"
        ? {
            teacherProfile: {
              create: {
                fullName,
                phone,
                city: city || null,
                status: "DRAFT",
                subjects: [],
                levels: [],
                cities: city ? [city] : [],
              },
            },
          }
        : role === "PARENT"
        ? {
            parentProfile: {
              create: {
                fullName,
                phone,
                city: city || null,
              },
            },
          }
        : {}),
    },
    select: { id: true, role: true },
  });

  const token = await signSession({ userId: user.id, role: user.role });

  await setSessionCookie(token);

  if (returnTo) redirect(returnTo);
  redirect(dashboardFor(user.role));
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""));

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, password: true },
  });

  if (!user)
    redirect(
      `/login?returnTo=${encodeURIComponent(returnTo)}&error=invalid`
    );

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    redirect(
      `/login?returnTo=${encodeURIComponent(returnTo)}&error=invalid`
    );

  const token = await signSession({ userId: user.id, role: user.role });

  await setSessionCookie(token);

  if (returnTo) redirect(returnTo);
  redirect(dashboardFor(user.role));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
