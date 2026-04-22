import Foundation

/// 与 Web `dilemmas.ts` 对齐的道德困境元数据（配图在客户端用符号/渐变代替）。
struct MoralDilemmaOption: Identifiable, Hashable {
    let id: String
    let labelZh: String
    let labelEn: String
    let summaryZh: String
    let summaryEn: String
    let stancePromptZh: String
    let stancePromptEn: String

    func label(_ en: Bool) -> String { en ? labelEn : labelZh }
    func summary(_ en: Bool) -> String { en ? summaryEn : summaryZh }
    func stancePrompt(_ en: Bool) -> String { en ? stancePromptEn : stancePromptZh }
}

struct MoralDilemma: Identifiable, Hashable {
    let id: String
    let titleZh: String
    let titleEn: String
    let subtitleZh: String
    let subtitleEn: String
    let imageAltZh: String
    let imageAltEn: String
    let imageCaptionZh: String
    let imageCaptionEn: String
    let questionZh: String
    let questionEn: String
    let promptLeadZh: String
    let promptLeadEn: String
    let options: [MoralDilemmaOption]
    let recommendedPhilosopherIds: [String]

    func title(_ en: Bool) -> String { en ? titleEn : titleZh }
    func subtitle(_ en: Bool) -> String { en ? subtitleEn : subtitleZh }
    func imageAlt(_ en: Bool) -> String { en ? imageAltEn : imageAltZh }
    func imageCaption(_ en: Bool) -> String { en ? imageCaptionEn : imageCaptionZh }
    func question(_ en: Bool) -> String { en ? questionEn : questionZh }
    func promptLead(_ en: Bool) -> String { en ? promptLeadEn : promptLeadZh }
}

