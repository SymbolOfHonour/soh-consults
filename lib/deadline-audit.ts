import type {QueuedStory} from "./news-queue";
export function deadlineChange(before:Pick<QueuedStory,"deadline"|"deadline_iso">,after:Pick<QueuedStory,"deadline"|"deadline_iso">){const oldDeadline=before.deadline_iso||before.deadline||null;const newDeadline=after.deadline_iso||after.deadline||null;return oldDeadline===newDeadline?null:{oldDeadline,newDeadline};}
