export interface Philosopher {
  id: string;
  name: string;
  nameCN: string;
  region: string;
  period: number; // 年份
  school: string; // 学派
  keyIdeas: string[]; // 核心思想
  // 新增详细信息
  lifespan?: string; // 生卒年份
  birthPlace?: string; // 出生地
  majorWorks?: string[]; // 核心著作
  famousQuotes?: string[]; // 名言
  summary?: string; // 主要观点总结
  influences?: { // 影响关系
    influencedBy?: string[]; // 受谁影响（思想家ID）
    influenced?: string[]; // 影响了谁（思想家ID）
  };
}

const philosopherAvatarMap: Record<string, string> = {
  aquinas: "/philosophers/aquinas.jpg",
  aristotle: "/philosophers/aristotle.jpg",
  augustine: "/philosophers/augustine.jpg",
  averroes: "/philosophers/averroes.jpg",
  avicenna: "/philosophers/avicenna.jpg",
  buddha: "/philosophers/buddha.jpg",
  confucius: "/philosophers/confucius.jpg",
  descartes: "/philosophers/descartes.jpg",
  dewey: "/philosophers/dewey.jpg",
  epicurus: "/philosophers/epicurus.jpg",
  hegel: "/philosophers/hegel.jpg",
  hume: "/philosophers/hume.jpg",
  james: "/philosophers/james.jpg",
  kant: "/philosophers/kant.jpg",
  kierkegaard: "/philosophers/kierkegaard.jpg",
  laozi: "/philosophers/laozi.jpg",
  locke: "/philosophers/locke.jpg",
  marx: "/philosophers/marx.jpg",
  mengzi: "/philosophers/mengzi.jpg",
  mozi: "/philosophers/mozi.jpg",
  nagarjuna: "/philosophers/nagarjuna.jpg",
  nietzsche: "/philosophers/nietzsche.jpg",
  plato: "/philosophers/plato.jpg",
  rawls: "/philosophers/rawls.jpg",
  rousseau: "/philosophers/rousseau.jpg",
  socrates: "/philosophers/socrates.jpg",
  spinoza: "/philosophers/spinoza.jpg",
  xunzi: "/philosophers/xunzi.jpg",
  zhuangzi: "/philosophers/zhuangzi.jpg",
};

export function getPhilosopherAvatarSrc(philosopherId: string): string | undefined {
  return philosopherAvatarMap[philosopherId];
}

