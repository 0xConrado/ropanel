const fs = require('fs');

/**
 * Atualiza um arquivo .conf preservando comentários, ordem, linhas em branco e indentação.
 * Apenas altera os valores das chaves presentes no objeto "data".
 * 
 * @param {string} filePath - Caminho do arquivo .conf
 * @param {object} data - Objeto com as chaves e valores a serem atualizados
 */
function updateConfFile(filePath, data) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  const newLines = lines.map(line => {
    // Expressão regular para capturar linhas do tipo: [espaços]chave: valor
    const match = line.match(/^(\s*)([^#][^:]+):\s*(.*)$/);
    if (match) {
      const indent = match[1] || '';
      const key = match[2].trim();
      if (data.hasOwnProperty(key)) {
        // Mantém a indentação original
        return `${indent}${key}: ${data[key]}`;
      }
    }
    // Mantém linhas de comentário, em branco e não alteradas
    return line;
  });
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
}

module.exports = { updateConfFile };