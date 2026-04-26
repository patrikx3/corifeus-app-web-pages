export * from './log';

const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
};

export function decodeEntities(encodedString: string): string {
    if (typeof encodedString !== 'string') return '';
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = encodedString;
        return div.textContent || '';
    }
    return encodedString.replace(/&[a-zA-Z0-9#]+;/g, (match) => entityMap[match] || match);
}
