const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/api/database/setup', async (req, res) => {
  const { tipoServidor, nomeBase, usuario, senha } = req.body;

  // Defina os arquivos SQL conforme o tipo de servidor
  const sqlDir = '/root/Emulador/rathena/sql-files';
  const arquivos = [
    { nome: 'main', arquivo: 'main.sql' },
    { nome: 'logs', arquivo: 'logs.sql' },
    { nome: 'item_db', arquivo: tipoServidor === 'RE' ? 'item_db_re.sql' : 'item_db.sql' },
    // Adicione outros arquivos necessários aqui
  ];

  try {
    for (const { nome, arquivo } of arquivos) {
      const dbName = `${nomeBase}_${nome}`;
      // Cria o banco de dados
      await execPromise(`mysql -u${usuario} -p${senha} -e "CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\`;"`);
      // Importa o arquivo SQL
      await execPromise(`mysql -u${usuario} -p${senha} ${dbName} < ${sqlDir}/${arquivo}`);
    }
    res.json({ ok: true, message: 'Bancos criados e SQLs importados com sucesso!' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.toString() });
  }
});

// Função utilitária para usar exec com async/await
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

module.exports = router;