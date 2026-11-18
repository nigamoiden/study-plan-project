"use client";

import { useState, type FormEvent } from "react";

import { SUBJECT_OPTIONS } from "../constants";
import type { Lesson } from "../types/content.types";
import { saveFocusSubjects } from "../services/lesson.service";

export default function SubjectPreferencesForm({
  focusSubjects,
  onSaved,
}: {
  focusSubjects: Lesson["subject"][];
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<Lesson["subject"][]>(focusSubjects);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggle(subject: Lesson["subject"]) {
    setSelected((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (selected.length === 0) {
      setMessage("Hãy chọn ít nhất một môn.");
      return;
    }

    setSaving(true);
    try {
      await saveFocusSubjects(selected);
      onSaved();
      setMessage("Đã cập nhật môn tập trung.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu môn học."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-5"
    >
      <h2 className="font-semibold">Môn bạn muốn tập trung</h2>
      <p className="mt-1 text-sm text-slate-600">
        Chỉ các bài học thuộc những môn đã chọn sẽ xuất hiện trong thư viện.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUBJECT_OPTIONS.map((subject) => (
          <label
            key={subject.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(subject.value)}
              onChange={() => toggle(subject.value)}
              className="accent-violet-600"
            />
            {subject.label}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || selected.length === 0}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu môn học"}
        </button>
        {message && (
          <p role="status" className="text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
