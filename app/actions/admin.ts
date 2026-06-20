"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/admin")}`);
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function approveTeacherAction(formData: FormData) {
  await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) redirect("/admin?error=invalid");

  await prisma.teacherProfile.update({
    where: { id: profileId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin");
  revalidatePath("/tutors");
  revalidatePath("/");
  redirect("/admin?success=teacher-approved");
}

export async function rejectTeacherAction(formData: FormData) {
  await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) redirect("/admin?error=invalid");

  await prisma.teacherProfile.update({
    where: { id: profileId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin");
  redirect("/admin?success=teacher-rejected");
}

export async function assignRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  if (!requestId || !listingId) redirect("/admin?error=invalid");

  const listing = await prisma.tutorListing.findFirst({
    where: { id: listingId, isActive: true, teacher: { status: "APPROVED" } },
    select: { id: true },
  });
  if (!listing) redirect("/admin?error=listing");

  await prisma.tutoringRequest.update({
    where: { id: requestId },
    data: {
      assignedListingId: listing.id,
      status: "MATCHED",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/parent/dashboard");
  redirect("/admin?success=request-assigned");
}

export async function closeRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) redirect("/admin?error=invalid");

  await prisma.tutoringRequest.update({
    where: { id: requestId },
    data: { status: "CLOSED" },
  });

  revalidatePath("/admin");
  revalidatePath("/parent/dashboard");
  redirect("/admin?success=request-closed");
}
