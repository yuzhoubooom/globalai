import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 从请求中获取用户输入的具体API Key
  const userApiKey = req.headers['authorization']?.split(' ')[1];
  if (!userApiKey) {
    return res.status(401).json({ error: '未提供API Key' });
  }

  // 从环境变量中获取API基础URL
  const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '');
  if (!API_BASE_URL) {
    return res.status(500).json({ error: '系统错误：后端服务器未配置API_BASE_URL' });
  }

  // 【已确认】这是根据您的截图最终确认的API路径
  const listKeysUrl = `${API_BASE_URL}/api/token/`; 

  try {
    // 使用用户API Key进行认证，并请求该账户下所有的Key清单
    const response = await fetch(listKeysUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userApiKey}`, // 使用用户输入的Key进行认证
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`连接API服务器失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data || !Array.isArray(result.data.items)) {
      throw new Error('API返回的额度数据格式不正确: ' + (result.message || '未知错误'));
    }

    // 在返回的Key清单中，查找与用户输入Key完全匹配的那一项
    // API返回的key不带'sk-'前缀，所以我们要去掉输入的key的'sk-'前缀再对比
    const keyToFind = userApiKey.startsWith('sk-') ? userApiKey.substring(3) : userApiKey;
    const targetKeyInfo = result.data.items.find(item => item.key === keyToFind);

    if (!targetKeyInfo) {
      throw new Error('验证成功，但在您的账户下未找到该API Key的详细额度信息。');
    }

    // 从找到的Key信息中，提取额度数据
    const remainingQuotaPoints = targetKeyInfo.unlimited_quota ? 999999999999 : (targetKeyInfo.remain_quota || 0);
    const usedQuotaPoints = targetKeyInfo.used_quota || 0;
    
    // 换算比例：500,000 点 = 1 美元
    const CONVERSION_RATE = 500000;

    // 计算额度（单位：美元）
    let totalGranted, totalAvailable;
    if (targetKeyInfo.unlimited_quota) {
        totalGranted = Infinity;
        totalAvailable = Infinity;
    } else {
        totalGranted = (remainingQuotaPoints + usedQuotaPoints) / CONVERSION_RATE;
        totalAvailable = remainingQuotaPoints / CONVERSION_RATE;
    }
    const totalUsed = usedQuotaPoints / CONVERSION_RATE;

    // 返回与前端兼容的最终结果
    res.status(200).json({
      total_granted: totalGranted,
      total_used: totalUsed,
      total_available: totalAvailable,
    });

  } catch (error) {
    // 返回清晰的错误信息给前端
    console.error('后端处理时发生错误:', error);
    res.status(500).json({ error: error.message });
  }
}

