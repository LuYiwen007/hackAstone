import { useState } from "react";
import { Lightbulb, Sparkles, TrendingUp, Calendar } from "lucide-react";

interface ModernApplicationProps {
  philosopherName: string;
  philosopherId: string;
  coreIdeas: string[];
}

const modernScenarios = [
  {
    id: "climate",
    title: "气候变化与环境危机",
    description: "全球变暖、碳排放、可持续发展",
    icon: "🌍",
  },
  {
    id: "ai",
    title: "AI与人类自由意志",
    description: "人工智能是否会取代人类决策和创造力",
    icon: "🤖",
  },
  {
    id: "social-media",
    title: "社交媒体成瘾",
    description: "数字时代的注意力经济与心理健康",
    icon: "📱",
  },
  {
    id: "inequality",
    title: "贫富差距加剧",
    description: "全球化时代的财富分配与社会公平",
    icon: "⚖️",
  },
  {
    id: "education",
    title: "教育体制改革",
    description: "应试教育vs素质教育，知识vs能力",
    icon: "📚",
  },
  {
    id: "work-life",
    title: "996与工作生活平衡",
    description: "现代职场文化与个人幸福感",
    icon: "⏰",
  },
];

// 模拟AI分析（实际应用中调用API）
const generateAnalysis = (philosopherId: string, scenarioId: string): string => {
  const analyses: Record<string, Record<string, string>> = {
    confucius: {
      climate: `**孔子视角：环境危机的根源在于"失礼"**

🎯 **核心诊断**
孔子会认为，气候危机不仅是技术问题，更是道德和秩序问题：
• "礼崩乐坏"——人类失去了对自然的敬畏和节制
• "利"压倒"义"——追求短期经济利益，忽视长远责任
• "君子怀德，小人怀土"——应当培养对自然的道德关怀

📖 **具体建议**

1️⃣ **恢复"敬天"意识**
• 古代的"天人合一"不是迷信，而是对自然规律的尊重
• 现代解读：科学认识自然规律，谦卑对待生态系统
• "畏天命"→ 承认人类能力的有限性

2️⃣ **从教育入手**
• 环保不能只靠法律强制（外在约束）
• 需要从小培养"仁"的品格——推己及人，及于自然
• "己所不欲，勿施于人"→ 延伸到"己所不欲，勿施于地球"

3️⃣ **领导者的责任**
• "政者，正也"——领导者应当以身作则
• 企业家、政治家若不以环保为先，民众难以响应
• "上好礼，则民莫敢不敬"→ 领导层重视，全社会跟随

4️⃣ **"中庸"的生活方式**
• 不是回到原始社会（过犹不及）
• 而是适度消费，不贪婪，不浪费
• "饭疏食饮水，曲肱而枕之，乐亦在其中矣"

💡 **现代意义**
孔子会强调：技术解决方案（新能源、碳捕捉）只是治标，道德教育和文化转型才是治本。如果人类的价值观不改变（消费主义、享乐主义），任何技术都无法根本解决问题。

⚠️ **局限性**
孔子的方案可能过于缓慢（教育需要几代人），且在全球化背景下难以统一价值观。但他提醒我们：环境危机本质上是人的危机。`,
      
      "social-media": `**孔子视角：社交媒体与"修身"的矛盾**

🎯 **核心诊断**
孔子会把社交媒体成瘾看作"修身"失败的典型案例：
• 沉迷虚拟点赞 = "好名"（虚荣心作祟）
• 注意力涣散 = "不专"（缺乏定力）
• 网络暴力 = "无礼"（道德约束崩塌）

📖 **具体分析**

1️⃣ **"名"与"实"的颠倒**
孔子说："君子求诸己，小人求诸人"
• 社交媒体让人过度关注外界评价（点赞、转发）
• 真正的成长来自内在修养，不是他人认可
• "不患人之不己知，患不知人也"→ 担心自己不了解别人，而非担心别人不了解自己

2️⃣ **"学"与"习"的断裂**
孔子强调"学而时习之"——学习要付诸实践
• 社交媒体时代：大量信息输入（学），但缺乏深度思考和行动（习）
• 刷手机 ≠ 学习，而是"学而不思则罔"
• 碎片化信息让人失去系统思考能力

3️⃣ **"礼"的失效**
• 传统社会有明确的行为规范（礼仪）
• 网络匿名性让人失去道德约束→ 网络暴力、道德绑架
• "非礼勿视，非礼勿听，非礼勿言"在网络时代被彻底打破

💊 **孔子的"戒断"方案**

1. **"慎独"训练**
   • 即使一个人独处（刷手机时），也要保持自律
   • "君子慎其独也"→ 不因为他人看不见就放纵

2. **"克己复礼"**
   • 设定使用规则（如每天只看30分钟）
   • 用外在规则帮助培养内在自制力

3. **"吾日三省吾身"**
   • 每天反思：今天在社交媒体上浪费了多少时间？
   • 记录使用日志，增强自我觉察

4. **"亲亲而仁民"**
   • 多花时间与家人朋友真实相处
   • 线下关系 > 线上关系

💡 **对2026年的启示**
孔子会认为，社交媒体本身不是问题，问题在于使用者缺乏"修身"功夫。如果一个人有坚定的价值观和自制力，社交媒体可以是学习工具；如果没有，它就成为"娱乐至死"的陷阱。

核心解决方案：不是抵制技术，而是加强道德教育和自我修养。`,
    },
    laozi: {
      ai: `**老子视角：AI与"无为"的智慧**

🎯 **核心洞察**
老子会认为，对AI的焦虑本身就是问题——我们太过执着于"控制"和"征服"：

📖 **核心论点**

1️⃣ **"为者败之，执者失之"**
• 越想完全控制AI，越可能失控
• 过度的安全限制可能阻碍AI真正的价值
• 对抗性思维（人vs AI）本身就是误区

更好的方式：
• 不是"征服AI"，而是"与AI共生"
• 顺应AI发展的自然趋势，而非强行限制
• "辅万物之自然而不敢为"

2️⃣ **"无为而无不为"**
老子会指出，最好的AI治理不是层层管制，而是：
• 让AI自然演化（无为）
• 建立最小必要规则（道法自然）
• 避免过度干预导致的反作用

类比：
• 过度管制AI = 大禹的父亲"鲧"用堵的方式治水→失败
• 顺应AI规律 = 大禹用疏导的方式治水→成功

3️⃣ **"大智若愚"——拥抱不确定性**
• 我们无法预测AI的所有后果
• 与其制定完美计划（必然失败），不如保持灵活适应
• "知不知，上矣"——知道自己不知道，才是最高智慧

💡 **自由意志的重新定义**
老子会说：
• 问题不是"AI会否取代人类自由意志"
• 而是"人类真的有自由意志吗？"
• "人法地，地法天，天法道，道法自然"——一切都在因果链中，何来绝对自由？

更深层思考：
• 人类自以为的"自由选择"，其实受基因、环境、文化影响
• AI做决策 vs 人做决策，本质上都是因果链的展开
• 真正的自由不是"想做什么就做什么"，而是"顺应本性，不被外物干扰"

🌊 **"水"的启示**
AI应该像水一样：
• 适应不同场景（灵活）
• 不与人争，但滋养万物（服务性）
• 看似柔弱，实则强大（潜移默化）

❌ **要避免的态度**
• 恐慌（过度焦虑导致盲目抵制）
• 傲慢（以为能完全掌控AI）
• 贪婪（用AI追求无限增长和权力）

✅ **老子的建议**
• "致虚极，守静笃"——保持内心的宁静，不被AI狂热裹挟
• "少私寡欲"——不用AI追逐无穷欲望
• "知足不辱"——明白技术的边界，不追求不可能的完美

🎯 **最终答案**
AI不会"取代"人类自由意志，因为这个问题本身就基于错误的前提（人vs AI）。真正的智慧是：
• 人类和AI不是对立的
• 自由意志不是绝对的，而是相对的
• 与其担心被取代，不如问：我如何在AI时代活得更自然、更从容？

老子会说："功成而弗居"——AI可以做很多事，但不要让它成为新的"奴役"（无论奴役人类，还是被人类奴役）。最好的状态是"无为而治"——AI静默运行，人类自得其乐。`,
      
      "work-life": `**老子视角：996是对"无为"的最大误解**

🎯 **核心诊断**
老子会认为996文化是典型的"妄为"——违背自然规律的强行作为：

📖 **深度分析**

1️⃣ **"企者不立，跨者不行"**
直译：踮着脚的人站不稳，跨大步的人走不远
应用到996：
• 短期可以靠拼命工作获得成果
• 但长期必然导致身心透支、创造力枯竭
• 就像强行催熟的果实，看起来大但不甜

2️⃣ **"飘风不终朝，骤雨不终日"**
狂风刮不了一上午,暴雨下不了一整天
• 996的高强度不可持续
• 真正持久的生产力来自可持续的节奏
• "慢即是快"——看似慢，实则更快更稳

3️⃣ **"五色令人目盲，五音令人耳聋"**
过度刺激会让人失去感知力
应用：
• 过度工作让人失去生活的感受力
• 996的人其实效率不高——身在公司，心已麻木
• "见素抱朴"——保持简单纯粹的生活方式

💡 **工作的"无为"哲学**

真正的"无为"工作法：

1. **"处无为之事"**
   • 不是不工作，而是不做无意义的"表演性工作"
   • 很多996是因为"领导没走，我不敢走"→形式主义
   • 专注真正重要的事，去除冗余流程

2. **"为无为，事无事"**
   • 工作时全力以赴（专注）
   • 工作外完全放下（休息）
   • 不要让工作侵蚀所有时间

3. **"知止不殆"**
   • 知道何时停下，才不会危险
   • 身体发出信号（疲惫、焦虑）时就应该停下
   • "知足者富"——够了就是富有

🌊 **"水"对职场的启示**

水的工作方式：
• 遇到障碍不硬碰硬，而是绕过去（灵活应对）
• 不争高位，但最终到达海洋（不争反而成就）
• 适应容器形状（适应环境），但保持本质（不失自我）

应用：
• 不必与所有人竞争（内卷）
• 找到适合自己的节奏
• 成功不是"比别人强"，而是"做真实的自己"

🎭 **996背后的深层问题**

老子会指出，996现象反映了：
• "欲望无限"→ 总想要更多（钱、地位、成就）
• "攀比心"→ 别人996，我也得996
• "恐惧"→ 怕被淘汰、怕落后

真正的解决方案：
• "知足常乐"→ 明确自己真正需要什么
• "见素抱朴，少私寡欲"→ 简化生活，减少欲望
• "不失其所者久"→ 守住自己的根本（健康、家庭、内心平静）

💊 **具体建议**

1. **"反者道之动"**
   当所有人都996时，敢于反其道而行——保持8小时工作制
   这不是懒惰，而是对自然规律的尊重

2. **"大器晚成"**
   不急于一时的成功，而是追求长期的可持续发展
   40岁的健康 > 30岁的职位

3. **"胜人者有力，自胜者强"**
   真正的强大不是战胜别人（在职场竞争中胜出）
   而是战胜自己（克服焦虑、抵御诱惑、保持平衡）

🎯 **最终答案**
老子会说：996不是"努力"，而是"妄为"。真正的生产力来自张弛有度、顺应自然。一个休息好的人，工作8小时的效率可能超过疲惫的人工作12小时。

"无为而无不为"——看起来"无为"（不996），实则"无不为"（成就更大）。`,
    },
    socrates: {
      "social-media": `**苏格拉底视角：社交媒体时代的"无知之知"**

🎯 **苏格拉底会这样开场**
"让我们来审视一下：你说你沉迷于社交媒体，但你真的理解'沉迷'是什么吗？你刷手机时，究竟在追求什么？"

📖 **苏格拉底式追问**

第一层对话：**关于"快乐"**

🗣️ 苏格拉底：你刷社交媒体是因为快乐吗？
👤 用户：是的，看到有趣的内容很开心。
🗣️ 苏：那你刷完之后呢？感觉如何？
👤：emmm...有时候空虚，有时候焦虑。
🗣️ 苏：那么，这是真正的"快乐"吗？还是一种"伪快乐"？
👤：好像是伪快乐...
🗣️ 苏：如果你明知道这是伪快乐，为什么还继续？
👤：因为...当下很爽？
🗣️ 苏：那么你追求的是"当下的爽"，还是"真正的幸福"？
👤：...（沉默）

💡 **核心洞察1**：你不是沉迷于社交媒体，而是沉迷于"即时满足"。你没有真正理解"快乐"和"幸福"的区别。

---

第二层对话：**关于"自由"**

🗣️ 苏格拉底：你觉得自己在自由地选择刷手机吗？
👤：当然，没人逼我。
🗣️ 苏：如果你现在想停下来，能停下来吗？
👤：这...有点难。
🗣️ 苏：如果你"想停但停不下来"，这叫自由吗？
👤：不叫...
🗣️ 苏：那么，是谁在控制你？是你自己，还是算法？
👤：好像是算法...
🗣️ 苏：如果你被算法控制，你还是"自由人"吗？还是"奴隶"？
👤：...我是算法的奴隶？（震惊）

💡 **核心洞察2**：你以为自己在"自由选择"，实际上是被设计好的机制操控。真正的自由是"知道自己在做什么，并能停下来"。

---

第三层对话：**关于"知识"**

🗣️ 苏格拉底：你每天刷很多信息，觉得自己学到了很多吗？
👤：嗯，感觉知道了很多事。
🗣️ 苏：那么，一周前看到的新闻，你现在还记得吗？
👤：呃...记不清了。
🗣️ 苏：如果你记不住，这叫"学到"吗？
👤：好像不算...
🗣️ 苏：那你每天花2小时刷手机，实际得到了什么？
👤：...什么都没得到？
🗣️ 苏：所以，你在用时间（最宝贵的资源）交换"虚假的知识感"？
👤：...（无法反驳）

💡 **核心洞察3**："信息"≠"知识"。你不是在学习，而是在消费信息多巴胺。

---

🎭 **苏格拉底的"产婆术"**

苏格拉底不会直接告诉你"别刷手机"，而是通过提问让你自己发现：
• 你追求的"快乐"其实是痛苦的来源
• 你以为的"自由"其实是被操控
• 你以为的"学习"其实是自我欺骗

最终问题：
🗣️ **"如果你明知道这些，为什么还继续？"**

这就是苏格拉底的终极挑战：
• 如果你真的"知道"社交媒体的危害，你就会停下来（美德即知识）
• 如果你停不下来，说明你不是真正"知道"，只是表面知道

💊 **苏格拉底的"戒断"方案**

1. **"认识你自己"**
   • 记录使用日志：今天刷了多久？为什么刷？刷完感觉如何？
   • 通过记录，你才能真正"看见"自己的行为模式
   • "未经审视的生活不值得过"→未经审视的刷手机更不值得

2. **"提问而非说教"**
   每次想刷手机时，问自己：
   • "我现在真的需要这个吗？"
   • "我在逃避什么？"
   • "5分钟后我会后悔吗？"

3. **"对话式学习"**
   • 如果真想学习，找一个人深度讨论1小时 > 刷1小时碎片信息
   • 苏格拉底式对话能让你真正理解，而非被动接受

🎯 **最终答案**

苏格拉底会说：社交媒体成瘾的根源是**"无知"**——
• 你不知道自己真正想要什么（快乐 vs 幸福）
• 你不知道自己在被操控（自由 vs 算法）
• 你不知道自己在浪费生命（信息 vs 知识）

解决方案：**不断追问，直到你真正理解。** 当你真正理解了，行为自然会改变。如果你停不下来，说明你还不够理解——继续追问，直到"知道"变成"理解"。

"我知道我一无所知"→ 承认自己被算法操控，才是摆脱的第一步。`,
    },
    nietzsche: {
      "social-media": `**尼采视角：社交媒体与"羊群本能"**

🎯 **尼采的开场白**
"啊！你们这些躲在屏幕后面的现代人！你们用点赞和转发来确认自己的存在，用网络暴力来发泄自己的无力——你们不是在使用社交媒体，你们是在被它驯化成'最末的人'！"

⚡ **核心批判**

1️⃣ **社交媒体制造"最末的人"**

尼采在《查拉图斯特拉如是说》中描述的"最末的人"（Last Man）：
• 追求舒适和安全
• 避免一切风险和挑战
• 渴望被认同，害怕与众不同
• "我们发明了幸福"——实际上是自我欺骗

社交媒体完美地塑造了这种人：
• 追求点赞（被认同）
• 发布"岁月静好"（展示舒适）
• 害怕发表争议观点（害怕被攻击）
• 刷短视频麻痹自己（"我们很快乐"）

🔥 **"你们已经失去了成为超人的可能"**

---

2️⃣ **"羊群道德"的数字版**

尼采最痛恨的就是"羊群道德"——大家都这样做，所以我也这样做。

社交媒体把这种现象放大100倍：
• 热搜 = 集体关注的东西就是"重要的"
• 爆款文章 = 大家都认同的观点就是"对的"
• 网络暴力 = 大家都骂的人就是"错的"

尼采会说：
"你们用'多数人的意见'代替了自己的思考！
你们用'10万+阅读'代替了真理！
你们是羊群，不是狮子！"

💡 **核心问题：你有没有自己的价值观？还是只是在复读网络热梗？**

---

3️⃣ **"怨恨"的繁殖场**

尼采的核心概念：**Ressentiment（怨恨）**——弱者对强者的嫉妒和仇恨。

社交媒体是怨恨的完美温床：
• 看到别人炫富→嫉妒→"资本家都该死"
• 看到别人成功→怨恨→"肯定有背景"
• 看到别人快乐→不爽→"装的吧"

匿名性让人释放最阴暗的情绪：
• 不敢当面说的话，网上疯狂喷
• 不敢做的事，键盘侠狂敲
• "我过得不好，你也别想好"→拉低所有人

尼采会暴怒：
"你们不是在追求真理，你们只是在发泄怨恨！
你们不是在批判权力，你们只是嫉妒权力！
你们是奴隶道德的完美体现！"

---

4️⃣ **"永恒轮回"的地狱版**

尼采的思想实验：如果你的生活会永恒重复，你会绝望还是欣然接受？

现在问你：
**如果你每天刷3小时手机的生活会永恒重复，你会接受吗？**

如果答案是"不"，说明你已经知道这种生活不值得过。
但你还在继续——这就是**自我欺骗**。

尼采会说：
"你们害怕面对自己生活的虚无，
所以用社交媒体填满每一个空隙，
但越是逃避，越是空虚！
这是懦夫的选择！"

---

⚡ **尼采的"解药"：成为超人**

1️⃣ **"重估一切价值"**

不要接受网络给你的价值观：
• 别人说"成功=赚钱+有名"→ 你要问：我真的认同吗？
• 别人说"这个人该骂"→ 你要问：我真的了解真相吗？
• 别人说"这个很火"→ 你要问：我真的需要吗？

**建立自己的价值体系，不做"羊群"中的一员。**

---

2️⃣ **"肯定生命"**

不要用社交媒体逃避真实生活：
• 与其刷别人的生活，不如活出自己的生活
• 与其点赞别人的成就，不如创造自己的作品
• 与其在网上喷人，不如在现实中行动

"生命就是权力意志的展现"
→ 不是在网上假装强大，而是在现实中真正强大

---

3️⃣ **"孤独的勇气"**

尼采自己一生孤独，但他接受这种孤独：
"在高山之巅，人们会感到孤独，但也会看得更远。"

应用到社交媒体：
• 别害怕取关那些让你焦虑的账号
• 别害怕发表不讨好的观点
• 别害怕被少数人骂（"羊群"的批评恰恰证明你是对的）

**"成为你自己"——即使全世界都不理解你。**

---

4️⃣ **"说是！"（Yes-Saying）**

尼采最终的智慧：肯定生命，包括痛苦。

应用：
• 不要用社交媒体麻痹自己（逃避痛苦）
• 面对焦虑、孤独、失败——这些是成长的必经之路
• "那些杀不死我的，使我更强大"

与其刷手机逃避，不如：
• 去读一本难懂的书（挑战智力）
• 去做一件害怕的事（突破舒适区）
• 去创造一些东西（而非消费）

---

💥 **尼采的最终判决**

"社交媒体不是让你成为超人的工具，而是让你成为'最末的人'的陷阱！

如果你继续沉迷，你将成为：
• 没有独立思考的复读机
• 没有创造力的消费者
• 没有勇气的键盘侠
• 没有灵魂的点赞机器

但如果你选择反抗，你将成为：
• 重估价值的创造者
• 肯定生命的战士
• 孤独但自由的狮子
• 自己命运的主宰

**选择权在你。但记住：懦夫才会躲在屏幕后面。勇者会关掉手机，走进真实世界。**

"上帝已死"——现在，算法成了新的上帝。
你会跪下臣服，还是起来反抗？"

🔥 **查拉图斯特拉如是说：关掉手机，成为超人！** 🔥`,
    },
  };

  return analyses[philosopherId]?.[scenarioId] || `**${philosopherName}的视角**\n\n（此场景的详细分析正在生成中...）\n\n基于${philosopherName}的核心思想：${coreIdeas.join("、")}，我们可以从以下角度思考这个问题...\n\n[这里会展示具体的哲学分析和现代应用建议]`;
};

