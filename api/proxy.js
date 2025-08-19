<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2575.7">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px 'Songti SC'; -webkit-text-stroke: #000000}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px 'Songti SC'; -webkit-text-stroke: #000000; min-height: 17.0px}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1">export default async function handler(req, res) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>// 仅允许 POST 请求</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (req.method !== 'POST') {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return res.status(405).json({ message: 'Method Not Allowed' });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>// 从请求体中获取 API Key</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const { apiKey } = req.body;</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!apiKey) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return res.status(400).json({ message: 'API Key is required' });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>try {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>// 服务器端发起对目标 API 的请求</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const apiResponse = await fetch('https://globalai.vip/api/user/self', {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>method: 'GET',</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>headers: {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'Authorization': `Bearer ${apiKey}`,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'Content-Type': 'application/json'</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>// 如果目标服务器返回未授权，则透传错误</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (apiResponse.status === 401) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>return res.status(401).json({ message: 'API Key 无效或错误，请检查。' });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (!apiResponse.ok) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>throw new Error(`Upstream server error, status: ${apiResponse.status}`);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const data = await apiResponse.json();</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>// 成功后将目标服务器返回的数据原样返回给前端</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>res.status(200).json(data);</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>} catch (error) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>res.status(500).json({ message: error.message || 'An internal server error occurred.' });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1">}</span></p>
</body>
</html>
