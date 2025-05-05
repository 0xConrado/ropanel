const express = require('express');
const fs = require('fs');
const path = require('path');
const { updateConfFile } = require('../utils/updateConfFile');
const router = express.Router();

/**
 * Função para ler e parsear um arquivo .conf simples no formato key: value
 * Retorna um objeto com as chaves e valores encontrados
 */
function lerConf(confPath) {
  if (!fs.existsSync(confPath)) return {};
  const lines = fs.readFileSync(confPath, 'utf8').split('\n');
  const data = {};
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) data[match[1]] = match[2];
  }
  return data;
}

/**
 * Endpoint para ler todos os arquivos .conf especificados
 * Recebe no body o caminho da pasta confDir (ex: /root/Emulador/rathena/conf)
 * Retorna um objeto com o conteúdo parseado de cada arquivo
 */
router.post('/api/emulador/ler-configs', (req, res) => {
  const { confDir } = req.body;
  const arquivos = [
    'login_athena.conf',
    'map_athena.conf',
    'char_athena.conf',
    'inter_athena.conf'
  ];
  const result = {};
  for (const arq of arquivos) {
    const confPath = path.join(confDir, arq);
    result[arq] = lerConf(confPath);
  }
  res.json(result);
});

/**
 * Endpoint para salvar um arquivo .conf preservando estrutura e comentários
 * Recebe no body: confDir (pasta), arquivo (nome do arquivo), data (conteúdo a salvar)
 * Usa utilitário updateConfFile para manter estrutura original
 */
router.post('/api/emulador/salvar-config', (req, res) => {
  const { confDir, arquivo, data } = req.body;
  const confPath = path.join(confDir, arquivo);
  try {
    updateConfFile(confPath, data);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.toString() });
  }
});

/**
 * Endpoint para descomentar linhas específicas nos arquivos de configuração
 * Recebe no body o confDir (pasta dos arquivos .conf)
 * Remove os '//' antes das linhas indicadas para habilitar configurações
 */
router.post('/api/emulador/configurar', (req, res) => {
  const { confDir } = req.body;
  if (!confDir) return res.status(400).json({ error: 'confDir é obrigatório' });

  // Função auxiliar para descomentar linhas específicas em um arquivo
  function descomentarLinhas(filePath, linhas) {
    if (!fs.existsSync(filePath)) throw new Error(`Arquivo não encontrado: ${filePath}`);
    let conteudo = fs.readFileSync(filePath, 'utf8');
    linhas.forEach(linha => {
      // Regex para remover '//' no início da linha, considerando espaços antes
      // Escapa caracteres especiais da linha para evitar erros na regex
      const linhaEscapada = linha.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`^\\s*//\\s*${linhaEscapada}`, 'gm');
      conteudo = conteudo.replace(regex, linha);
    });
    fs.writeFileSync(filePath, conteudo, 'utf8');
  }

  try {
    // Descomenta linhas no map_athena.conf
    descomentarLinhas(path.join(confDir, 'map_athena.conf'), [
      'char_ip: 127.0.0.1',
      'map_ip: 127.0.0.1'
    ]);
    // Descomenta linhas no char_athena.conf
    descomentarLinhas(path.join(confDir, 'char_athena.conf'), [
      'login_ip: 127.0.0.1',
      'char_ip: 127.0.0.1'
    ]);
    res.json({ ok: true, message: 'Configurações aplicadas com sucesso' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;