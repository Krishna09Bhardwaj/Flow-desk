const URGENT_KEYWORDS = /urgent|asap|critical|bug|down|block|blocker|hotfix|prod|production|broken|crash|error/i

export const suggestPriority = (title) => {
  if (!title) return null
  return URGENT_KEYWORDS.test(title) ? 'URGENT' : null
}
