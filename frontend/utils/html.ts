// Helper function to extract words from HTML
export const extractWordsFromHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const words: string[] = [];

  const traverseNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        words.push(...text.split(/\s+/));
      }
    } else {
      node.childNodes.forEach(traverseNodes);
    }
  };

  traverseNodes(doc.body);

  return words;
};

export const extractAddedWords = (oldString: string, newString: string) => {

  const oldWords = extractWordsFromHTML(oldString);
  const newWords = extractWordsFromHTML(newString);

  // Identify added words
  const addedWords = newWords.filter((word) => !oldWords.includes(word));

  return addedWords;
};


export const highlightWordsInHtml = (htmlString: string, addedWords: string[]) => {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  const nodeList = doc.body.childNodes;

  const highlightWords = (textNode: any, addedWords: any) => {
    const words = textNode.nodeValue.split(/\s+/);
    const highlightedWords = words.map((word: any) => {
      const isMatch = addedWords.includes(word.toLowerCase());
      return isMatch ? `<span style="background-color: yellow;">${word}</span>` : word;
    });
    const span = doc.createElement('span');
    span.innerHTML = highlightedWords.join(' ');
    textNode.replaceWith(span);
  };

  const traverseAndHighlight = (node: any) => {
    if (node.nodeType === Node.TEXT_NODE) {
      highlightWords(node, addedWords);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.childNodes.length > 0) {
        const childNodes = [...node.childNodes];
        childNodes.forEach(traverseAndHighlight);
      }
    }
  };

  nodeList.forEach(traverseAndHighlight);

  return doc.body.innerHTML;
};

export const convertPlainTextToHtml = (plainText: string) => {
  const lines = plainText.split(/\r?\n/);
  let html = '';

  let isNumbered = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^\d+\./)) {
      // Detect numbered list item
      if (!isNumbered) {
        // Start a numbered list
        html += '<ol>';
        isNumbered = true;
      }

      // Remove the numbering (e.g., 1.)
      const textWithoutNumbering = line.replace(/^\d+\.\s*/, '');

      // Extract the text and link from the line
      const parts = textWithoutNumbering.split(' ');
      const text = parts.slice(0, parts.length - 1).join(' ');
      const link = parts[parts.length - 1];

      if (link.startsWith('http') || link.startsWith('www.')) {
        // Create an HTML link within a list item if the link is present
        const href = link.startsWith('http') ? link : `http://${link}`;
        html += `<li><a href="${href}" target="_blank">${text}</a></li>`;
      } else {
        // Create a list item without an href if there is no link
        html += `<li>${textWithoutNumbering}</li>`;
      }
    } else {
      if (isNumbered) {
        // Close the numbered list
        html += '</ol>';
        isNumbered = false;
      }

      if (line.startsWith('•')) {
        // Detect bulleted list item
        if (!html.includes('<ul>')) {
          // Start a bulleted list if not already started
          html += '<ul>';
        }

        // Remove the bullet character (•)
        const textWithoutBullet = line.replace(/^•\s*/, '');

        // Extract the text and link from the line
        const parts = textWithoutBullet.split(' ');
        const text = parts.slice(0, parts.length - 1).join(' ');
        const link = parts[parts.length - 1];

        if (link.startsWith('http') || link.startsWith('www.')) {
          // Create an HTML link within a list item if the link is present
          const href = link.startsWith('http') ? link : `http://${link}`;
          html += `<li><a href="${href}" target="_blank">${text}</a></li>`;
        } else {
          // Create a list item without an href if there is no link
          html += `<li>${textWithoutBullet}</li>`;
        }
      } else {
        // If the line doesn't start with '•' or numbering, treat it as plain text
        if (html.includes('<ul>')) {
          // Close the bulleted list if it's open
          html += '</ul>';
        } else if (isNumbered) {
          // Close the numbered list if it's open
          html += '</ol>';
        }
        html += `${line}<br>`;
      }
    }
  }

  if (isNumbered) {
    // Close the numbered list if it's still open
    html += '</ol>';
  }

  if (html.includes('<ul>')) {
    // Close the bulleted list if it's open
    html += '</ul>';
  }

  return html;
};

export const convertQuillContentToHtml = (quillHtml: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(quillHtml, 'text/html');
  const elements = Array.from(doc.body.querySelectorAll('*'));

  elements.forEach(el => {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const span = document.createElement('span');
        span.textContent = node.textContent;

        const html = span.innerHTML.replace(/((https?:\/\/|www\.)[^\s]+)(?![^<]*>|[^<>]*<\/a>)/g, (url) => {
          // Prepend 'http://' if the URL starts with 'www.'
          const href = url.startsWith('www.') ? `http://${url}` : url;
          return `<a href="${href}" target="_blank">${url}</a>`;
        });

        span.innerHTML = html;
        if (node.parentNode) {
          node.parentNode.replaceChild(span, node);
        }
      }
    });
  });

  return doc.body.innerHTML;
};

export const isValidListContent = (content: any) => {
  const div = document.createElement('div');
  div.innerHTML = content;
  const lists = div.querySelectorAll('ol, ul');

  if (lists.length === 0) {
    return false; // No lists found
  }

  const isBulletList = lists[0].nodeName.toLowerCase() === 'ul';
  for (let i = 1; i < lists.length; i++) {
    const currentIsBulletList = lists[i].nodeName.toLowerCase() === 'ul';

    if (currentIsBulletList !== isBulletList) {
      return false; // Mixed types of lists
    }
  }

  return true; // All lists are of the same type
};

export const appendLists = (oldText: string, newText: string) => {
  // Parse old and new HTML strings into DOM elements
  const oldDOM = new DOMParser().parseFromString(oldText, 'text/html');
  const newDOM = new DOMParser().parseFromString(newText, 'text/html');

  // Find the lists in the DOM
  const oldList = oldDOM.querySelector('ol, ul');
  const newList = newDOM.querySelector('ol, ul');

  if (oldList && newList) {
    // Append new list items to the old list
    Array.from(newList.children).forEach((newItem) => {
      oldList.appendChild(newItem.cloneNode(true));
    });

    // Return only the modified list HTML
    const serializer = new XMLSerializer();
    const modifiedListHtml = serializer.serializeToString(oldList);

    return convertQuillContentToHtml(modifiedListHtml);
  }

  // Return the original content if lists are not found
  return oldText;
};

const wrapInPTags = (content: string) => {
  return `<p>${content}</p>`;
};

export const sanitizeContent = (content: any) => {
  // Remove new lines and consolidate content
  let sanitizedContent = content.replace(/<p><br><\/p>/g, '').replace(/<\/p>\s*<p>/g, '').replace(/<p>|<\/p>/g, '');

  // Create a temporary div element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedContent;

  // Find all anchor tags
  const anchorTags = tempDiv.querySelectorAll('a');

  // Keep only the first anchor tag and remove the rest
  for (let i = 1; i < anchorTags.length; i++) {
    anchorTags[i].remove();
  }

  // Extract the link from the first anchor tag's HTML and set it as text content
  const firstAnchor = anchorTags[0];
  if (firstAnchor) {
    const linkMatch = firstAnchor.outerHTML.match(/href="(.*?)"/);
    if (linkMatch && linkMatch[1]) {
      firstAnchor.textContent = linkMatch[1];
    }
  }

  // Serialize the content back to a string
  sanitizedContent = tempDiv.innerHTML;

  return wrapInPTags(sanitizedContent);
};