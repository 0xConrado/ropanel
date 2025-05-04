const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { updateConfFile } = require('../utils/updateConfFile');
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

// Função utilitária para usar exec com async/await
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

router.post('/api/database/setup', async (req, res) => {
  const { tipoServidor, nomeBase, usuario, senha } = req.body;

  // Defina os arquivos SQL conforme o tipo de servidor
  const sqlDir = '/root/Emulador/rathena/sql-files';
  const arquivos = [
    { nome: 'main', arquivo: 'main.sql' },
    { nome: 'logs', arquivo: 'logs.sql' },
    { nome: 'item_db', arquivo: tipoServidor === 'RE' ? 'item_db_re.sql' : 'item_db.sql' }
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

    // Atualiza o login do account_id 1 no banco de dados main
    await execPromise(`mysql -u${usuario} -p${senha} ${nomeBase}_main -e "UPDATE login SET userid='${userid}', user_pass='${userpass}' WHERE account_id=1;"`);

    // Atualiza os arquivos de configuração do emulador
    const confDir = '/root/Emulador/rathena/conf';
    atualizarConf(path.join(confDir, 'char_athena.conf'), userid, userpass);
    atualizarConf(path.join(confDir, 'map_athena.conf'), userid, userpass);

    // --- ATUALIZA O inter_athena.conf ---
    const interConfPath = path.join(confDir, 'inter_athena.conf');
    const confData = {
      // IPs
      login_server_ip: req.body.host,
      ipban_db_ip: req.body.host,
      char_server_ip: req.body.host,
      map_server_ip: req.body.host,
      web_server_ip: req.body.host,
      log_db_ip: req.body.host,
      // Usuários
      login_server_id: req.body.usuario,
      ipban_db_id: req.body.usuario,
      char_server_id: req.body.usuario,
      map_server_id: req.body.usuario,
      web_server_id: req.body.usuario,
      log_db_id: req.body.usuario,
      // Senhas
      login_server_pw: req.body.senha,
      ipban_db_pw: req.body.senha,
      char_server_pw: req.body.senha,
      map_server_pw: req.body.senha,
      web_server_pw: req.body.senha,
      log_db_pw: req.body.senha,
      // Database _main
      login_server_db: req.body.nomeBase + '_main',
      ipban_db_db: req.body.nomeBase + '_main',
      char_server_db: req.body.nomeBase + '_main',
      map_server_db: req.body.nomeBase + '_main',
      web_server_db: req.body.nomeBase + '_main',
      // Database _log
      log_db_db: req.body.nomeBase + '_log'
    };
    updateConfFile(interConfPath, confData);

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

module.exports = router;