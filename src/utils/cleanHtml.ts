export const cleanHtmlToText = (html: string): string => {
  if (!html) return '';

  // 1. Replace <br>, <br/>, <br />, </p>, and </div> with newlines
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');

  // 2. Strip all remaining HTML tags
  text = text.replace(/<[^>]*>?/gm, '');

  // 3. Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // 4. Trim excessive whitespace and newlines
  text = text.replace(/\n\s*\n/g, '\n\n').trim();

  return text;
};

export const stripEmojis = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

