import { ALLOWED_FILE_EXTENSIONS } from "@/utils/constants";

export function validateFileExtension(fileName: string): boolean {
  const extension = fileName
    .slice(fileName.lastIndexOf("."))
    .toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.includes(extension);
}

export function getFileExtension(fileName: string): string {
  return fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
}
