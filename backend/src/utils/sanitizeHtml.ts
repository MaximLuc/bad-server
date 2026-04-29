import sanitizeHtml from 'sanitize-html'

  export function sanitizeOrderComment(value = '') {
      return sanitizeHtml(value, {
          allowedTags: [
              'b',
              'strong',
              'i',
              'em',
              'u',
              'p',
              'br',
              'ul',
              'ol',
              'li',
              'a',
          ],
          allowedAttributes: {
              a: ['href'],
          },
          allowedSchemes: ['http', 'https', 'mailto'],
      })
  }