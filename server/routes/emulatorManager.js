const express = require('express');
const router = express.Router();
const emulatorController = require('../utils/emulatorController');

router.get('/status', (req, res) => {
  res.json({
    login: emulatorController.getStatus('login'),
    char: emulatorController.getStatus('char'),
    map: emulatorController.getStatus('map'),
  });
});

router.get('/logs/:server', (req, res) => {
  const server = req.params.server;
  if (!['login', 'char', 'map'].includes(server)) {
    return res.status(400).json({ error: 'Servidor inválido' });
  }
  res.json({ logs: emulatorController.getLogs(server) });
});

router.post('/start/:server', (req, res) => {
  const server = req.params.server;
  let started = false;
  switch (server) {
    case 'login':
      started = emulatorController.startLoginServer();
      break;
    case 'char':
      started = emulatorController.startCharServer();
      break;
    case 'map':
      started = emulatorController.startMapServer();
      break;
    default:
      return res.status(400).json({ error: 'Servidor inválido' });
  }
  if (started) res.json({ success: true, message: `${server} iniciado` });
  else res.status(400).json({ error: `${server} já está rodando` });
});

router.post('/stop/:server', (req, res) => {
  const server = req.params.server;
  const stopped = emulatorController.stopProcess(server);
  if (stopped) res.json({ success: true, message: `${server} parado` });
  else res.status(400).json({ error: `${server} não está rodando` });
});

router.post('/stopAll', (req, res) => {
  emulatorController.stopAll();
  res.json({ success: true, message: 'Todos os servidores parados' });
});

router.post('/compile', async (req, res) => {
  try {
    const msg = await emulatorController.compile();
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

router.post('/recompile', async (req, res) => {
  try {
    const msg = await emulatorController.recompile();
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;