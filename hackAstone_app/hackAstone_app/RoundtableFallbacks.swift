import Foundation

/// 与 Web `RoundtableDebate.tsx` 中本地回退文案一致。
enum RoundtableFallbacks {
    static func generateOpening(philosopher: Philosopher, topic: String, order: Int) -> String {
        let openings: [String: String] = [
            "socrates": "让我们先澄清一下：\"\(topic)\"——这个问题本身是什么意思？在我们讨论之前，我们真的理解这些概念吗？我知道我对此一无所知，但我很好奇各位的看法。",
            "plato": "这个问题触及了现象与理念的根本区别。我们在日常世界中看到的只是影子，真正的答案存在于理念界。让我从理性的角度来分析...",
            "confucius": "\(order == 0 ? "诸位贤者，" : "")关于\"\(topic)\"，我想从\"仁\"与\"礼\"的角度来思考。一个和谐的答案，应当既符合人性，又合乎规矩。",
            "laozi": "诸位的讨论似乎都在\"有为\"之中。但真正的智慧是否在于\"无为\"？道可道，非常道。关于\"\(topic)\"，我们是否问错了问题？",
            "kant": "我建议我们用纯粹理性来审视这个问题。\"\(topic)\"——这涉及到先验综合判断。我们需要区分现象与物自体...",
            "nietzsche": "哈！你们又在追求\"真理\"了。但\"\(topic)\"这个问题本身，不就是弱者寻求确定性的表现吗？让我们重估一切价值！",
            "sartre": "\"\(topic)\"——这个问题的答案不在于某个客观真理，而在于我们的选择。存在先于本质，我们必须为自己的选择负责。",
            "marx": "让我们从历史唯物主义的角度来看\"\(topic)\"。这不是抽象的哲学问题,而是具体的社会经济问题。物质决定意识...",
        ]
        if let o = openings[philosopher.id] { return o }
        let firstIdea = philosopher.keyIdeas.first ?? "核心思想"
        return "作为\(philosopher.school)的代表,我认为\"\(topic)\"需要从\(firstIdea)的角度来理解。"
    }

    static func generateResponse(philosopher: Philosopher, userInput: String, topic: String) -> String {
        let slice = userInput.prefix(20)
        let slice30 = userInput.prefix(30)
        let responses: [String: String] = [
            "socrates": "有趣的观点。但让我问你：当你说\"\(slice)...\"时，你真的理解这意味着什么吗？如果我继续追问，你能一直保持这个立场吗？",
            "confucius": "你的观点中有可取之处。但是，我们是否考虑到了\"仁\"？如果这个选择不能推己及人，恐怕难以长久。",
            "laozi": "你说得很多，但也许说得太多了。\"多言数穷，不如守中。\"有时候，少做一点反而更有效。",
            "nietzsche": "你还在用\"应该\"、\"正确\"这些词吗？这些都是奴隶道德的遗毒！强者创造价值，而不是追随价值。",
            "kant": "你的论证缺乏普遍性。让我问：如果所有人都这样做，世界会怎样？这能成为普遍法则吗？",
            "sartre": "你在为你的选择寻找理由，但理由永远是后来加上的。你已经选择了，现在你必须承担责任。",
        ]
        if let r = responses[philosopher.id] { return r }
        let firstIdea = philosopher.keyIdeas.first ?? "核心思想"
        return "从\(philosopher.school)的角度看，\(slice30)...这个观点需要结合\(firstIdea)来理解。"
    }
}
