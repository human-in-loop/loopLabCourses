// MongoDB utility function for ID handling
export function getDocumentId(doc: any): string | undefined {
  if (!doc) return undefined;
  return doc.id || (doc._id ? String(doc._id) : undefined);
}