export const philosophers: Philosopher[] = [
  // 古希腊 (Europe)
  { 
    id: "socrates", 
    name: "Socrates", 
    nameCN: "苏格拉底", 
    region: "Europe", 
    period: -400, 
    school: "古希腊哲学", 
    keyIdeas: ["认识你自己", "美德即知识", "产婆术"],
    lifespan: "前470 - 前399",
    birthPlace: "雅典",
    majorWorks: ["无（仅通过柏拉图对话录传世）"],
    famousQuotes: [
      "未经审视的生活不值得过",
      "我知道我一无所知",
      "认识你自己"
    ],
    summary: "西方哲学的奠基人，通过对话和提问的方式引导人们发现真理。认为美德即知识，无人明知故犯。",
    influences: {
      influenced: ["plato"]
    }
  },
  { 
    id: "plato", 
    name: "Plato", 
    nameCN: "柏拉图", 
    region: "Europe", 
    period: -380, 
    school: "古希腊哲学", 
    keyIdeas: ["理念论", "理想国", "灵魂三分"],
    lifespan: "前427 - 前347",
    birthPlace: "雅典",
    majorWorks: ["《理想国》", "《斐多篇》", "《会饮篇》"],
    famousQuotes: [
      "现实世界是理念世界的影子",
      "哲学家应当成为国王",
      "身体是灵魂的监狱"
    ],
    summary: "理念论创始人，认为真实世界存在于理念界，现实只是理念的摹本。建立了西方第一所学院。",
    influences: {
      influencedBy: ["socrates"],
      influenced: ["aristotle"]
    }
  },
  { 
    id: "aristotle", 
    name: "Aristotle", 
    nameCN: "亚里士多德", 
    region: "Europe", 
    period: -350, 
    school: "古希腊哲学", 
    keyIdeas: ["形而上学", "中庸之道", "四因说"],
    lifespan: "前384 - 前322",
    birthPlace: "斯塔基拉",
    majorWorks: ["《形而上学》", "《尼各马可伦理学》", "《政治学》"],
    famousQuotes: [
      "人是天生的政治动物",
      "美德是习惯的结果",
      "吾爱吾师，吾更爱真理"
    ],
    summary: "百科全书式哲学家，建立了逻辑学、物理学、生物学等学科体系。强调经验观察和实证研究。",
    influences: {
      influencedBy: ["plato"],
      influenced: ["aquinas"]
    }
  },
  { 
    id: "epicurus", 
    name: "Epicurus", 
    nameCN: "伊壁鸠鲁", 
    region: "Europe", 
    period: -300, 
    school: "伊壁鸠鲁学派", 
    keyIdeas: ["快乐主义", "原子论", "神不干预"]
  },
  
  // 中国古代 (East Asia)
  { 
    id: "confucius", 
    name: "Confucius", 
    nameCN: "孔子", 
    region: "East Asia", 
    period: -500, 
    school: "儒家", 
    keyIdeas: ["仁", "礼", "中庸"],
    lifespan: "前551 - 前479",
    birthPlace: "鲁国（今山东曲阜）",
    majorWorks: ["《论语》（弟子记录）", "《春秋》"],
    famousQuotes: [
      "己所不欲，勿施于人",
      "学而不思则罔，思而不学则殆",
      "三人行，必有我师焉"
    ],
    summary: "儒家创始人，强调仁爱、礼仪和道德教化。主张通过教育和修身来实现理想社会。",
    influences: {
      influenced: ["mengzi", "xunzi"]
    }
  },
  { 
    id: "laozi", 
    name: "Laozi", 
    nameCN: "老子", 
    region: "East Asia", 
    period: -500, 
    school: "道家", 
    keyIdeas: ["道", "无为而治", "上善若水"],
    lifespan: "约前571 - 前471",
    birthPlace: "楚国（今河南鹿邑）",
    majorWorks: ["《道德经》"],
    famousQuotes: [
      "道可道，非常道",
      "上善若水",
      "无为而无不为"
    ],
    summary: "道家创始人，主张顺应自然、无为而治。认为人为干预会破坏事物的自然状态。",
    influences: {
      influenced: ["zhuangzi"]
    }
  },
  { 
    id: "mozi", 
    name: "Mozi", 
    nameCN: "墨子", 
    region: "East Asia", 
    period: -400, 
    school: "墨家", 
    keyIdeas: ["兼爱", "非攻", "尚贤"]
  },
  { 
    id: "mengzi", 
    name: "Mencius", 
    nameCN: "孟子", 
    region: "East Asia", 
    period: -300, 
    school: "儒家", 
    keyIdeas: ["性善论", "仁政", "民为贵"],
    lifespan: "前372 - 前289",
    birthPlace: "邹国（今山东邹城）",
    majorWorks: ["《孟子》"],
    famousQuotes: [
      "人性之善也，犹水之就下也",
      "民为贵，社稷次之，君为轻",
      "富贵不能淫，贫贱不能移，威武不能屈"
    ],
    summary: "儒家代表人物，发展了孔子的思想，主张性善论和仁政。",
    influences: {
      influencedBy: ["confucius"]
    }
  },
  { 
    id: "zhuangzi", 
    name: "Zhuangzi", 
    nameCN: "庄子", 
    region: "East Asia", 
    period: -300, 
    school: "道家", 
    keyIdeas: ["逍遥游", "齐物论", "天人合一"],
    lifespan: "约前369 - 前286",
    birthPlace: "宋国（今河南商丘）",
    majorWorks: ["《庄子》"],
    famousQuotes: [
      "吾生也有涯，而知也无涯",
      "天地与我并生，万物与我为一",
      "庄周梦蝶"
    ],
    summary: "道家重要代表，继承并发展了老子思想，强调精神自由和齐物观。",
    influences: {
      influencedBy: ["laozi"]
    }
  },
  { 
    id: "xunzi", 
    name: "Xunzi", 
    nameCN: "荀子", 
    region: "East Asia", 
    period: -250, 
    school: "儒家", 
    keyIdeas: ["性恶论", "礼法并重", "天人相分"],
    influences: {
      influencedBy: ["confucius"]
    }
  },
  
  // 印度古代 (South Asia)
  { 
    id: "buddha", 
    name: "Buddha", 
    nameCN: "释迦牟尼", 
    region: "South Asia", 
    period: -400, 
    school: "佛教", 
    keyIdeas: ["四圣谛", "八正道", "缘起性空"],
    lifespan: "前563 - 前483",
    birthPlace: "迦毗罗卫国（今尼泊尔）",
    majorWorks: ["佛经（弟子记录）"],
    famousQuotes: [
      "一切皆苦",
      "诸法无我",
      "诸行无常"
    ],
    summary: "佛教创始人，提出四圣谛和八正道，主张通过修行达到解脱。",
    influences: {
      influenced: ["nagarjuna"]
    }
  },
  { 
    id: "nagarjuna", 
    name: "Nagarjuna", 
    nameCN: "龙树", 
    region: "South Asia", 
    period: 150, 
    school: "佛教", 
    keyIdeas: ["中观", "空性", "二谛"],
    influences: {
      influencedBy: ["buddha"]
    }
  },
  
  // 中世纪欧洲
  { 
    id: "augustine", 
    name: "Augustine", 
    nameCN: "奥古斯丁", 
    region: "Europe", 
    period: 400, 
    school: "基督教哲学", 
    keyIdeas: ["上帝之城", "原罪", "时间论"]
  },
  { 
    id: "aquinas", 
    name: "Thomas Aquinas", 
    nameCN: "托马斯·阿奎那", 
    region: "Europe", 
    period: 1250, 
    school: "经院哲学", 
    keyIdeas: ["五路证明", "自然法", "信仰与理性"],
    influences: {
      influencedBy: ["aristotle"]
    }
  },
  
  // 伊斯兰黄金时代 (Middle East)
  { 
    id: "avicenna", 
    name: "Avicenna", 
    nameCN: "阿维森纳", 
    region: "Middle East", 
    period: 1000, 
    school: "伊斯兰哲学", 
    keyIdeas: ["存在与本质", "灵魂论", "必然存在"]
  },
  { 
    id: "averroes", 
    name: "Averroes", 
    nameCN: "阿威罗伊", 
    region: "Middle East", 
    period: 1150, 
    school: "伊斯兰哲学", 
    keyIdeas: ["双重真理", "理性至上", "亚里士多德注释"]
  },
  
  // 文艺复兴与近代
  { 
    id: "descartes", 
    name: "René Descartes", 
    nameCN: "笛卡尔", 
    region: "Europe", 
    period: 1640, 
    school: "理性主义", 
    keyIdeas: ["我思故我在", "心物二元论", "天赋观念"],
    lifespan: "1596 - 1650",
    birthPlace: "法国",
    majorWorks: ["《谈谈方法》", "《第一哲学沉思录》"],
    famousQuotes: [
      "我思故我在",
      "怀疑一切",
      "给我物质和运动，我就能创造宇宙"
    ],
    summary: "近代哲学之父，提出理性主义方法论，强调通过理性思考获得确定性知识。",
    influences: {
      influenced: ["spinoza"]
    }
  },
  { 
    id: "spinoza", 
    name: "Baruch Spinoza", 
    nameCN: "斯宾诺莎", 
    region: "Europe", 
    period: 1660, 
    school: "理性主义", 
    keyIdeas: ["泛神论", "实体一元论", "自由即必然"],
    influences: {
      influencedBy: ["descartes"]
    }
  },
  { 
    id: "locke", 
    name: "John Locke", 
    nameCN: "洛克", 
    region: "Europe", 
    period: 1680, 
    school: "经验主义", 
    keyIdeas: ["白板说", "社会契约", "天赋权利"]
  },
  { 
    id: "hume", 
    name: "David Hume", 
    nameCN: "休谟", 
    region: "Europe", 
    period: 1740, 
    school: "经验主义", 
    keyIdeas: ["因果怀疑", "印象与观念", "情感主义"]
  },
  
  // 启蒙运动
  { 
    id: "kant", 
    name: "Immanuel Kant", 
    nameCN: "康德", 
    region: "Europe", 
    period: 1780, 
    school: "德国古典哲学", 
    keyIdeas: ["先验哲学", "纯粹理性批判", "绝对命令"],
    lifespan: "1724 - 1804",
    birthPlace: "柯尼斯堡（今俄罗斯加里宁格勒）",
    majorWorks: ["《纯粹理性批判》", "《实践理性批判》", "《判断力批判》"],
    famousQuotes: [
      "有两样东西，我越是思考就越感到敬畏：头上的星空和心中的道德律",
      "人是目的，不是手段",
      "要有勇气运用你自己的理智"
    ],
    summary: "德国古典哲学集大成者，提出先验哲学和绝对命令，在认识论和伦理学上做出重大贡献。",
    influences: {
      influenced: ["hegel"]
    }
  },
  { 
    id: "rousseau", 
    name: "Jean-Jacques Rousseau", 
    nameCN: "卢梭", 
    region: "Europe", 
    period: 1760, 
    school: "启蒙运动", 
    keyIdeas: ["社会契约", "公意", "自然状态"]
  },
  
  // 19世纪
  { 
    id: "hegel", 
    name: "Georg Hegel", 
    nameCN: "黑格尔", 
    region: "Europe", 
    period: 1820, 
    school: "德国唯心主义", 
    keyIdeas: ["辩证法", "绝对精神", "历史哲学"],
    lifespan: "1770 - 1831",
    birthPlace: "德国斯图加特",
    majorWorks: ["《精神现象学》", "《逻辑学》", "《法哲学原理》"],
    famousQuotes: [
      "凡是现实的都是合理的，凡是合理的都是现实的",
      "密涅瓦的猫头鹰在黄昏起飞",
      "历史是绝对精神的自我展开"
    ],
    summary: "德国唯心主义大师，建立了完整的辩证法体系，对后世哲学影响深远。",
    influences: {
      influencedBy: ["kant"],
      influenced: ["marx"]
    }
  },
  { 
    id: "marx", 
    name: "Karl Marx", 
    nameCN: "马克思", 
    region: "Europe", 
    period: 1850, 
    school: "马克思主义", 
    keyIdeas: ["历史唯物主义", "剩余价值", "阶级斗争"],
    lifespan: "1818 - 1883",
    birthPlace: "德国特里尔",
    majorWorks: ["《资本论》", "《共产党宣言》", "《1844年经济学哲学手稿》"],
    famousQuotes: [
      "全世界无产者，联合起来！",
      "哲学家们只是用不同的方式解释世界，而问题在于改变世界",
      "历史不过是追求着自己目的的人的活动而已"
    ],
    summary: "马克思主义创始人，提出历史唯物主义和剩余价值理论，对世界历史产生巨大影响。",
    influences: {
      influencedBy: ["hegel"]
    }
  },
  { 
    id: "nietzsche", 
    name: "Friedrich Nietzsche", 
    nameCN: "尼采", 
    region: "Europe", 
    period: 1880, 
    school: "存在主义先驱", 
    keyIdeas: ["超人", "永恒轮回", "权力意志"],
    lifespan: "1844 - 1900",
    birthPlace: "德国吕岑",
    majorWorks: ["《查拉图斯特拉如是说》", "《善恶的彼岸》", "《道德的谱系》"],
    famousQuotes: [
      "上帝已死",
      "那些杀不死我的，使我更强大",
      "人是一根绳索，架在动物与超人之间"
    ],
    summary: "存在主义先驱，激烈批判传统道德和基督教文化，提出超人哲学和权力意志理论。",
    influences: {
      influenced: ["heidegger", "sartre", "foucault"]
    }
  },
  { 
    id: "kierkegaard", 
    name: "Søren Kierkegaard", 
    nameCN: "克尔凯郭尔", 
    region: "Europe", 
    period: 1840, 
    school: "存在主义", 
    keyIdeas: ["存在先于本质", "焦虑", "信仰的跳跃"],
    influences: {
      influenced: ["heidegger", "sartre"]
    }
  },
  
  // 20世纪
  { 
    id: "husserl", 
    name: "Edmund Husserl", 
    nameCN: "胡塞尔", 
    region: "Europe", 
    period: 1910, 
    school: "现象学", 
    keyIdeas: ["现象学还原", "意向性", "生活世界"],
    influences: {
      influenced: ["heidegger"]
    }
  },
  { 
    id: "heidegger", 
    name: "Martin Heidegger", 
    nameCN: "海德格尔", 
    region: "Europe", 
    period: 1930, 
    school: "存在主义", 
    keyIdeas: ["此在", "存在与时间", "向死而生"],
    lifespan: "1889 - 1976",
    birthPlace: "德国梅斯基希",
    majorWorks: ["《存在与时间》", "《林中路》"],
    famousQuotes: [
      "人是向死而生的存在",
      "语言是存在的家",
      "此在总是我的此在"
    ],
    summary: "20世纪最重要的哲学家之一，探讨存在的意义，对现象学和存在主义贡献巨大。",
    influences: {
      influencedBy: ["husserl", "kierkegaard", "nietzsche"],
      influenced: ["sartre"]
    }
  },
  { 
    id: "sartre", 
    name: "Jean-Paul Sartre", 
    nameCN: "萨特", 
    region: "Europe", 
    period: 1945, 
    school: "存在主义", 
    keyIdeas: ["存在先于本质", "自由选择", "他人即地狱"],
    lifespan: "1905 - 1980",
    birthPlace: "法国巴黎",
    majorWorks: ["《存在与虚无》", "《存在主义是一种人道主义》"],
    famousQuotes: [
      "存在先于本质",
      "他人即地狱",
      "人注定是自由的"
    ],
    summary: "存在主义代表人物，强调人的自由选择和责任，对20世纪思想界影响深远。",
    influences: {
      influencedBy: ["heidegger", "kierkegaard"]
    }
  },
  { 
    id: "wittgenstein", 
    name: "Ludwig Wittgenstein", 
    nameCN: "维特根斯坦", 
    region: "Europe", 
    period: 1920, 
    school: "分析哲学", 
    keyIdeas: ["语言游戏", "逻辑哲学", "不可说"]
  },
  { 
    id: "foucault", 
    name: "Michel Foucault", 
    nameCN: "福柯", 
    region: "Europe", 
    period: 1970, 
    school: "后现代主义", 
    keyIdeas: ["权力知识", "规训", "生命政治"],
    lifespan: "1926 - 1984",
    birthPlace: "法国普瓦捷",
    majorWorks: ["《疯癫与文明》", "《规训与惩罚》", "《性史》"],
    famousQuotes: [
      "知识就是权力",
      "不是人创造话语，而是话语创造人",
      "我们应该警惕那些表面上解放我们的东西"
    ],
    summary: "后现代主义重要思想家，研究权力、知识和主体性的关系，对当代思想影响深远。",
    influences: {
      influencedBy: ["nietzsche"]
    }
  },
  
  // 美洲
  { 
    id: "james", 
    name: "William James", 
    nameCN: "威廉·詹姆斯", 
    region: "Americas", 
    period: 1900, 
    school: "实用主义", 
    keyIdeas: ["实用主义", "意识流", "多元宇宙"]
  },
  { 
    id: "dewey", 
    name: "John Dewey", 
    nameCN: "杜威", 
    region: "Americas", 
    period: 1920, 
    school: "实用主义", 
    keyIdeas: ["工具主义", "民主教育", "经验哲学"]
  },
  { 
    id: "rawls", 
    name: "John Rawls", 
    nameCN: "罗尔斯", 
    region: "Americas", 
    period: 1970, 
    school: "政治哲学", 
    keyIdeas: ["正义论", "无知之幕", "差异原则"]
  },
];

