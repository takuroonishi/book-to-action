import type { AgeGroup, Gender } from "@/lib/reader-feedback";

export type ReaderProfile = {
  ageGroup: AgeGroup;
  gender: Gender;
  recommendScore: number;
};

export const READER_PROFILE_KEY = "book-to-action-reader-profile";

export function loadReaderProfile(): ReaderProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(READER_PROFILE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as ReaderProfile;
    if (
      !parsed?.ageGroup ||
      !parsed?.gender ||
      typeof parsed.recommendScore !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveReaderProfile(profile: ReaderProfile) {
  localStorage.setItem(READER_PROFILE_KEY, JSON.stringify(profile));
}

export function hasReaderProfile() {
  return loadReaderProfile() !== null;
}
