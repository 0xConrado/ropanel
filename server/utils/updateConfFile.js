const fs = require('fs');

/**
 * Atualiza um arquivo .conf preservando comentários, ordem e estrutura.
 * Apenas altera os valores das chaves presentes no objeto "data".
 * 
 * @param {string} filePath - Caminho do arquivo .conf
 * @param {object} data - Objeto com as chaves e valores a serem atualizados
 */
function updateConfFile(filePath, data) {
  // Lê o conteúdo original do arquivo
  const original = fs.readFileSync(filePath, 'utf8');
  // Divide em linhas para processar uma a uma
  const lines = original.split('\n');
  // Cria um novo array de linhas, atualizando apenas as chaves presentes em "data"
  const newLines = lines.map(line => {
    // Expressão regular para capturar linhas do tipo: chave: valor
    const match = line.match(/^(\s*[^#][^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      // Se a chave está no objeto data, substitui o valor
      if (data.hasOwnProperty(key)) {
        return `${key}: ${data[key]}`;
      }
    }
    // Caso não seja uma linha de configuração ou não precise alterar, retorna igual
    return line;
  });
  // Junta as linhas e salva de volta no arquivo
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
}

module.exports = { updateConfFile };