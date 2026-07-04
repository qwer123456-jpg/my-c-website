import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';

const todoStorageKey = 'student-study-toolbox.todos';
const planStorageKey = 'student-study-toolbox.study-plan';

const initialTodos = [
  { id: 'todo-1', text: '复习线性代数特征值与二次型', done: false },
  { id: 'todo-2', text: '整理 Python 数据处理笔记', done: true },
  { id: 'todo-3', text: '完成复变函数留数定理练习', done: false },
  { id: 'todo-4', text: '复盘常微分方程错题', done: false },
];

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'courses', label: '课程复习', icon: BookOpen },
  { id: 'planner', label: '学习计划', icon: CalendarDays },
  { id: 'todos', label: '待办清单', icon: ClipboardList },
  { id: 'portfolio', label: '作品展示', icon: BriefcaseBusiness },
];

const directionOptions = ['Python', '复变函数', '常微分方程', '线性代数', '英语四级'];
const durationOptions = ['30分钟', '1小时', '2小时', '3小时'];

const planTemplates = {
  Python: {
    content: ['语法与函数复习', '列表、字典与推导式', '文件读写与异常处理', 'NumPy 数组计算', 'pandas 数据清洗', 'matplotlib 可视化', '脚本封装与项目整理'],
    practice: ['写 3 个小函数', '处理一组学生成绩', '读取 CSV 并过滤数据', '完成矩阵统计计算', '清洗缺失值和重复值', '画折线图和柱状图', '封装一个自动化脚本'],
    review: ['记录常见语法错误', '总结容器选择原则', '复盘路径和编码问题', '整理数组维度概念', '写下清洗步骤模板', '保存图表参数模板', '归档脚本运行说明'],
  },
  复变函数: {
    content: ['复数运算与几何意义', '解析函数与 C-R 方程', '初等复函数', '复积分与柯西定理', '柯西积分公式', '级数与 Laurent 展开', '留数定理与积分应用'],
    practice: ['完成 5 道复数运算题', '判断 4 个函数解析性', '画出映射示意', '计算 2 道路径积分', '套用公式求导数', '展开 2 个 Laurent 级数', '用留数算 2 道积分'],
    review: ['总结模角表示', '记录 C-R 条件限制', '对比指数和三角函数', '复盘路径选择', '整理公式适用条件', '标注收敛域', '归纳极点类型'],
  },
  常微分方程: {
    content: ['一阶微分方程分类', '可分离变量方程', '一阶线性方程', '高阶线性方程', '常系数方程', '方程组与矩阵方法', '稳定性与综合复盘'],
    practice: ['分类 8 个方程', '求解 3 道分离变量题', '完成 2 道常数变易题', '求解齐次与非齐次题', '写特征方程解法', '解一个二维方程组', '完成一套综合练习'],
    review: ['建立分类表', '记录积分常数处理', '复盘通解结构', '整理特解设法', '总结根的不同情况', '标注矩阵指数思路', '整理错题原因'],
  },
  线性代数: {
    content: ['矩阵运算与初等变换', '行列式计算', '向量组线性相关', '线性方程组', '特征值与特征向量', '二次型标准化', '综合题型复盘'],
    practice: ['完成 6 道矩阵运算题', '计算 4 个行列式', '判断向量组相关性', '求解 3 个方程组', '完成 3 道特征值题', '化简 2 个二次型', '重做本周错题'],
    review: ['记录初等变换规则', '总结展开技巧', '整理秩的判断方法', '复盘解的结构', '归纳相似对角化条件', '标注正定判断方法', '整理公式清单'],
  },
  英语四级: {
    content: ['高频词汇与短语', '听力短对话训练', '长篇阅读定位', '仔细阅读题型', '翻译常用句式', '作文模板与表达', '整套模拟复盘'],
    practice: ['背诵 40 个高频词', '听 2 组短对话', '完成 1 篇匹配题', '完成 2 篇仔细阅读', '翻译 5 个句子', '写一篇短作文', '完成一套计时练习'],
    review: ['标记易混词', '记录听力关键词', '总结定位词', '分析错误选项', '整理句式替换', '优化开头结尾', '记录薄弱模块'],
  },
};

