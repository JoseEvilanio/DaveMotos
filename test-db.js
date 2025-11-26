import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'moto',
  user: 'postgres',
  password: 'N1e2t3o4@2106'
});

async function testDatabase() {
  try {
    // Testar conexão
    console.log('Testando conexão...');
    await pool.query('SELECT 1');
    console.log('✓ Conexão OK');

    // Verificar se tabela users existe
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('✗ Tabela users NÃO existe!');
      console.log('Execute o script: .\\executar-schema.ps1');
    } else {
      console.log('✓ Tabela users existe');
      
      // Verificar colunas
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      console.log('\nColunas da tabela users:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      // Testar inserção
      console.log('\nTestando inserção de usuário...');
      const hashedPassword = await bcrypt.hash('teste123', 10);
      
      try {
        await pool.query(`
          INSERT INTO users (email, encrypted_password, full_name, phone, role, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, ['teste@teste.com', hashedPassword, 'Teste Usuario', '11999999999', 'atendente', true]);
        console.log('✓ Inserção OK');
        
        // Limpar teste
        await pool.query('DELETE FROM users WHERE email = $1', ['teste@teste.com']);
        console.log('✓ Teste concluído com sucesso!');
      } catch (insertError) {
        console.error('✗ Erro ao inserir:', insertError.message);
      }
    }
  } catch (error) {
    console.error('✗ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
