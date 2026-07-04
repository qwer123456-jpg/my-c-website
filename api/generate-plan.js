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

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const course = String(request.body?.course || '').trim();
  const duration = String(request.body?.duration || '1小时').trim();

  if (!course) {
    response.status(400).json({ error: 'Course is required' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(200).json(fallbackPlan(course, duration));
    return;
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: [
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
      }),
    });

    if (!openaiResponse.ok) {
      response.status(200).json(fallbackPlan(course, duration));
      return;
    }

    const data = await openaiResponse.json();
    const parsed = JSON.parse(extractText(data));

    response.status(200).json({
      direction: course,
      duration,
      source: 'ai',
      createdAt: new Date().toISOString(),
      days: parsed.days,
    });
  } catch {
    response.status(200).json(fallbackPlan(course, duration));
  }
}