const courseCards = [
  {
    title: '复变函数',
    progress: 62,
    focus: '解析函数、柯西积分公式、留数定理',
    plan: '每天整理 2 道典型题，重点复盘路径积分和留数计算。',
    checklist: ['公式条件', '典型围道', '极点分类'],
  },
  {
    title: '常微分方程',
    progress: 55,
    focus: '一阶方程、线性方程组、稳定性',
    plan: '把解题方法按方程类型建立索引，形成考前速查表。',
    checklist: ['分离变量', '常数变易法', '相平面分析'],
  },
  {
    title: 'Python',
    progress: 78,
    focus: '数据处理、可视化、脚本自动化',
    plan: '用 pandas 重做一次数据清洗流程，并输出图表。',
    checklist: ['DataFrame', 'matplotlib', '脚本封装'],
  },
  {
    title: '线性代数',
    progress: 70,
    focus: '矩阵运算、特征值、二次型',
    plan: '用思维导图串联向量空间、矩阵分解和二次型化简。',
    checklist: ['行列式', '特征值', '正交变换'],
  },
];

const portfolioItems = [
  {
    title: '学习报告',
    category: '课程总结',
    description: '沉淀每周学习主题、错题反思和阶段复盘，形成可持续复习材料。',
    meta: '12 篇周报 · 4 门课程',
    details: ['每篇报告包含本周目标、完成情况和问题记录。', '重点整理复变函数、线性代数、Python 和常微分方程。', '适合期末前快速回看学习轨迹。'],
  },
  {
    title: '课程复习资料',
    category: '资料整理',
    description: '把重点公式、题型方法和错题原因放在一起，方便考前快速查阅。',
    meta: '4 个专题 · 持续更新',
    details: ['按课程拆分公式、题型、易错点三个模块。', '每个专题保留典型题入口和复盘提醒。', '后续可以继续加入 PDF、图片或外部链接。'],
  },
  {
    title: 'Python 小项目',
    category: '实践训练',
    description: '记录数据清洗、可视化和自动化脚本练习，展示学习过程和成果。',
    meta: '6 个练习 · 含图表',
    details: ['包含 CSV 清洗、成绩统计、图表生成等小练习。', '每个练习记录输入数据、处理步骤和输出结果。', '适合作为课程作业或简历素材的雏形。'],
  },
];

function loadTodos() {
  try {
    const saved = localStorage.getItem(todoStorageKey);
    return saved ? JSON.parse(saved) : initialTodos;
  } catch {
    return initialTodos;
  }
}

function loadSavedPlan() {
  try {
    const saved = localStorage.getItem(planStorageKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function App() {
  const savedPlan = loadSavedPlan();
  const [activePage, setActivePage] = useState('home');
  const [todos, setTodos] = useState(loadTodos);
  const [newTodo, setNewTodo] = useState('');
  const [planDirection, setPlanDirection] = useState('Python');
  const [dailyDuration, setDailyDuration] = useState('1小时');
  const [generatedPlan, setGeneratedPlan] = useState(savedPlan);
  const [planSaved, setPlanSaved] = useState(Boolean(savedPlan));

  useEffect(() => {
    localStorage.setItem(todoStorageKey, JSON.stringify(todos));
  }, [todos]);

  const completedCount = todos.filter((todo) => todo.done).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const todayTasks = useMemo(() => todos.filter((todo) => !todo.done).slice(0, 4), [todos]);
  const pageTitle = navItems.find((item) => item.id === activePage)?.label ?? '首页';

  function addTodo(event) {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;

    setTodos((currentTodos) => [
      { id: crypto.randomUUID(), text, done: false },
      ...currentTodos,
    ]);
    setNewTodo('');
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function generateStudyPlan() {
    const template = planTemplates[planDirection];
    const plan = {
      direction: planDirection,
      duration: dailyDuration,
      createdAt: new Date().toISOString(),
      days: Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        content: template.content[index],
        practice: template.practice[index],
        review: template.review[index],
      })),
    };

    setGeneratedPlan(plan);
    setPlanSaved(false);
  }

  function saveStudyPlan() {
    if (!generatedPlan) return;
    localStorage.setItem(planStorageKey, JSON.stringify(generatedPlan));
    setPlanSaved(true);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.24),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.22),transparent_26%),linear-gradient(180deg,#0f172a_0%,#f7f9fc_42%,#eef4f8_100%)]" />
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        {activePage === 'home' ? (
          <HomePage
            todos={todos}
            todayTasks={todayTasks}
            completedCount={completedCount}
            progress={progress}
            setActivePage={setActivePage}
          />
        ) : (
          <>
            <PageIntro title={pageTitle} />
            {activePage === 'courses' && <CoursesPage />}
            {activePage === 'planner' && (
              <StudyPlannerPage
                planDirection={planDirection}
                setPlanDirection={setPlanDirection}
                dailyDuration={dailyDuration}
                setDailyDuration={setDailyDuration}
                generatedPlan={generatedPlan}
                generateStudyPlan={generateStudyPlan}
                saveStudyPlan={saveStudyPlan}
                planSaved={planSaved}
              />
            )}
            {activePage === 'todos' && (
              <TodosPage
                todos={todos}
                newTodo={newTodo}
                setNewTodo={setNewTodo}
                addTodo={addTodo}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
                completedCount={completedCount}
                progress={progress}
              />
            )}
            {activePage === 'portfolio' && <PortfolioPage />}
          </>
        )}
      </main>
    </div>
  );
}

