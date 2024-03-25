export const extractAddedWords = (oldString: string, newString: string) => {
  const oldWords = extractWordsFromHTML(oldString);
  const newWords = extractWordsFromHTML(newString);

  // Identify added words and elements
  const addedWordsAndElements = newWords.filter(item => !oldWords.includes(item));

  return addedWordsAndElements;
};

export const extractWordsFromHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const items: (string | undefined)[] = [];

  const traverseNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        items.push(...text.split(/\s+/));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName.toLowerCase() === "img" || element.tagName.toLowerCase() === "iframe") {
        items.push(element.outerHTML);
      }
    }
    node.childNodes.forEach(traverseNodes);
  };

  traverseNodes(doc.body);

  return items as string[];
};

export const highlightWordsInHtml = (
  htmlString: string,
  addedWords: string[]
) => {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  const nodeList = doc.body.childNodes;

  const highlightWords = (textNode: any, addedWords: any) => {
    const words = textNode.nodeValue.split(/\s+/);
    const highlightedWords = words.map((word: any) => {
      const isMatch = addedWords.includes(word.toLowerCase());
      return isMatch
        ? `<span style="background-color: yellow;">${word}</span>`
        : word;
    });
    const span = doc.createElement("span");
    span.innerHTML = highlightedWords.join(" ");
    textNode.replaceWith(span);
  };

  const highlightElement = (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "img" || tagName === "iframe") {
      const outerHTML = element.outerHTML;
      const matchFound = addedWords.includes(outerHTML);
      if (matchFound) {
        element.style.border = "2px solid yellow";
      }
    }
  };
  

  const traverseAndHighlight = (node: any) => {
    if (node.nodeType === Node.TEXT_NODE) {
      highlightWords(
        node,
        addedWords.map((word) => word.toLowerCase())
      );
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      highlightElement(node);
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
  let html = "";

  let isNumbered = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^\d+\./)) {
      // Detect numbered list item
      if (!isNumbered) {
        // Start a numbered list
        html += "<ol>";
        isNumbered = true;
      }

      // Remove the numbering (e.g., 1.)
      const textWithoutNumbering = line.replace(/^\d+\.\s*/, "");

      // Extract the text and link from the line
      const parts = textWithoutNumbering.split(" ");
      const text = parts.slice(0, parts.length - 1).join(" ");
      const link = parts[parts.length - 1];

      if (link.startsWith("http") || link.startsWith("www.")) {
        // Create an HTML link within a list item if the link is present
        const href = link.startsWith("http") ? link : `http://${link}`;
        html += `<li><a href="${href}" target="_blank">${text}</a></li>`;
      } else {
        // Create a list item without an href if there is no link
        html += `<li>${textWithoutNumbering}</li>`;
      }
    } else {
      if (isNumbered) {
        // Close the numbered list
        html += "</ol>";
        isNumbered = false;
      }

      if (line.startsWith("•")) {
        // Detect bulleted list item
        if (!html.includes("<ul>")) {
          // Start a bulleted list if not already started
          html += "<ul>";
        }

        // Remove the bullet character (•)
        const textWithoutBullet = line.replace(/^•\s*/, "");

        // Extract the text and link from the line
        const parts = textWithoutBullet.split(" ");
        const text = parts.slice(0, parts.length - 1).join(" ");
        const link = parts[parts.length - 1];

        if (link.startsWith("http") || link.startsWith("www.")) {
          // Create an HTML link within a list item if the link is present
          const href = link.startsWith("http") ? link : `http://${link}`;
          html += `<li><a href="${href}" target="_blank">${text}</a></li>`;
        } else {
          // Create a list item without an href if there is no link
          html += `<li>${textWithoutBullet}</li>`;
        }
      } else {
        // If the line doesn't start with '•' or numbering, treat it as plain text
        if (html.includes("<ul>")) {
          // Close the bulleted list if it's open
          html += "</ul>";
        } else if (isNumbered) {
          // Close the numbered list if it's open
          html += "</ol>";
        }
        html += `${line}<br>`;
      }
    }
  }

  if (isNumbered) {
    // Close the numbered list if it's still open
    html += "</ol>";
  }

  if (html.includes("<ul>")) {
    // Close the bulleted list if it's open
    html += "</ul>";
  }

  return html;
};

