import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

// Serve os arquivos estáticos do React build
app.use(express.static(path.join(__dirname, '../dist')));

// Para qualquer outra rota, envia o index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
