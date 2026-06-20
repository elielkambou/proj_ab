import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function safeFileName(value: string | null) {
  const fallback = "cv-professeur";
  const name = (value || fallback)
    .split(String.fromCharCode(10))
    .join(" ")
    .split(String.fromCharCode(13))
    .join(" ")
    .split(String.fromCharCode(34))
    .join(" ")
    .trim();
  return name || fallback;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Non authentifié", { status: 401 });
  if (user.role !== "ADMIN") return new NextResponse("Accès refusé", { status: 403 });

  const { profileId } = await params;
  const profile = await prisma.teacherProfile.findUnique({
    where: { id: profileId },
    select: { cvData: true, cvFileName: true, cvMimeType: true },
  });

  if (!profile?.cvData) {
    return new NextResponse("CV introuvable", { status: 404 });
  }

  const filename = safeFileName(profile.cvFileName);
  const encodedName = encodeURIComponent(filename);
  const headers = new Headers({
    "Content-Type": profile.cvMimeType || "application/octet-stream",
    "Content-Disposition":
      "attachment; filename=" +
      String.fromCharCode(34) +
      filename +
      String.fromCharCode(34) +
      "; filename*=UTF-8" +
      String.fromCharCode(39) +
      String.fromCharCode(39) +
      encodedName,
    "Cache-Control": "private, no-store",
  });

  return new NextResponse(profile.cvData, { status: 200, headers });
}
