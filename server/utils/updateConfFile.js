const fs = require('fs');

function updateConfFile(filePath, data) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  const updatedKeys = new Set();
  const newLines = lines.map(line => {
    const match = line.match(/^(\s*)([a-zA-Z0-9_]+):\s*(.*)$/);
    if (match) {
      const indent = match[1] || '';
      const key = match[2].trim();
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        updatedKeys.add(key);
        return `${indent}${key}: ${data[key]}`;
      }
    }
    return line;
  });

  // Adiciona novas chaves que não existiam no arquivo
  Object.keys(data).forEach(key => {
    if (!updatedKeys.has(key)) {
      newLines.push(`${key}: ${data[key]}`);
    }
  });

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
}

module.exports = { updateConfFile };