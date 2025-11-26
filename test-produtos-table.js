import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'moto',
  user: 'postgres',
  password: 'N1e2t3o4@2106',
})

async function testProdutosTable() {
  try {
    console.log('Verificando tabela produtos...')
    
    // Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos'
      );
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela produtos NÃO existe!')
      console.log('Execute o schema.sql para criar as tabelas.')
      return
    }
    
    console.log('✓ Tabela produtos existe')
    
    // Verificar colunas
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'produtos'
      ORDER BY ordinal_position;
    `)
    
    console.log('\nColunas da tabela produtos:')
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Tentar fazer uma query simples
    console.log('\nTestando query SELECT...')
    const result = await pool.query(`
      SELECT p.*, c.nome as categoria_nome
       FROM produtos p
       LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
       WHERE p.is_active = true 
       ORDER BY p.nome
    `)
    
    console.log(`✓ Query executada com sucesso! ${result.rows.length} produtos encontrados.`)
    
    if (result.rows.length > 0) {
      console.log('\nPrimeiro produto:')
      console.log(result.rows[0])
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('Detalhes:', error)
  } finally {
    await pool.end()
  }
}

testProdutosTable()
