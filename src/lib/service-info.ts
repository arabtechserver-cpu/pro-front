export interface ParsedServiceInfo {
  notes: string;
  link: string;
  linkTitle?: string;
}

export function parseServiceInfo(raw: string | null | undefined): ParsedServiceInfo {
  if (!raw) {
    return { notes: '', link: '', linkTitle: '' };
  }

  const str = String(raw).trim();
  if (!str) {
    return { notes: '', link: '', linkTitle: '' };
  }

  // Attempt JSON parsing if it looks like an object
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object') {
        const notes = typeof parsed.notes === 'string'
          ? parsed.notes
          : typeof parsed.description === 'string'
            ? parsed.description
            : typeof parsed.text === 'string'
              ? parsed.text
              : '';
        const link = typeof parsed.link === 'string'
          ? parsed.link
          : typeof parsed.url === 'string'
            ? parsed.url
            : '';
        const linkTitle = typeof parsed.linkTitle === 'string'
          ? parsed.linkTitle
          : typeof parsed.title === 'string'
            ? parsed.title
            : '';

        return {
          notes: notes.trim(),
          link: link.trim(),
          linkTitle: linkTitle.trim(),
        };
      }
    } catch {
      // Fall through to plain text parsing
    }
  }

  // Fallback: detect direct URL embedded in plain text
  const urlPattern = /(https?:\/\/[^\s<>"']+)/i;
  const match = str.match(urlPattern);

  if (match) {
    const link = match[1].trim();
    const notes = str.replace(link, '').trim();
    return { notes, link, linkTitle: '' };
  }

  return { notes: str, link: '', linkTitle: '' };
}

export function formatServiceInfo(notes: string, link: string, linkTitle?: string): string | null {
  const cleanNotes = (notes || '').trim();
  const cleanLink = (link || '').trim();
  const cleanTitle = (linkTitle || '').trim();

  if (!cleanNotes && !cleanLink) {
    return null;
  }

  if (cleanLink) {
    return JSON.stringify({
      notes: cleanNotes,
      link: cleanLink,
      ...(cleanTitle ? { linkTitle: cleanTitle } : {}),
    });
  }

  return cleanNotes;
}
