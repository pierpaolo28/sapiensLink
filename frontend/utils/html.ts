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