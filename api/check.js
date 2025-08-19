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
    return res.status(500).json({ error: '后端服务器未配置API_BASE_URL' });
  }

  // 【请在这里确认】这是获取Key清单的API路径，请根据您的发现修改！
  // 我猜测是 /api/token，如果不对请替换。
  const listKeysUrl = `${API_BASE_URL}/api/token`; 

  try {
    // 使用用户提供的Key去请求Key清单
    const response = await fetch(listKeysUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userApiKey}`, // 用用户的Key进行认证
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`请求目标服务器失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data || !result.data.items) {
      throw new Error('API返回错误或数据格式不正确: ' + (result.message || '未知错误'));
    }

    // 在返回的Key清单中，查找与用户输入Key匹配的那一项
    // 注意：这里我们用 `startsWith` 来匹配，因为通常输入的完整Key会以 "sk-" 开头
    const userKeyPrefix = userApiKey.startsWith('sk-') ? userApiKey.substring(3) : userApiKey;
    const targetKeyInfo = result.data.items.find(item => item.key === userKeyPrefix);

    if (!targetKeyInfo) {
      throw new Error('未在您的账户下找到该API Key的信息。');
    }

    // 从找到的Key信息中，提取额度数据
    // 如果是无限额度，则剩余额度设为极大值，否则使用remain_quota
    const remainingQuotaPoints = targetKeyInfo.unlimited_quota ? 999999999999 : (targetKeyInfo.remain_quota || 0);
    const usedQuotaPoints = targetKeyInfo.used_quota || 0;
    
    // 定义换算比例：500,000点 = 1美元
    const CONVERSION_RATE = 500000;

    // 计算总额度、已使用额度和剩余额度（单位：美元）
    // 对于无限额度的Key，总额度和剩余额度可以视为无穷大
    let totalGranted, totalAvailable;
    if (targetKeyInfo.unlimited_quota) {
        totalGranted = Infinity;
        totalAvailable = Infinity;
    } else {
        totalGranted = (remainingQuotaPoints + usedQuotaPoints) / CONVERSION_RATE;
        totalAvailable = remainingQuotaPoints / CONVERSION_RATE;
    }
    
    const totalUsed = usedQuotaPoints / CONVERSION_RATE;

    // 返回最终结果
    res.status(200).json({
      total_granted: totalGranted,
      total_used: totalUsed,
      total_available: totalAvailable,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
