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
  const urlPattern = /(https?:\/\/[^\s<>"']+|\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;
  const match = str.match(urlPattern);

  if (match) {
    let link = match[1].trim();
    if (link.startsWith('//')) {
      link = 'https:' + link;
    } else if (link.startsWith('www.')) {
      link = 'https://' + link;
    }
    const notes = str.replace(match[0], '').trim();
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

export function isDownloadLink(link: string): boolean {
  if (!link) return false;
  const lower = link.toLowerCase();
  return Boolean(
    lower.includes('mediafire.com') ||
    lower.includes('mega.nz') ||
    lower.includes('drive.google.com') ||
    lower.includes('dropbox.com') ||
    lower.match(/\.(rar|zip|7z|exe|apk|dmg|tar|gz|bin|iso)(\?.*)?$/i)
  );
}

export function cleanDisplayTitle(title: string | undefined, link: string, lang: string = 'ar'): string {
  if (title && title.trim()) {
    const t = title.trim();
    const isUrlLike =
      t.startsWith('http://') ||
      t.startsWith('https://') ||
      t.startsWith('//') ||
      t.startsWith('www.') ||
      t.includes('mediafire.com') ||
      t.includes('mega.nz') ||
      t.includes('drive.google.com') ||
      t.includes('dropbox.com') ||
      t.includes('/file/') ||
      /\.(rar|zip|7z|exe|apk|dmg|tar|gz|bin|iso)(\?.*)?$/i.test(t);

    if (!isUrlLike) {
      return t;
    }
  }

  if (isDownloadLink(link)) {
    return lang === 'ar' ? 'تحميل ملف الأداة / البرنامج' : 'Download Tool / File';
  }

  const lower = (link || '').toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return lang === 'ar' ? 'مشاهدة فيديو الشرح' : 'Watch Tutorial Video';
  }

  return lang === 'ar' ? 'فتح الرابط المباشر للخدمة' : 'Open Service Link';
}

export function getDomainName(link: string): string {
  if (!link) return '';
  try {
    const parsed = new URL(link.startsWith('http') ? link : `https://${link}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
