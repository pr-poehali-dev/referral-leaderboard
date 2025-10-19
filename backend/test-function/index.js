/**
 * Business: Тестовая функция для проверки работы бэкенда
 * Args: event с httpMethod, queryStringParameters; context с requestId
 * Returns: HTTP response с приветствием и информацией о запросе
 */

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters } = event;
  const requestId = context.requestId;
  
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      body: '',
      isBase64Encoded: false
    };
  }
  
  if (httpMethod === 'GET') {
    const name = queryStringParameters?.name || 'Мир';
    const timestamp = new Date().toISOString();
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: false,
      body: JSON.stringify({
        message: `Привет, ${name}! 👋`,
        timestamp,
        requestId,
        status: 'success'
      })
    };
  }
  
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    isBase64Encoded: false,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
