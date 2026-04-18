export type DilemmaOption = {
  id: string;
  label: string;
  summary: string;
  stancePrompt: string;
};

export type Dilemma = {
  id: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  heroImage: string;
  imageAlt: string;
  imageCaption: string;
  question: string;
  promptLead: string;
  options: DilemmaOption[];
  recommendedPhilosophers: string[];
};

export const dilemmas: Dilemma[] = [
  {
    id: "trolley-problem",
    title: "电车难题",
    englishTitle: "Trolley Problem",
    subtitle: "功利与责任发生冲突时，你是否愿意主动扳动那根拉杆？",
    heroImage: "/dilemmas/trolley-problem.svg",
    imageAlt: "电车难题示意图",
    imageCaption: "一辆失控电车冲向前方五人，你可以扳动拉杆，让它改道撞向另一条轨道上的一人。",
    question: "如果你此刻站在道岔旁，你会怎么做？",
    promptLead: "请围绕牺牲少数以拯救多数、行动责任与道德边界来展开讨论。",
    options: [
      {
        id: "pull-lever",
        label: "扳动拉杆，牺牲一人救五人",
        summary: "把结果最大化看作优先目标，接受主动介入带来的责任。",
        stancePrompt: "我愿意扳动拉杆，用一人的牺牲换取五人的生还。",
      },
      {
        id: "do-nothing",
        label: "不扳动拉杆，不主动介入",
        summary: "认为主动造成伤害与袖手旁观在道德上并不等价。",
        stancePrompt: "我不会扳动拉杆，因为主动造成一人死亡本身就是不可接受的行为。",
      },
      {
        id: "seek-third-way",
        label: "先寻找第三种办法",
        summary: "拒绝马上接受二选一，优先寻找系统性或情境性替代方案。",
        stancePrompt: "我会尽量寻找第三种办法，不愿直接接受既定的两难结构。",
      },
    ],
    recommendedPhilosophers: ["kant", "aristotle", "confucius", "hume", "zhuangzi"],
  },
  {
    id: "brain-in-a-vat",
    title: "缸中之脑",
    englishTitle: "Brain in a Vat",
    subtitle: "如果一切经验都能被模拟，你还能确定自己真正活在现实中吗？",
    heroImage: "/dilemmas/brain-in-a-vat.svg",
    imageAlt: "缸中之脑示意图",
    imageCaption: "一颗被维生系统维持的脑，被持续输入与现实完全相同的神经信号。",
    question: "面对这个设定，你最愿意采取哪种态度？",
    promptLead: "请围绕知识来源、感官经验、怀疑论与现实判断展开讨论。",
    options: [
      {
        id: "trust-experience",
        label: "暂且相信经验世界可作为现实基础",
        summary: "认为即使经验可能被模拟，我们仍需以稳定经验作为认知与行动基础。",
        stancePrompt: "我仍愿意把稳定的经验世界当作现实基础，因为认知和行动都需要这个起点。",
      },
      {
        id: "radical-doubt",
        label: "必须更强证明，否则保持怀疑",
        summary: "认为感官经验不可靠，世界真实性不能仅靠体验本身担保。",
        stancePrompt: "如果无法获得更强的证明，我会对当前世界的真实性保持根本性的怀疑。",
      },
      {
        id: "pragmatic-living",
        label: "真假未定，但先按能行动的世界生活",
        summary: "不把终极真实性放在第一位，而把可行动性与可解释性放在前面。",
        stancePrompt: "我承认真伪未定，但仍会先按这个能行动、能交流的世界继续生活。",
      },
    ],
    recommendedPhilosophers: ["descartes", "plato", "hume", "kant", "zhuangzi"],
  },
  {
    id: "veil-of-ignorance",
    title: "无知之幕",
    englishTitle: "Veil of Ignorance",
    subtitle: "当你不知道自己会成为谁时，你会如何设计一个社会？",
    heroImage: "/dilemmas/veil-of-ignorance.svg",
    imageAlt: "无知之幕示意图",
    imageCaption: "你在制定制度之前被蒙住身份信息，不知道自己将身处社会的哪一个位置。",
    question: "你更倾向于支持怎样的制度设计？",
    promptLead: "请围绕公平、自由、制度风险与最弱者保障展开讨论。",
    options: [
      {
        id: "prioritize-worst-off",
        label: "优先保障最弱者利益",
        summary: "把最不利处境者的安全与尊严放在制度设计的核心位置。",
        stancePrompt: "我会优先保障最弱者利益，因为在无知之幕下我必须为最坏处境做好准备。",
      },
      {
        id: "prioritize-liberty",
        label: "优先保护自由与机会",
        summary: "认为制度首先应保障基本自由，再通过机会公平减少不公。",
        stancePrompt: "我会优先保护基本自由与机会，因为制度首先要防止个人被权力压缩。",
      },
      {
        id: "balanced-design",
        label: "自由与公平并重，允许有限差距",
        summary: "接受差异存在，但要求这种差异能真正改善整体与弱者处境。",
        stancePrompt: "我主张自由与公平并重，允许有限差距，但这种差距必须能改善整体处境。",
      },
    ],
    recommendedPhilosophers: ["rawls", "rousseau", "confucius", "kant", "aristotle"],
  },
];

export function getDilemma(dilemmaId: string): Dilemma {
  return dilemmas.find((item) => item.id === dilemmaId) ?? dilemmas[0];
}
