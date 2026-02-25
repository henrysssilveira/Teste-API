const express = require('express');
const multer = require('multer');
const puppeteer = require('puppeteer');

const app = express();
const porta = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

// Rota GET: Interface gráfica para testes manuais
app.get('/', (req, res) => {
    const htmlInterface = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teste de Conversão HTML para PDF</title>
            <style>
                body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; color: #333; }
                .container { border: 1px solid #e2e8f0; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                input[type="file"] { margin: 1rem 0; display: block; }
                button { background-color: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: bold; }
                button:hover { background-color: #1d4ed8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Ferramenta de Conversão: HTML para PDF</h2>
                <p>Selecione um arquivo HTML local para realizar o teste de conversão.</p>
                <form action="/converter-para-pdf" method="POST" enctype="multipart/form-data">
                    <input type="file" name="arquivoHtml" accept=".html" required>
                    <button type="submit">Converter Documento</button>
                </form>
            </div>
        </body>
        </html>
    `;
    res.send(htmlInterface);
});

// Rota POST: Lógica de recebimento do arquivo e conversão via Puppeteer
app.post('/converter-para-pdf', upload.single('arquivoHtml'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo HTML foi submetido.' });
    }

    let navegador;
    try {
        const conteudoHtml = req.file.buffer.toString('utf-8');

        // Configurações essenciais para ambientes de nuvem restritos
        navegador = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ] 
        });
        
        const pagina = await navegador.newPage();
        await pagina.setContent(conteudoHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await pagina.pdf({ 
            format: 'A4', 
            printBackground: true 
        });

        await navegador.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="documento_convertido.pdf"');
        res.send(pdfBuffer);

    } catch (erro) {
        if (navegador) await navegador.close();
        console.error('Falha crítica durante a conversão:', erro);
        res.status(500).json({ erro: 'Falha interna no processamento do documento.' });
    }
});

app.listen(porta, () => {
    console.log(`Serviço inicializado e operando devidamente na porta ${porta}.`);
});