function Header({ activePage, setActivePage }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/15 bg-slate-950/78 text-white shadow-[0_16px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="focus-ring group flex w-fit items-center gap-3 rounded-lg text-left"
          aria-label="返回首页"
        >
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-teal-300 to-sky-400 text-slate-950 shadow-[0_12px_30px_rgba(45,212,191,0.35)] transition duration-300 group-hover:scale-105">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold">学习工具箱</span>
            <span className="block text-xs font-medium text-slate-300">Study Toolbox</span>
          </span>
        </button>

        <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition duration-300 ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function PageIntro({ title }) {
  return (
    <section className="mb-6 rounded-lg border border-white/70 bg-white/88 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            简洁学习工作台
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            {title}
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          聚焦课程复习、计划生成、任务管理和成果整理，减少分散内容，让页面更轻。
        </p>
      </div>
    </section>
  );
}

function HomePage({ todos, todayTasks, completedCount, progress, setActivePage }) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg border border-white/15 bg-slate-950 px-5 py-8 text-white shadow-[0_28px_90px_rgba(2,6,23,0.36)] sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(45,212,191,0.35),transparent_30%),linear-gradient(135deg,rgba(59,130,246,0.3),transparent_45%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-teal-100 backdrop-blur">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              为大学生日常复习打造
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-normal sm:text-6xl">
              大学生学习工具箱
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              一个聚焦课程复习、学习计划、待办管理和作品整理的轻量学习网站，
              帮你把每天要学什么、练什么、复盘什么安排清楚。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setActivePage('planner')}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-200"
              >
                生成学习计划
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setActivePage('todos')}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/16"
              >
                管理今日任务
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
            <div className="rounded-lg bg-white p-5 text-slate-950 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-700">今日进度</p>
                  <p className="mt-1 text-3xl font-bold">{progress}%</p>
                </div>
                <CalendarCheck className="h-10 w-10 text-teal-500" aria-hidden="true" />
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-5 space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                      {todo.text}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    今日待办已清空，可以安排新的学习目标。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="总任务" value={todos.length} detail="浏览器本地保存" icon={ClipboardList} />
        <MetricCard label="已完成" value={completedCount} detail="保持学习节奏" icon={Check} />
        <MetricCard label="完成率" value={`${progress}%`} detail="今日学习进度" icon={TrendingUp} />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ['课程复习', '集中整理专业课重点、进度和清单。', BookOpen, 'courses'],
          ['学习计划', '按方向和每日时长生成 7 天行动计划。', CalendarDays, 'planner'],
          ['待办清单', '记录今天要完成的复习任务。', ClipboardList, 'todos'],
          ['作品展示', '把报告、资料和练习成果组合展示。', FileText, 'portfolio'],
        ].map(([title, detail, Icon, page]) => (
          <button
            key={title}
            type="button"
            onClick={() => setActivePage(page)}
            className="focus-ring group rounded-lg border border-white/70 bg-white/90 p-5 text-left shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-teal-100 to-sky-100 text-teal-700 transition duration-300 group-hover:scale-105">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="group rounded-lg border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-white transition duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function ProgressPanel({ progress, completedCount, total }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">学习进度</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">任务完成概览</h3>
        </div>
        <span className="text-2xl font-bold text-slate-950">{progress}%</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        已完成 {completedCount} 项，共 {total} 项。把任务拆小一些，更容易保持节奏。
      </p>
    </div>
  );
}

