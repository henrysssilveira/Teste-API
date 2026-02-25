const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Esta é a sua rota de GET
app.get('/api/teste', (req, res) => {
  res.json({
    mensagem: "Olá! Sua primeira API está funcionando com sucesso!",
    status: "online",
    timestamp: new Date()
  });
});

// Rota raiz (página inicial)
app.get('/', (req, res) => {
  res.send("O servidor está de pé! Acesse /api/teste para ver os dados.");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});