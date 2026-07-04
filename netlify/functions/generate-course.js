const fallbackCourseReview = (course) => ({
  title: course,
  progress: 40,
  focus: `${course} 的核心概念、常见题型、课堂笔记和错题整理`,
  plan: `先把 ${course} 的章节目录拆成 3-5 个模块，再按“知识点、例题、错题、总结”推进复习。`,
  checklist: ['章节梳理', '典型例题', '错题复盘'],
  source: 'fallback',
});

function normalizeCourseReview(course, review, source) {
  const fallback = fallbackCourseReview(course);
  const progress = Number(review?.progress);

  return {
    title: course,
    progress: Number.isFinite(progress) ? Math.min(100, Math.max(0, Math.round(progress))) : fallback.progress,
    focus: typeof review?.focus === 'string' && review.focus.trim() ? review.focus.trim() : fallback.focus,
    plan: typeof review?.plan === 'string' && review.plan.trim() ? review.plan.trim() : fallback.plan,
    checklist: Array.isArray(review?.checklist) && review.checklist.length
      ? review.checklist.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
      : fallback.checklist,
    source,
  };
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

  if (!course) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Course is required' }),
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackCourseReview(course)),
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
            content: '你是大学课程复习助手。只输出严格 JSON，不要 Markdown，不要额外解释。',
          },
          {
            role: 'user',
            content: `请为大学课程“${course}”生成个人复习面板。JSON 格式必须是：{"progress":40,"focus":"复习重点","plan":"复习建议","checklist":["清单1","清单2","清单3"]}。内容要具体，适合大学生复习。`,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify(fallbackCourseReview(course)),
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify(normalizeCourseReview(course, parsed, 'ai')),
    };
  } catch (error) {
    console.error('DeepSeek course review generation failed:', error);
    return {
      statusCode: 200,
      body: JSON.stringify(fallbackCourseReview(course)),
    };
  }
}
