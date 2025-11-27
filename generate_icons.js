const fs = require('fs');
const path = require('path');
// const { createCanvas } = require('canvas'); // Removido

// Como não posso garantir 'canvas', vou criar SVGs e salvar como arquivos, 
// mas o manifesto pede PNG. 
// Vou tentar uma abordagem diferente: copiar um ícone genérico se existir, 
// ou criar um SVG e pedir para o usuário converter, mas isso é ruim.

// Vou criar um SVG simples para cada tamanho e salvar como .svg, 
// e atualizar o manifest para aceitar SVG se possível, ou apenas criar arquivos vazios para parar o erro 404 (embora não mostre ícone).

// Melhor: Vou criar SVGs na pasta icons. Navegadores modernos aceitam SVG no manifesto.
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

sizes.forEach(size => {
    const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size / 3}" fill="white" text-anchor="middle" dy=".3em">DM</text>
</svg>`;

    // Salvar como .svg
    fs.writeFileSync(path.join(iconDir, `icon-${size}x${size}.svg`), svgContent);
    console.log(`Criado icon-${size}x${size}.svg`);
});

console.log('Ícones SVG criados. Atualize o manifest.webmanifest para usar .svg ou converta para .png');