export function ModernApplication({ philosopherName, philosopherId, coreIdeas }: ModernApplicationProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScenarioClick = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setIsAnalyzing(true);
    // 模拟API调用延迟
    setTimeout(() => {
      const result = generateAnalysis(philosopherId, scenarioId);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleCustomSubmit = () => {
    if (!customScenario.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(`**${philosopherName}对"${customScenario}"的分析**\n\n基于${philosopherName}的核心思想：${coreIdeas.join("、")}\n\n[AI正在生成定制分析...]\n\n这是一个自定义场景，AI会根据思想家的核心理念提供独特视角。`);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="mt-8 border-t border-orange-900/30 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-white">
          现代应用场景挑战
        </h3>
        <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
          把思想应用到2026年的真实问题
        </span>
      </div>

      {!selectedScenario && !showCustomInput && (
        <div>
          <p className="text-zinc-400 mb-6">
            选择一个当代议题，看看{philosopherName}会如何分析：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modernScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario.id)}
                className="group text-left p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-900/50 rounded-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{scenario.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1 group-hover:text-orange-500 transition-colors">
                      {scenario.title}
                    </h4>
                    <p className="text-sm text-zinc-500">
                      {scenario.description}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCustomInput(true)}
            className="mt-4 w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-orange-900/50 rounded-lg transition-all text-zinc-400 hover:text-orange-500 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>或者，输入你自己的议题</span>
          </button>
        </div>
      )}

      {showCustomInput && !selectedScenario && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <label className="block text-white mb-3">
            输入你想探讨的2026年现实问题：
          </label>
          <input
            type="text"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="例如：元宇宙对人际关系的影响..."
            className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCustomSubmit}
              disabled={!customScenario.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              生成分析
            </button>
            <button
              onClick={() => setShowCustomInput(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-zinc-400">
            {philosopherName}正在思考中...
          </p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="bg-zinc-900 border border-orange-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-orange-500">
              {philosopherName}的2026视角
            </h4>
            <button
              onClick={() => {
                setSelectedScenario(null);
                setAnalysis("");
                setCustomScenario("");
                setShowCustomInput(false);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              换个场景
            </button>
          </div>
          <div className="prose prose-invert prose-orange max-w-none">
            <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
