const express = require('express');
const app = express();
const path = require('path');

// Serve arquivos estáticos da raiz do projeto
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); 
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${5173}`);
});
