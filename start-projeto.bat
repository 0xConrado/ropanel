@echo off
REM Inicia o backend (server.js)
start cmd /k "cd /d C:\ropanel\server && npm install && node server.js"

REM Inicia o Tailwind CLI (ajuste o caminho se necessário)
start cmd /k "cd /d C:\ropanel && tailwindcss.exe -i ./src/index.css -o ./src/output.css --watch"

REM Inicia o frontend (Vite)
start cmd /k "cd /d C:\ropanel && npm install && npm run dev"