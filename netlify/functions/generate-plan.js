const fallbackPlan = (course, duration) => ({
  direction: course,
  duration,
  source: 'fallback',
  createdAt: new Date().toISOString(),
  days: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    content: `${course} 第 ${index + 1} 天核心内容复习`,
    practice: `完成 ${course} 相关练习 ${index + 1} 组，并标记不熟悉的题目。`,
    review: `用 10 分钟复盘 ${course} 今日薄弱点，写下明天要补的内容。`,
  })),
});

function extractText(data) {
  if (typeof data.output_text === 'string') return data.output_text;

  const firstText = data.output
    ?.flatMap((item) => item.content ?? [])
    ?.find((content) => content.type === 'output_text' || content.type === 'text');

  return firstText?.text ?? '';
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const course = String(payload.course || '').trim();
  const duration = String(payload.duration || '1小时').trim();

  if (!course) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Course is required' }),
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackPlan(course, duration)),
    };
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content:
              '你是大学生学习规划助手。只输出严格 JSON，不要 Markdown，不要额外解释。',
          },
          {
            role: 'user',
            content: `请为大学课程“${course}”生成 7 天学习计划。每天学习时长是“${duration}”。JSON 格式必须是：{"days":[{"day":1,"content":"学习内容","practice":"练习任务","review":"复盘任务"}]}。内容要具体、适合大学生复习。`,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('DeepSeek API error:', detail);
      return {
        statusCode: 200,
        body: JSON.stringify(fallbackPlan(course, duration)),
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || extractText(data);
    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify({
        direction: course,
        duration,
        source: 'ai',
        createdAt: new Date().toISOString(),
        days: parsed.days,
      }),
    };
  } catch (error) {
    console.error('DeepSeek plan generation failed:', error);
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackPlan(course, duration)),
    };
  }
}
