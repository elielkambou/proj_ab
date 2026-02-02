"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie, signSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

function toRole(v: unknown): Role {
  return v === "TEACHER" ? "TEACHER" : v === "ADMIN" ? "ADMIN" : "PARENT";
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = toRole(formData.get("role"));
  const returnTo = String(formData.get("returnTo") ?? "");

  if (!email || !password || password.length < 8) {
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
    redirect(
      `/login?returnTo=${encodeURIComponent(returnTo)}&error=exists`
    );
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
                status: "DRAFT",
                subjects: [],
                levels: [],
                cities: [],
              },
            },
          }
        : role === "PARENT"
        ? {
            parentProfile: {
              create: {},
            },
          }
        : {}),
    },
    select: { id: true, role: true },
  });

  const token = await signSession({ userId: user.id, role: user.role });

  // 🔥 Correction demandée
  await setSessionCookie(token);

  if (returnTo) redirect(returnTo);
  redirect(
    user.role === "TEACHER"
      ? "/teacher/onboarding"
      : "/parent/dashboard"
  );
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "");

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

  // 🔥 Correction demandée
  await setSessionCookie(token);

  if (returnTo) redirect(returnTo);
  redirect(
    user.role === "TEACHER"
      ? "/teacher/onboarding"
      : "/parent/dashboard"
  );
}

export async function logoutAction() {
  // 🔥 Correction demandée
  await clearSessionCookie();
  redirect("/");
}