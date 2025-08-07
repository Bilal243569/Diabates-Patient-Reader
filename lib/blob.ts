import { put } from "@vercel/blob"

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const filename = `profile-${userId}-${Date.now()}.${file.name.split(".").pop()}`

  const blob = await put(filename, file, {
    access: "public",
  })

  return blob.url
}

export async function uploadReportPDF(pdfBuffer: Buffer, userId: string, reportId: string): Promise<string> {
  const filename = `report-${userId}-${reportId}-${Date.now()}.pdf`

  const blob = await put(filename, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
  })

  return blob.url
}
