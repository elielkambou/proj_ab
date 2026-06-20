"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Modality } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_CV_SIZE = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function toList(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toModality(value: unknown): Modality {
  return value === "VISIO" ? "VISIO" : value === "MIXTE" ? "MIXTE" : "DOMICILE";
}

function toOptionalInt(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function teacherRedirect(error: string) {
  redirect("/teacher/onboarding?error=" + encodeURIComponent(error));
}

export async function submitTeacherApplicationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?returnTo=" + encodeURIComponent("/teacher/onboarding"));
  }
  if (user.role !== "TEACHER") redirect("/");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const profileCity = String(formData.get("profileCity") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const experienceYears = toOptionalInt(formData.get("experienceYears"));
  const diploma = String(formData.get("diploma") ?? "").trim() || null;
  const subjects = toList(formData.get("subjects"));
  const levels = toList(formData.get("levels"));
  const cities = toList(formData.get("cities"));

  const listingId = String(formData.get("listingId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || subjects[0];
  const listingLevels = toList(formData.get("listingLevels"));
  const city = String(formData.get("city") ?? "").trim() || cities[0];
  const modality = toModality(formData.get("modality"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const rateMin = toOptionalInt(formData.get("rateMin"));
  const rateMax = toOptionalInt(formData.get("rateMax"));
  const cvValue = formData.get("cv");
  const cv = cvValue instanceof File && cvValue.size > 0 ? cvValue : null;

  const effectiveListingLevels = listingLevels.length > 0 ? listingLevels : levels;

  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, cvFileName: true },
  });

  if (
    !fullName ||
    !phone ||
    !profileCity ||
    !bio ||
    experienceYears === null ||
    !diploma ||
    subjects.length === 0 ||
    levels.length === 0 ||
    cities.length === 0 ||
    !title ||
    !subject ||
    !city ||
    effectiveListingLevels.length === 0 ||
    (rateMin !== null && rateMax !== null && rateMin > rateMax)
  ) {
    teacherRedirect("invalid");
  }

  if (!cv && !existingProfile?.cvFileName) teacherRedirect("cv-required");
  if (cv && cv.size > MAX_CV_SIZE) teacherRedirect("cv-size");
  if (cv && !ALLOWED_CV_TYPES.has(cv.type)) teacherRedirect("cv-type");

  const cvBuffer = cv ? Buffer.from(await cv.arrayBuffer()) : null;
  const cvMetadata = cv
    ? {
        cvFileName: cv.name,
        cvMimeType: cv.type,
        cvSize: cv.size,
        cvData: cvBuffer,
        cvReceivedAt: new Date(),
      }
    : {};

  const nextStatus =
    existingProfile?.status === "APPROVED" ? "APPROVED" : "SUBMITTED";

  const profile = await prisma.teacherProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName,
      phone,
      city: profileCity,
      bio,
      experienceYears,
      diploma,
      status: nextStatus,
      subjects,
      levels,
      cities,
      ...cvMetadata,
    },
    update: {
      fullName,
      phone,
      city: profileCity,
      bio,
      experienceYears,
      diploma,
      status: nextStatus,
      subjects,
      levels,
      cities,
      ...cvMetadata,
    },
    select: { id: true },
  });

  const listingData = {
    title,
    subject,
    levels: effectiveListingLevels,
    city,
    modality,
    description,
    rateMin,
    rateMax,
    isActive: true,
  };

  const existingListing = listingId
    ? await prisma.tutorListing.findFirst({
        where: { id: listingId, teacherId: profile.id },
        select: { id: true },
      })
    : null;

  if (existingListing) {
    await prisma.tutorListing.update({
      where: { id: existingListing.id },
      data: listingData,
    });
  } else {
    await prisma.tutorListing.create({
      data: {
        ...listingData,
        teacherId: profile.id,
      },
    });
  }

  revalidatePath("/teacher/onboarding");
  revalidatePath("/admin");
  revalidatePath("/tutors");
  revalidatePath("/");
  redirect("/teacher/onboarding?success=submitted&storage=admin");
}
