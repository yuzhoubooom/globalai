export default async function handler(req, res) {
  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 从请求体中获取 API Key
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: 'API Key is required' });
  }

  try {
    // 服务器端发起对目标 API 的请求
    const apiResponse = await fetch('https://globalai.vip/api/user/self', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // 如果目标服务器返回未授权，则透传错误
    if (apiResponse.status === 401) {
      return res.status(401).json({ message: 'API Key 无效或错误，请检查。' });
    }

    if (!apiResponse.ok) {
      throw new Error(`Upstream server error, status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // 成功后将目标服务器返回的数据原样返回给前端
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message || 'An internal server error occurred.' });
  }
}
