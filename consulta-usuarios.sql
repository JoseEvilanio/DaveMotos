-- Consulta completa de usuarios
\echo '=================================='
\echo 'TODOS OS USUARIOS NO BANCO'
\echo '=================================='
\echo ''

SELECT 
    email,
    full_name as nome,
    phone as telefone,
    role as funcao,
    is_active as ativo,
    created_at as criado_em
FROM users 
ORDER BY created_at DESC;

\echo ''
\echo 'Total de usuarios:'
SELECT COUNT(*) as total FROM users;
