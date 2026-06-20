"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Modality } from "@prisma/client";
import { redirect } from "next/navigation";

function toModality(v: unknown): Modality {
  return v === "VISIO" ? "VISIO" : v === "MIXTE" ? "MIXTE" : "DOMICILE";
}

export async function createRequestAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const user = await getCurrentUser();
  const returnTo =
    "/parent/requests/new" +
    (listingId ? "?listingId=" + encodeURIComponent(listingId) : "");

  if (!user) redirect("/login?returnTo=" + encodeURIComponent(returnTo));
  if (user.role !== "PARENT") redirect("/");

  const subject = String(formData.get("subject") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const modality = toModality(formData.get("modality"));
  const studentName = String(formData.get("studentName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const preferredContact =
    String(formData.get("preferredContact") ?? "").trim() || null;
  const goals = String(formData.get("goals") ?? "").trim() || null;
  const availability = String(formData.get("availability") ?? "").trim() || null;

  if (!listingId || !subject || !level || !city || !studentName || !contactPhone) {
    redirect(
      "/parent/requests/new?listingId=" +
        encodeURIComponent(listingId) +
        "&error=invalid"
    );
  }

  const offer = await prisma.tutorListing.findFirst({
    where: { id: listingId, isActive: true, teacher: { status: "APPROVED" } },
    select: { id: true },
  });

  if (!offer) redirect("/tutors");

  const req = await prisma.tutoringRequest.create({
    data: {
      parentId: user.id,
      subject,
      level,
      city,
      modality,
      studentName,
      contactPhone,
      preferredContact,
      goals,
      availability,
      sourceListingId: listingId,
    },
    select: { id: true },
  });

  redirect("/parent/requests/" + req.id);
}
