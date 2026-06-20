"use client";

import { useEffect, useState } from "react";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  type AgeGroup,
  type Gender,
} from "@/lib/reader-feedback";
import type { ReaderProfile } from "@/lib/reader-profile";

const selectClassName =
  "w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] text-[#1d1d1f] transition focus:bg-[#ebebef] focus:outline-none";

type ReaderProfileSectionProps = {
  profile: ReaderProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (profile: ReaderProfile) => void;
};

export function ReaderProfileSection({
  profile,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
}: ReaderProfileSectionProps) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("回答しない");
  const [gender, setGender] = useState<Gender>("回答しない");
  const [recommendScore, setRecommendScore] = useState(7);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAgeGroup(profile.ageGroup);
    setGender(profile.gender);
    setRecommendScore(profile.recommendScore);
  }, [profile]);

  function handleSave() {
    onSave({
      ageGroup,
      gender,
      recommendScore,
    });
  }

  const showForm = isEditing || !profile;

  return (
    <section className="rounded-3xl bg-[#f5f5f7] px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#1d1d1f]">読者情報</p>
          {!profile ? (
            <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
              初回のみ入力。年代・性別・おすすめ度は2回目以降も自動反映されます。
            </p>
          ) : null}
        </div>
        {profile && !isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-sm text-[#0071e3]"
          >
            編集する
          </button>
        ) : null}
      </div>

      {!showForm && profile ? (
        <p className="mt-3 text-[15px] text-[#1d1d1f]">
          {profile.ageGroup} / {profile.gender} / おすすめ度{" "}
          {profile.recommendScore}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <label htmlFor="profile-age-group" className="block space-y-2">
            <span className="text-sm font-medium text-[#1d1d1f]">年代</span>
            <select
              id="profile-age-group"
              value={ageGroup}
              onChange={(event) =>
                setAgeGroup(event.target.value as AgeGroup)
              }
              className={selectClassName}
            >
              {AGE_GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="profile-gender" className="block space-y-2">
            <span className="text-sm font-medium text-[#1d1d1f]">性別</span>
            <select
              id="profile-gender"
              value={gender}
              onChange={(event) => setGender(event.target.value as Gender)}
              className={selectClassName}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3 rounded-2xl bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="profile-recommend-score"
                className="text-sm font-medium text-[#1d1d1f]"
              >
                同じ悩みを持つ人に、この本を勧めたいですか？
              </label>
              <span className="text-2xl font-semibold text-[#1d1d1f]">
                {recommendScore}
              </span>
            </div>
            <input
              id="profile-recommend-score"
              type="range"
              min={0}
              max={10}
              value={recommendScore}
              onChange={(event) =>
                setRecommendScore(Number(event.target.value))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d2d2d7] accent-[#0071e3]"
            />
            <div className="flex justify-between text-xs text-[#86868b]">
              <span>0 勧めない</span>
              <span>10 ぜひ勧めたい</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[52px] rounded-full bg-[#1d1d1f] px-6 py-4 text-base font-medium text-white"
            >
              読者情報を保存
            </button>
            {profile ? (
              <button
                type="button"
                onClick={onCancelEdit}
                className="min-h-[52px] rounded-full border border-[#d2d2d7] bg-white px-6 py-4 text-base font-medium text-[#1d1d1f]"
              >
                キャンセル
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
