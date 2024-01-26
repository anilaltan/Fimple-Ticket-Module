const prettier = require('prettier');

const trimContent = (content, type = 'string') => {
  if (content === undefined) return '';
  switch (type) {
    case 'HTML':
      return content.trim().replace(/\s+/g, ' ');
    case 'Dockerfile':
      return content
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
    case 'minified':
      return content.trim().replace(/\s+/g, '');
    case 'string':
    default:
      return String(content).trim();
  }
};

const formatContent = (content, type = 'string') => {
  let formattedContent = trimContent(content, type);
  switch (type) {
    case 'JSON':
      formattedContent = prettier.format(typeof content === 'object' ? content : JSON.parse(content), {
        parser: 'json',
        useTabs: false,
        tabWidth: 2,
      });
      break;
    case 'HTML':
      formattedContent = prettier.format(content, {
        parser: 'html',
        useTabs: false,
        tabWidth: 2,
      });
      break;
    case 'JS':
      formattedContent = prettier.format(content, {
        parser: 'babel',
        useTabs: false,
        tabWidth: 2,
        singleQuote: true,
      });
      break;
    case 'Dockerfile':
      formattedContent = trimContent(content, 'Dockerfile');
      break;
    default:
      formattedContent = content;
      break;
  }
  return formattedContent;
};

module.exports = { formatContent, trimContent };