enum MoralDilemmaCatalog {
    static let all: [MoralDilemma] = [
        MoralDilemma(
            id: "trolley-problem",
            titleZh: "电车难题",
            titleEn: "Trolley Problem",
            subtitleZh: "功利与责任发生冲突时，你是否愿意主动扳动那根拉杆？",
            subtitleEn: "When utility clashes with responsibility, would you pull the lever?",
            imageAltZh: "电车难题示意图",
            imageAltEn: "Trolley problem illustration",
            imageCaptionZh: "一辆失控电车冲向前方五人，你可以扳动拉杆，让它改道撞向另一条轨道上的一人。",
            imageCaptionEn: "A runaway trolley heads toward five people; you can divert it to hit one person on another track.",
            questionZh: "如果你此刻站在道岔旁，你会怎么做？",
            questionEn: "If you stood by the switch right now, what would you do?",
            promptLeadZh: "请围绕牺牲少数以拯救多数、行动责任与道德边界来展开讨论。",
            promptLeadEn: "Discuss sacrificing the few to save many, agency, and moral boundaries.",
            options: [
                MoralDilemmaOption(
                    id: "pull-lever",
                    labelZh: "扳动拉杆，牺牲一人救五人",
                    labelEn: "Pull the lever—save five, sacrifice one",
                    summaryZh: "把结果最大化看作优先目标，接受主动介入带来的责任。",
                    summaryEn: "Prioritize the best outcome and accept responsibility for intervening.",
                    stancePromptZh: "我愿意扳动拉杆，用一人的牺牲换取五人的生还。",
                    stancePromptEn: "I would pull the lever to save five at the cost of one."
                ),
                MoralDilemmaOption(
                    id: "do-nothing",
                    labelZh: "不扳动拉杆，不主动介入",
                    labelEn: "Do not pull—do not intervene",
                    summaryZh: "认为主动造成伤害与袖手旁观在道德上并不等价。",
                    summaryEn: "Actively causing harm is not morally the same as letting harm unfold.",
                    stancePromptZh: "我不会扳动拉杆，因为主动造成一人死亡本身就是不可接受的行为。",
                    stancePromptEn: "I would not pull, because actively causing a death is unacceptable."
                ),
                MoralDilemmaOption(
                    id: "seek-third-way",
                    labelZh: "先寻找第三种办法",
                    labelEn: "Seek a third way first",
                    summaryZh: "拒绝马上接受二选一，优先寻找系统性或情境性替代方案。",
                    summaryEn: "Refuse the forced binary; look for systemic or situational alternatives.",
                    stancePromptZh: "我会尽量寻找第三种办法，不愿直接接受既定的两难结构。",
                    stancePromptEn: "I would try to find a third option rather than accept the dilemma as given."
                ),
            ],
            recommendedPhilosopherIds: ["kant", "aristotle", "confucius", "hume", "zhuangzi"]
        ),
        MoralDilemma(
            id: "brain-in-a-vat",
            titleZh: "缸中之脑",
            titleEn: "Brain in a Vat",
            subtitleZh: "如果一切经验都能被模拟，你还能确定自己真正活在现实中吗？",
            subtitleEn: "If all experience could be simulated, can you know you are really in reality?",
            imageAltZh: "缸中之脑示意图",
            imageAltEn: "Brain in a vat illustration",
            imageCaptionZh: "一颗被维生系统维持的脑，被持续输入与现实完全相同的神经信号。",
            imageCaptionEn: "A brain in a vat fed signals indistinguishable from real experience.",
            questionZh: "面对这个设定，你最愿意采取哪种态度？",
            questionEn: "Facing this setup, which attitude do you lean toward?",
            promptLeadZh: "请围绕知识来源、感官经验、怀疑论与现实判断展开讨论。",
            promptLeadEn: "Discuss sources of knowledge, sense experience, skepticism, and judgments about reality.",
            options: [
                MoralDilemmaOption(
                    id: "trust-experience",
                    labelZh: "暂且相信经验世界可作为现实基础",
                    labelEn: "Trust experience as a provisional basis for reality",
                    summaryZh: "认为即使经验可能被模拟，我们仍需以稳定经验作为认知与行动基础。",
                    summaryEn: "Even if experience might be simulated, we need a stable basis to think and act.",
                    stancePromptZh: "我仍愿意把稳定的经验世界当作现实基础，因为认知和行动都需要这个起点。",
                    stancePromptEn: "I still treat stable experience as reality’s basis for thought and action."
                ),
                MoralDilemmaOption(
                    id: "radical-doubt",
                    labelZh: "必须更强证明，否则保持怀疑",
                    labelEn: "Demand stronger proof or stay skeptical",
                    summaryZh: "认为感官经验不可靠，世界真实性不能仅靠体验本身担保。",
                    summaryEn: "Sense experience alone cannot guarantee the world is real.",
                    stancePromptZh: "如果无法获得更强的证明，我会对当前世界的真实性保持根本性的怀疑。",
                    stancePromptEn: "Without stronger proof, I would remain fundamentally skeptical about reality."
                ),
                MoralDilemmaOption(
                    id: "pragmatic-living",
                    labelZh: "真假未定，但先按能行动的世界生活",
                    labelEn: "Truth uncertain—live in the actionable world",
                    summaryZh: "不把终极真实性放在第一位，而把可行动性与可解释性放在前面。",
                    summaryEn: "Prioritize action and intelligibility over ultimate metaphysical certainty.",
                    stancePromptZh: "我承认真伪未定，但仍会先按这个能行动、能交流的世界继续生活。",
                    stancePromptEn: "Truth may be uncertain, but I still live in this actionable, shared world."
                ),
            ],
            recommendedPhilosopherIds: ["descartes", "plato", "hume", "kant", "zhuangzi"]
        ),
        MoralDilemma(
            id: "veil-of-ignorance",
            titleZh: "无知之幕",
            titleEn: "Veil of Ignorance",
            subtitleZh: "当你不知道自己会成为谁时，你会如何设计一个社会？",
            subtitleEn: "Behind a veil of ignorance, how would you design a society?",
            imageAltZh: "无知之幕示意图",
            imageAltEn: "Veil of ignorance illustration",
            imageCaptionZh: "你在制定制度之前被蒙住身份信息，不知道自己将身处社会的哪一个位置。",
            imageCaptionEn: "You design institutions without knowing your place in society.",
            questionZh: "你更倾向于支持怎样的制度设计？",
            questionEn: "Which institutional design do you lean toward?",
            promptLeadZh: "请围绕公平、自由、制度风险与最弱者保障展开讨论。",
            promptLeadEn: "Discuss fairness, liberty, institutional risk, and protection of the worst off.",
            options: [
                MoralDilemmaOption(
                    id: "prioritize-worst-off",
                    labelZh: "优先保障最弱者利益",
                    labelEn: "Prioritize the worst off",
                    summaryZh: "把最不利处境者的安全与尊严放在制度设计的核心位置。",
                    summaryEn: "Center the safety and dignity of the least advantaged.",
                    stancePromptZh: "我会优先保障最弱者利益，因为在无知之幕下我必须为最坏处境做好准备。",
                    stancePromptEn: "I would prioritize the worst off, since I might end up there behind the veil."
                ),
                MoralDilemmaOption(
                    id: "prioritize-liberty",
                    labelZh: "优先保护自由与机会",
                    labelEn: "Prioritize liberty and opportunity",
                    summaryZh: "认为制度首先应保障基本自由，再通过机会公平减少不公。",
                    summaryEn: "Institutions should secure basic liberties first, then fair opportunity.",
                    stancePromptZh: "我会优先保护基本自由与机会，因为制度首先要防止个人被权力压缩。",
                    stancePromptEn: "I would prioritize basic liberties and opportunity against domination."
                ),
                MoralDilemmaOption(
                    id: "balanced-design",
                    labelZh: "自由与公平并重，允许有限差距",
                    labelEn: "Balance liberty and fairness; allow limited inequality",
                    summaryZh: "接受差异存在，但要求这种差异能真正改善整体与弱者处境。",
                    summaryEn: "Allow some inequality if it improves everyone, especially the vulnerable.",
                    stancePromptZh: "我主张自由与公平并重，允许有限差距，但这种差距必须能改善整体处境。",
                    stancePromptEn: "I want liberty and fairness with limited gaps that improve overall outcomes."
                ),
            ],
            recommendedPhilosopherIds: ["rawls", "rousseau", "confucius", "kant", "aristotle"]
        ),
    ]

    static func dilemma(id: String) -> MoralDilemma {
        all.first { $0.id == id } ?? all[0]
    }
}