export const convertQuillContentToHtml = (quillHtml: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(quillHtml, "text/html");
  const elements = Array.from(doc.body.querySelectorAll("*"));

  elements.forEach((el) => {
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const span = document.createElement("span");
        span.textContent = node.textContent;

        const html = span.innerHTML.replace(
          /((https?:\/\/|www\.)[^\s]+)(?![^<]*>|[^<>]*<\/a>)/g,
          (url) => {
            // Prepend 'http://' if the URL starts with 'www.'
            const href = url.startsWith("www.") ? `http://${url}` : url;
            return `<a href="${href}" target="_blank">${url}</a>`;
          }
        );

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
  const div = document.createElement("div");
  div.innerHTML = content;
  const lists = div.querySelectorAll("ol, ul");

  if (lists.length === 0) {
    return false; // No lists found
  }

  const isBulletList = lists[0].nodeName.toLowerCase() === "ul";
  for (let i = 1; i < lists.length; i++) {
    const currentIsBulletList = lists[i].nodeName.toLowerCase() === "ul";

    if (currentIsBulletList !== isBulletList) {
      return false; // Mixed types of lists
    }
  }

  return true; // All lists are of the same type
};

export const appendLists = (oldText: string, newText: string) => {
  // Parse old and new HTML strings into DOM elements
  const oldDOM = new DOMParser().parseFromString(oldText, "text/html");
  const newDOM = new DOMParser().parseFromString(newText, "text/html");

  // Find the last list item in the old content
  const oldLastListItem = oldDOM.querySelector("ol:last-child > li:last-child, ul:last-child > li:last-child");

  // Find the lists and iframes in the new content
  const newNodes = newDOM.body.childNodes;

  if (oldLastListItem) {
    // Get the parent of the last list item
    const parentElement = oldLastListItem.parentElement;

    if (parentElement) {
      // Append new nodes to the last list item's parent
      Array.from(newNodes).forEach((newNode) => {
        if (newNode.nodeName === "OL" || newNode.nodeName === "UL") {
          // If the new node is a list, append its children individually
          Array.from(newNode.childNodes).forEach((childNode) => {
            parentElement.appendChild(childNode.cloneNode(true));
          });
        } else {
          // If the new node is not a list, append it directly
          parentElement.appendChild(newNode.cloneNode(true));
        }
      });
    }
  } else {
    // If no lists were found in the old content, append new content directly
    const oldBody = oldDOM.querySelector("body");
    if (oldBody) {
      Array.from(newNodes).forEach((newNode) => {
        oldBody.appendChild(newNode.cloneNode(true));
      });
    }
  }

  // Return the modified content
  const serializer = new XMLSerializer();
  const modifiedHtml = serializer.serializeToString(oldDOM);

  return convertQuillContentToHtml(modifiedHtml);
};

const wrapInPTags = (content: string) => {
  return `<p>${content}</p>`;
};

export const sanitizeContent = (content: any) => {
  // Remove new lines and consolidate content
  let sanitizedContent = content
    .replace(/<p><br><\/p>/g, "")
    .replace(/<\/p>\s*<p>/g, "")
    .replace(/<p>|<\/p>/g, "");

  // Create a temporary div element to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitizedContent;

  // Find all anchor tags
  const anchorTags = tempDiv.querySelectorAll("a");

  // Keep only the first anchor tag and remove the rest
  for (let i = 1; i < anchorTags.length; i++) {
    anchorTags[i].remove();
  }

  // Extract the link from the first anchor tag's HTML and set it as text content
  const firstAnchor = anchorTags[0];
  if (firstAnchor) {
    const linkMatch = firstAnchor.outerHTML.match(/href="(.*?)"/);
    if (linkMatch && linkMatch[1]) {
      // Check if the anchor tag already has text content
      if (firstAnchor.textContent && !firstAnchor.textContent.trim()) {
        firstAnchor.textContent = linkMatch[1]; // Set text content to the URL if it's empty
      }
    }
  }

  // Serialize the content back to a string
  sanitizedContent = tempDiv.innerHTML;

  return wrapInPTags(sanitizedContent);
};
