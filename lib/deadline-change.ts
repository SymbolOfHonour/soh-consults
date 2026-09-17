import type {QueuedStory} from "./news-queue";

/** Compare stored deadline values without rewriting existing article records. */
export function deadlineChange(previous: Pick<QueuedStory,"deadline_iso"|"deadline">, next: Pick<QueuedStory,"deadline_iso"|"deadline">) {
  const oldDate = previous.deadline_iso || null;
  const newDate = next.deadline_iso || null;
  const oldText = previous.deadline || null;
  const newText = next.deadline || null;
  if (oldDate === newDate && oldText === newText) return null;
  return { oldDate, newDate, oldText, newText };
}
