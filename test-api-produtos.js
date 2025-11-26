async function testProdutosAPI() {
  try {
    console.log('Testando GET /api/produtos...')
    
    const response = await fetch('http://localhost:3001/api/produtos')
    
    console.log('Status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na resposta:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✓ Sucesso!')
    console.log(`Produtos encontrados: ${data.length}`)
    
    if (data.length > 0) {
      console.log('\nPrimeiro produto:')
      console.log(JSON.stringify(data[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
  }
}

testProdutosAPI()
