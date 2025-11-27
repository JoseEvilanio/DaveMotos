const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function getEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env')
        if (!fs.existsSync(envPath)) return {}

        const envContent = fs.readFileSync(envPath, 'utf-8')
        const env = {}
        envContent.split('\n').forEach(line => {
            const parts = line.split('=')
            if (parts.length >= 2) {
                const key = parts[0].trim()
                const value = parts.slice(1).join('=').trim()
                if (key && !key.startsWith('#')) {
                    env[key] = value
                }
            }
        })
        return env
    } catch (e) {
        return {}
    }
}

const env = getEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

console.log('--- DIAGNÓSTICO DE CONEXÃO SUPABASE ---')
console.log(`URL Configurada: ${supabaseUrl}`)
// Mostra apenas os primeiros caracteres da chave para segurança
console.log(`Chave Configurada: ${supabaseKey ? (supabaseKey.substring(0, 10) + '...') : 'NÃO ENCONTRADA'}`)

if (!supabaseUrl || supabaseUrl.includes('seu-projeto.supabase.co')) {
    console.error('\n❌ ERRO CRÍTICO: Você ainda não configurou o arquivo .env!')
    console.error('O sistema está tentando conectar em "seu-projeto.supabase.co" que é um exemplo.')
    console.error('\nSOLUÇÃO:')
    console.error('1. Abra o arquivo .env')
    console.error('2. Substitua "https://seu-projeto.supabase.co" pela URL do SEU projeto Supabase')
    console.error('3. Substitua a chave anon pela SUA chave anon')
    process.exit(1)
}

console.log('\nTentando conectar ao Supabase...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        const { data, error } = await supabase.from('clientes').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('\n❌ Falha na conexão:')
            console.error(error.message)
            if (error.code === 'PGRST301') {
                console.error('Dica: Verifique se o RLS (Row Level Security) está permitindo leitura.')
            }
        } else {
            console.log('\n✅ CONEXÃO BEM SUCEDIDA!')
            console.log('O Supabase está acessível e respondendo.')
        }
    } catch (err) {
        console.error('\n❌ Erro de rede ou configuração:')
        console.error(err.message)
    }
}

testConnection()