function CoursesPage() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {courseCards.map((course) => (
        <div key={course.title} className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-700">课程复习</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{course.title}</h2>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
              {course.progress}%
            </span>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">重点：{course.focus}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{course.plan}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {course.checklist.map((item) => (
              <span key={item} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function StudyPlannerPage({
  planDirection,
  setPlanDirection,
  dailyDuration,
  setDailyDuration,
  generatedPlan,
  generateStudyPlan,
  saveStudyPlan,
  planSaved,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-5">
        <div className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold text-teal-700">计划生成器</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">定制 7 天学习节奏</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            选择学习方向和每天可投入的时间，系统会生成包含学习内容、练习任务和复盘任务的 7 天计划。
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700">学习方向</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {directionOptions.map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => setPlanDirection(direction)}
                    className={`focus-ring rounded-lg border px-4 py-3 text-left text-sm font-semibold transition duration-300 ${
                      planDirection === direction
                        ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700'
                    }`}
                  >
                    {direction}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">每天学习时长</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {durationOptions.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setDailyDuration(duration)}
                    className={`focus-ring rounded-lg border px-4 py-3 text-center text-sm font-semibold transition duration-300 ${
                      dailyDuration === duration
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generateStudyPlan}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-300 to-sky-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              生成计划
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950 p-6 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-teal-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-teal-200">保存说明</p>
              <p className="mt-1 text-sm text-slate-300">计划会保存到当前浏览器的 localStorage。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">7 天学习计划</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {generatedPlan ? `${generatedPlan.direction} · ${generatedPlan.duration}/天` : '等待生成'}
            </h2>
          </div>
          <button
            type="button"
            onClick={saveStudyPlan}
            disabled={!generatedPlan}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {planSaved ? '已保存' : '保存计划'}
          </button>
        </div>

        {generatedPlan ? (
          <div className="mt-6 grid gap-4">
            {generatedPlan.days.map((item) => (
              <article
                key={item.day}
                className="rounded-lg border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Day {item.day}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{item.content}</h3>
                  </div>
                  <span className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    {generatedPlan.duration}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">练习任务</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.practice}</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">复盘任务</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.review}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              请选择方向和时长，然后点击“生成计划”。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TodosPage({
  todos,
  newTodo,
  setNewTodo,
  addTodo,
  toggleTodo,
  deleteTodo,
  completedCount,
  progress,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="space-y-5">
        <div className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold text-teal-700">新增任务</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">安排下一步学习</h2>
          <form className="mt-6 space-y-4" onSubmit={addTodo}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="todo-input">
              任务内容
            </label>
            <input
              id="todo-input"
              value={newTodo}
              onChange={(event) => setNewTodo(event.target.value)}
              placeholder="例如：完成 Python 数据可视化练习"
              className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-400"
            />
            <button
              type="submit"
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              添加任务
            </button>
          </form>
        </div>
        <ProgressPanel progress={progress} completedCount={completedCount} total={todos.length} />
      </div>

      <div className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">任务列表</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">本地保存的待办</h2>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {completedCount}/{todos.length} 已完成
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition duration-300 hover:border-teal-100 hover:bg-white hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={`focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-lg border text-sm transition ${
                    todo.done
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-teal-300'
                  }`}
                  aria-label={todo.done ? '标记为未完成' : '标记为已完成'}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
                <p
                  className={`min-w-0 flex-1 text-sm leading-6 ${
                    todo.done ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {todo.text}
                </p>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="删除任务"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              暂时没有任务。添加一个学习目标后会自动保存到浏览器。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PortfolioPage() {
  const [openItem, setOpenItem] = useState(null);

  return (
    <section className="grid gap-5 md:grid-cols-3">
      {portfolioItems.map((item) => (
        <div key={item.title} className="rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-sky-100 text-teal-700">
            <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold text-teal-700">{item.category}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{item.title}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            {item.meta}
          </p>
          <button
            type="button"
            onClick={() => setOpenItem(openItem === item.title ? null : item.title)}
            aria-expanded={openItem === item.title}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
          >
            {openItem === item.title ? '收起详情' : '查看详情'}
            <ChevronRight
              className={`h-4 w-4 transition ${openItem === item.title ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
          {openItem === item.title && (
            <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50/70 p-4">
              <p className="text-sm font-bold text-teal-800">详情内容</p>
              <ul className="mt-3 space-y-2">
                {item.details.map((detail) => (
                  <li key={detail} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export default App;
