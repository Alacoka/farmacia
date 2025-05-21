// src/server.ts
import express from 'express';
import App from './App';

const app = express();
const port = 3001;

app.get('/', (_req, res) => {
    res.send('Servidor está rodando!');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
export default App;