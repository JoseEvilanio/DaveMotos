# 📦 GUIA DE INSTALAÇÃO DO PWA - OFICINA MOTO

Este guia explica como instalar e executar o sistema em outro computador.

---

## 📋 OPÇÕES DE INSTALAÇÃO

### **OPÇÃO 1: Servidor Web Simples (Recomendado)**

Esta é a forma mais fácil e rápida de usar o sistema em outro computador.

#### Passo 1: Copiar a pasta `dist`
1. Copie toda a pasta `dist` deste projeto para o outro computador
2. Você pode usar um pendrive, rede compartilhada ou qualquer método de transferência

#### Passo 2: Instalar um servidor web simples
No outro computador, instale o Node.js (se ainda não tiver):
- Baixe em: https://nodejs.org/
- Instale a versão LTS (recomendada)

#### Passo 3: Instalar o `serve`
Abra o terminal/prompt de comando e execute:
```bash
npm install -g serve
```

#### Passo 4: Executar o sistema
1. Navegue até a pasta `dist` copiada:
```bash
cd caminho/para/pasta/dist
```

2. Execute o servidor:
```bash
serve -s . -p 3000
```

3. Abra o navegador e acesse:
```
http://localhost:3000
```

---

### **OPÇÃO 2: Instalar como PWA (Progressive Web App)**

Depois de executar a Opção 1, você pode instalar o sistema como um aplicativo:

#### No Chrome/Edge:
1. Acesse `http://localhost:3000`
2. Clique no ícone de **instalação** (➕) na barra de endereços
3. Clique em "Instalar"
4. O sistema será instalado como um aplicativo nativo

#### Vantagens do PWA:
- ✅ Funciona offline (após primeira visita)
- ✅ Ícone na área de trabalho
- ✅ Abre em janela própria (sem barra do navegador)
- ✅ Atualizações automáticas

---

### **OPÇÃO 3: Servidor Web Profissional (Para Produção)**

Para uso em rede local ou servidor dedicado:

#### Usando NGINX (Windows):
1. Baixe NGINX: https://nginx.org/en/download.html
2. Extraia para `C:\nginx`
3. Copie a pasta `dist` para `C:\nginx\html\oficina`
4. Edite `C:\nginx\conf\nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root html/oficina;
        try_files $uri $uri/ /index.html;
    }
}
```
5. Execute `nginx.exe`
6. Acesse `http://localhost` ou `http://IP-DO-SERVIDOR`

#### Usando Apache (XAMPP):
1. Instale XAMPP: https://www.apachefriends.org/
2. Copie a pasta `dist` para `C:\xampp\htdocs\oficina`
3. Inicie o Apache pelo painel do XAMPP
4. Acesse `http://localhost/oficina`

---

## 🔧 CONFIGURAÇÃO DO BACKEND

**IMPORTANTE:** O sistema precisa se conectar ao backend (servidor Node.js).

### Se o backend estiver no mesmo computador:
- Não precisa fazer nada, já está configurado

### Se o backend estiver em outro computador:
1. Localize o arquivo `dist/assets/index-*.js` (o nome varia)
2. Abra com um editor de texto
3. Procure por `http://localhost:5000`
4. Substitua pelo IP do servidor backend: `http://192.168.1.X:5000`
5. Salve o arquivo

**OU** configure uma variável de ambiente antes do build:
```bash
# No computador original, antes de rodar npm run build
set VITE_API_URL=http://192.168.1.X:5000
npm run build
```

---

## 📱 ACESSO VIA REDE LOCAL

Para acessar de outros dispositivos na mesma rede:

1. Descubra o IP do computador servidor:
```bash
# Windows
ipconfig

# Procure por "Endereço IPv4" (ex: 192.168.1.100)
```

2. No servidor, execute com bind para todas as interfaces:
```bash
serve -s dist -p 3000 -l 0.0.0.0
```

3. Nos outros dispositivos, acesse:
```
http://192.168.1.100:3000
```

---

## 🔒 SEGURANÇA

### Para uso em produção:
- ✅ Use HTTPS (certificado SSL)
- ✅ Configure firewall adequadamente
- ✅ Use senhas fortes
- ✅ Mantenha backups regulares
- ✅ Atualize o sistema regularmente

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Erro: "Cannot GET /"
**Solução:** Use a flag `-s` no serve: `serve -s dist`

### Erro: "Failed to fetch"
**Solução:** Verifique se o backend está rodando e acessível

### PWA não aparece para instalar
**Solução:** 
- Certifique-se de estar usando HTTPS ou localhost
- Limpe o cache do navegador
- Verifique se o service worker está ativo (F12 > Application > Service Workers)

### Sistema não atualiza após mudanças
**Solução:**
- Limpe o cache do navegador (Ctrl + Shift + Delete)
- Desinstale e reinstale o PWA
- Force atualização (Ctrl + F5)

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas, consulte a documentação técnica ou entre em contato com o suporte.

---

**Versão do Sistema:** 2.0.0  
**Última Atualização:** 24/11/2025  
**Módulos Incluídos:** Gestão Completa + Módulo Fiscal Integrado
