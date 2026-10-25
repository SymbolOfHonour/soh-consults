// A shared subject word is not evidence that a fact answers the requested action.
export function answersRequestedTopic(question: string, evidence: string) {
  if (/\bhow\b.*\baccept\b.*\b(admission|caps)\b/i.test(question)) {
    return /\baccept\b/i.test(evidence) && /\b(log[ -]?in|sign[ -]?in|click|select|open|visit|sms|send|dial)\b/i.test(evidence);
  }
  if (/subject.{0,25}combin|utme subjects|what subjects/i.test(question)) {
    if (!/subject|english|mathematics|physics|chemistry|biology|government|literature/i.test(evidence)) return false;
    const course = question.match(/(?:for|study)\s+(.+?)\s+(?:at|in)\s+/i)?.[1];
    // Require the course and subjects together, rather than a college's course list.
    if (course && !evidence.toLowerCase().includes(course.toLowerCase())) return false;
    return /(?:subjects?|combination).{0,100}(?:english|mathematics|physics|chemistry|biology|government|literature)|(?:english|mathematics|physics|chemistry|biology).{0,100}(?:subjects?|combination)/i.test(evidence);
  }
  return true;
}
