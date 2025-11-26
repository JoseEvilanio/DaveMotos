import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'moto',
  user: 'postgres',
  password: 'N1e2t3o4@2106'
});

async function verificarUsuarios() {
  try {
    const result = await pool.query(`
      SELECT id, email, full_name, phone, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('=================================');
    console.log(`Total de usuarios no banco: ${result.rows.length}`);
    console.log('=================================\n');
    
    if (result.rows.length === 0) {
      console.log('Nenhum usuario encontrado no banco!');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Nome: ${user.full_name}`);
        console.log(`   Telefone: ${user.phone || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Ativo: ${user.is_active ? 'Sim' : 'Nao'}`);
        console.log(`   Criado em: ${user.created_at}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Erro ao verificar usuarios:', error.message);
  } finally {
    await pool.end();
  }
}

verificarUsuarios();
