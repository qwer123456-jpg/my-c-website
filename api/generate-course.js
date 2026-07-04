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

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const course = String(request.body?.course || '').trim();

  if (!course) {
    response.status(400).json({ error: 'Course is required' });
    return;
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    response.status(200).json(fallbackCourseReview(course));
    return;
  }

  try {
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
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

    if (!deepseekResponse.ok) {
      response.status(200).json(fallbackCourseReview(course));
      return;
    }

    const data = await deepseekResponse.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    response.status(200).json(normalizeCourseReview(course, parsed, 'ai'));
  } catch {
    response.status(200).json(fallbackCourseReview(course));
  }
}
