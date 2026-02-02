"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Modality } from "@prisma/client";

function toModality(v: unknown): Modality {
  return v === "VISIO" ? "VISIO" : v === "MIXTE" ? "MIXTE" : "DOMICILE";
}

export async function createRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/parent/requests/new")}`);
  if (user.role !== "PARENT") redirect("/");

  const listingId = String(formData.get("listingId") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const modality = toModality(formData.get("modality"));
  const goals = String(formData.get("goals") ?? "").trim() || null;
  const availability = String(formData.get("availability") ?? "").trim() || null;

  if (!listingId || !subject || !level || !city) {
    redirect(`/parent/requests/new?listingId=${encodeURIComponent(listingId)}&error=invalid`);
  }

  // Vérifie que l’offre existe toujours
  const offer = await prisma.tutorListing.findFirst({
    where: { id: listingId, isActive: true, teacher: { status: "APPROVED" } },
    select: { id: true },
  });

  if (!offer) redirect(`/tutors`);

  const req = await prisma.tutoringRequest.create({
    data: {
      parentId: user.id,
      subject,
      level,
      city,
      modality,
      goals,
      availability,
    },
    select: { id: true },
  });

  redirect(`/parent/requests/${req.id}`);
}