export const regions = [
  { id: "Europe", name: "欧洲", x: 50, y: 25 },
  { id: "East Asia", name: "东亚", x: 80, y: 30 },
  { id: "South Asia", name: "南亚", x: 70, y: 45 },
  { id: "Middle East", name: "中东", x: 60, y: 40 },
  { id: "Americas", name: "美洲", x: 20, y: 35 },
];

export const timePeriods = [
  { year: -500, label: "前500年", era: "古代" },
  { year: -400, label: "前400年", era: "古代" },
  { year: -300, label: "前300年", era: "古代" },
  { year: 0, label: "公元元年", era: "古代" },
  { year: 400, label: "400年", era: "中世纪" },
  { year: 800, label: "800年", era: "中世纪" },
  { year: 1200, label: "1200年", era: "中世纪" },
  { year: 1500, label: "1500年", era: "近代" },
  { year: 1700, label: "1700年", era: "近代" },
  { year: 1800, label: "1800年", era: "近代" },
  { year: 1850, label: "1850年", era: "现代" },
  { year: 1900, label: "1900年", era: "现代" },
  { year: 1950, label: "1950年", era: "现代" },
  { year: 2000, label: "2000年", era: "现代" },
];

// 根据时间范围和地区获取哲学家（可传入接口下发的列表）
export function getPhilosophersByPeriodAndRegion(
  year: number,
  region: string,
  source: Philosopher[] = philosophers
): Philosopher[] {
  const range = 100; // 前后100年范围
  return source
    .filter((p) => p.region === region && p.period >= year - range && p.period <= year + range)
    .slice(0, 10);
}
