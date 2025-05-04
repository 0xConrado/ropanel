const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function gerarSenhaAleatoria(tamanho = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|:;<>,.?/';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

function atualizarConf(confPath, userid, userpass) {
  if (!fs.existsSync(confPath)) return;
  let conf = fs.readFileSync(confPath, 'utf8');
  conf = conf.replace(/userid:.*$/m, `userid: ${userid}`);
  conf = conf.replace(/passwd:.*$/m, `passwd: ${userpass}`);
  fs.writeFileSync(confPath, conf, 'utf8');
}

router.post('/api/database/setup', async (req, res) => {
  const { tipoServidor, nomeBase, usuario, senha } = req.body;

  // Defina os arquivos SQL conforme o tipo de servidor
  const sqlDir = '/root/Emulador/rathena/sql-files';
  const arquivos = [
    { nome: 'main', arquivo: 'main.sql' },
    { nome: 'logs', arquivo: 'logs.sql' },
    { nome: 'item_db', arquivo: tipoServidor === 'RE' ? 'item_db_re.sql' : 'item_db.sql' },
    { nome: 'login', arquivo: 'login.sql' },
    // Adicione outros arquivos necessários aqui
  ];

  // Gere userid e userpass aleatórios
  const userid = gerarSenhaAleatoria(16);
  const userpass = gerarSenhaAleatoria(16);

  try {
    for (const { nome, arquivo } of arquivos) {
      const dbName = `${nomeBase}_${nome}`;
      // Cria o banco de dados
      await execPromise(`mysql -u${usuario} -p${senha} -e "CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\`;"`);
      // Importa o arquivo SQL
      await execPromise(`mysql -u${usuario} -p${senha} ${dbName} < ${sqlDir}/${arquivo}`);
    }

    // Atualiza o login do account_id 1 no banco de dados de login
    await execPromise(`mysql -u${usuario} -p${senha} ${nomeBase}_login -e "UPDATE login SET userid='${userid}', user_pass='${userpass}' WHERE account_id=1;"`);

    // Atualiza os arquivos de configuração do emulador
    // Altere os caminhos abaixo se necessário!
    const confDir = '/root/Emulador/rathena/conf';
    atualizarConf(path.join(confDir, 'char_athena.conf'), userid, userpass);
    atualizarConf(path.join(confDir, 'map_athena.conf'), userid, userpass);

    res.json({
      ok: true,
      message: 'Bancos criados, SQLs importados e login do emulador atualizado com sucesso!',
      userid,
      userpass
    });
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