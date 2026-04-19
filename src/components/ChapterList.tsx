import { getCompletedChapters, toggleChapter } from "../utils/storageManager";
import { useEffect, useState } from "react";

interface Chapter {
  id: string;
  title: string;
}

interface ChapterListProps {
  subjectName: string;
  chapters: Chapter[];
}

export default function ChapterList({
  subjectName,
  chapters,
}: ChapterListProps) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageWarning, setStorageWarning] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const result = getCompletedChapters(subjectName);
    if (result.success) {
      setCompleted(result.data || []);
    } else if (result.error) {
      setStorageWarning(result.error);
    }
    setIsHydrated(true);
  }, [subjectName]);

  const handleToggle = (chapterId: string) => {
    const result = toggleChapter(subjectName, chapterId);

    if (result.success) {
      setCompleted(result.data || []);
      setStorageWarning(""); // Clear warning on success
    } else if (result.error) {
      setStorageWarning(result.error);
      // Still update UI optimistically
      setCompleted((prev) =>
        prev.includes(chapterId)
          ? prev.filter((id) => id !== chapterId)
          : [...prev, chapterId],
      );
    }
  };

  const completionPercentage =
    chapters.length > 0
      ? Math.round((completed.length / chapters.length) * 100)
      : 0;

  if (!isHydrated) {
    return <div className="skeleton h-40 w-full"></div>;
  }

  return (
    <div>
      {/* Storage Warning */}
      {storageWarning && (
        <div className="alert alert-warning mb-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">
            ⚠️ Progress won't be saved: {storageWarning}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <progress
        className="progress progress-primary mb-3 w-full"
        value={completed.length}
        max={chapters.length}
      />
      <div className="mb-3 text-sm text-gray-600">
        {completed.length} of {chapters.length} completed (
        {completionPercentage}
        %)
      </div>

      {/* Chapter List */}
      <ul className="space-y-2">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={completed.includes(chapter.id)}
              onChange={() => handleToggle(chapter.id)}
              aria-label={`Mark ${chapter.title} as complete`}
            />
            <span
              className={
                completed.includes(chapter.id)
                  ? "line-through text-gray-500"
                  : ""
              }
            >
              {chapter.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
