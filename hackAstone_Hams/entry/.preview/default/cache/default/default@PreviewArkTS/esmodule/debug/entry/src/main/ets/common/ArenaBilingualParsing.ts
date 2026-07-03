import type { Battle } from './ArenaModels';
export interface BattleLocaleSliceInit {
    question?: string;
    category?: string;
    builderView?: string;
    breakerView?: string;
    judgeQuestions?: string[];
    reveal?: string;
}
export class BattleLocaleSlice {
    question: string = '';
    category: string = '';
    builderView: string = '';
    breakerView: string = '';
    judgeQuestions: string[] = [];
    reveal: string = '';
    constructor(init?: BattleLocaleSliceInit) {
        if (init !== undefined) {
            this.question = init.question ?? '';
            this.category = init.category ?? '';
            this.builderView = init.builderView ?? '';
            this.breakerView = init.breakerView ?? '';
            this.judgeQuestions = init.judgeQuestions ?? [];
            this.reveal = init.reveal ?? '';
        }
    }
    toBattle(id: string): Battle {
        const battle: Battle = {
            id: id,
            question: this.question,
            category: this.category,
            builderView: this.builderView,
            breakerView: this.breakerView,
            judgeQuestions: this.judgeQuestions,
            reveal: this.reveal,
        };
        return battle;
    }
}
export class DisciplineSummaryBilingualParsed {
    en: string = '';
    zh: string = '';
    constructor(en: string, zh: string) {
        this.en = en;
        this.zh = zh;
    }
}
export class DisciplineDualReplyParsed {
    builder: string = '';
    breaker: string = '';
    constructor(builder: string, breaker: string) {
        this.builder = builder;
        this.breaker = breaker;
    }
}
export class DisciplineBattleBilingualParsed {
    en: BattleLocaleSlice = new BattleLocaleSlice();
    zh: BattleLocaleSlice = new BattleLocaleSlice();
    constructor(en: BattleLocaleSlice, zh: BattleLocaleSlice) {
        this.en = en;
        this.zh = zh;
    }
}
export class DilemmaTurnSliceParsed {
    philosopherReply: string = '';
    judgeQuestion: string = '';
    continueDebate: boolean = true;
    constructor(philosopherReply: string, judgeQuestion: string, continueDebate: boolean) {
        this.philosopherReply = philosopherReply;
        this.judgeQuestion = judgeQuestion;
        this.continueDebate = continueDebate;
    }
}
export class DilemmaTurnBilingualParsed {
    en: DilemmaTurnSliceParsed = new DilemmaTurnSliceParsed('', '', true);
    zh: DilemmaTurnSliceParsed = new DilemmaTurnSliceParsed('', '', true);
    constructor(en: DilemmaTurnSliceParsed, zh: DilemmaTurnSliceParsed) {
        this.en = en;
        this.zh = zh;
    }
    pick(english: boolean): DilemmaTurnSliceParsed {
        return english ? this.en : this.zh;
    }
}
export class DilemmaSummaryBilingualParsed {
    en: string = '';
    zh: string = '';
    constructor(en: string, zh: string) {
        this.en = en;
        this.zh = zh;
    }
    pick(english: boolean): string {
        return english ? this.en : this.zh;
    }
}
export class RoundtableMessageSlice {
    speaker: string = '';
    content: string = '';
    constructor(speaker: string, content: string) {
        this.speaker = speaker;
        this.content = content;
    }
}
export class RoundtableMessagesBilingualParsed {
    en: RoundtableMessageSlice[] = [];
    zh: RoundtableMessageSlice[] = [];
    constructor(en: RoundtableMessageSlice[], zh: RoundtableMessageSlice[]) {
        this.en = en;
        this.zh = zh;
    }
    pick(english: boolean): RoundtableMessageSlice[] {
        return english ? this.en : this.zh;
    }
}
export class ArenaBilingualParsing {
    private static pickLocaleBlock(root: Record<string, Object>, keys: string[]): Record<string, Object> | undefined {
        for (const key of keys) {
            const v = root[key];
            if (v !== undefined && v !== null && typeof v === 'object' && !Array.isArray(v)) {
                return v as Record<string, Object>;
            }
        }
        const lower = new Set(keys.map((k) => k.toLowerCase()));
        for (const k of Object.keys(root)) {
            if (lower.has(k.toLowerCase())) {
                const v = root[k];
                if (v !== undefined && v !== null && typeof v === 'object' && !Array.isArray(v)) {
                    return v as Record<string, Object>;
                }
            }
        }
        return undefined;
    }
    private static str(v: Object | undefined): string {
        if (v === undefined || v === null) {
            return '';
        }
        return String(v).trim();
    }
    private static normalizeBattleSlice(raw: Object | null | undefined): BattleLocaleSlice | null {
        if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const o = raw as Record<string, Object>;
        const judgeRaw = o['judgeQuestions'] ?? o['judge_questions'];
        let judgeQuestions: string[] = [];
        if (Array.isArray(judgeRaw)) {
            judgeQuestions = judgeRaw
                .map((item: Object) => String(item).trim())
                .filter((item: string) => item.length > 0);
        }
        const slice = new BattleLocaleSlice({
            question: ArenaBilingualParsing.str(o['question']),
            category: ArenaBilingualParsing.str(o['category'] || 'General'),
            builderView: ArenaBilingualParsing.str(o['builderView'] ?? o['builder_view']),
            breakerView: ArenaBilingualParsing.str(o['breakerView'] ?? o['breaker_view']),
            judgeQuestions,
            reveal: ArenaBilingualParsing.str(o['reveal']),
        });
        if (slice.question.length === 0 || slice.builderView.length === 0 || slice.breakerView.length === 0) {
            return null;
        }
        return slice;
    }
    static parseDisciplineBattle(sourceText: string, structured: Object | null): DisciplineBattleBilingualParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const parsed = ArenaBilingualParsing.parseDisciplineBattleDict(structured as Record<string, Object>);
            if (parsed !== null) {
                return parsed;
            }
        }
        try {
            const root = JSON.parse(sourceText) as Record<string, Object>;
            return ArenaBilingualParsing.parseDisciplineBattleDict(root);
        }
        catch (_e) {
            return null;
        }
    }
    private static parseDisciplineBattleDict(root: Record<string, Object>): DisciplineBattleBilingualParsed | null {
        const directEn = ArenaBilingualParsing.normalizeBattleSlice(root['en']);
        const directZh = ArenaBilingualParsing.normalizeBattleSlice(root['zh']);
        if (directEn !== null && directZh !== null) {
            return new DisciplineBattleBilingualParsed(directEn, directZh);
        }
        const en = ArenaBilingualParsing.normalizeBattleSlice(ArenaBilingualParsing.pickLocaleBlock(root, ['en', 'english']));
        const zh = ArenaBilingualParsing.normalizeBattleSlice(ArenaBilingualParsing.pickLocaleBlock(root, ['zh', 'chinese', 'cn']));
        if (en !== null && zh !== null) {
            return new DisciplineBattleBilingualParsed(en, zh);
        }
        const single = ArenaBilingualParsing.normalizeBattleSlice(root);
        if (single !== null) {
            return new DisciplineBattleBilingualParsed(single, single);
        }
        return null;
    }
    static parseDilemmaTurn(sourceText: string, structured: Object | null): DilemmaTurnBilingualParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const p = ArenaBilingualParsing.parseDilemmaTurnDict(structured as Record<string, Object>);
            if (p !== null) {
                return p;
            }
        }
        try {
            const root = JSON.parse(sourceText) as Record<string, Object>;
            return ArenaBilingualParsing.parseDilemmaTurnDict(root);
        }
        catch (_e) {
            return null;
        }
    }
    private static sliceDilemmaTurn(raw: Object | undefined): DilemmaTurnSliceParsed | null {
        if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const o = raw as Record<string, Object>;
        const pr = ArenaBilingualParsing.str(o['philosopherReply']);
        const jq = ArenaBilingualParsing.str(o['judgeQuestion']);
        if (pr.length === 0 || jq.length === 0) {
            return null;
        }
        const cont = typeof o['continueDebate'] === 'boolean' ? (o['continueDebate'] as boolean) : true;
        return new DilemmaTurnSliceParsed(pr, jq, cont);
    }
    private static parseDilemmaTurnDict(root: Record<string, Object>): DilemmaTurnBilingualParsed | null {
        const directEn = ArenaBilingualParsing.sliceDilemmaTurn(root['en']);
        const directZh = ArenaBilingualParsing.sliceDilemmaTurn(root['zh']);
        if (directEn !== null && directZh !== null) {
            return new DilemmaTurnBilingualParsed(directEn, directZh);
        }
        const en = ArenaBilingualParsing.sliceDilemmaTurn(ArenaBilingualParsing.pickLocaleBlock(root, ['en', 'english']));
        const zh = ArenaBilingualParsing.sliceDilemmaTurn(ArenaBilingualParsing.pickLocaleBlock(root, ['zh', 'chinese', 'cn']));
        if (en !== null && zh !== null) {
            return new DilemmaTurnBilingualParsed(en, zh);
        }
        const single = ArenaBilingualParsing.sliceDilemmaTurn(root);
        if (single !== null) {
            return new DilemmaTurnBilingualParsed(single, single);
        }
        return null;
    }
    static parseDilemmaSummary(sourceText: string, structured: Object | null): DilemmaSummaryBilingualParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const p = ArenaBilingualParsing.parseDilemmaSummaryDict(structured as Record<string, Object>);
            if (p !== null) {
                return p;
            }
        }
        try {
            const root = JSON.parse(sourceText) as Record<string, Object>;
            return ArenaBilingualParsing.parseDilemmaSummaryDict(root);
        }
        catch (_e) {
            return null;
        }
    }
    private static explanation(raw: Object | undefined): string | null {
        if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const o = raw as Record<string, Object>;
        const fe = ArenaBilingualParsing.str(o['fullExplanation']);
        return fe.length === 0 ? null : fe;
    }
    private static parseDilemmaSummaryDict(root: Record<string, Object>): DilemmaSummaryBilingualParsed | null {
        const directEn = ArenaBilingualParsing.explanation(root['en']);
        const directZh = ArenaBilingualParsing.explanation(root['zh']);
        if (directEn !== null && directZh !== null) {
            return new DilemmaSummaryBilingualParsed(directEn, directZh);
        }
        const en = ArenaBilingualParsing.explanation(ArenaBilingualParsing.pickLocaleBlock(root, ['en', 'english']));
        const zh = ArenaBilingualParsing.explanation(ArenaBilingualParsing.pickLocaleBlock(root, ['zh', 'chinese', 'cn']));
        if (en !== null && zh !== null) {
            return new DilemmaSummaryBilingualParsed(en, zh);
        }
        const fe = ArenaBilingualParsing.str(root['fullExplanation']);
        if (fe.length > 0) {
            return new DilemmaSummaryBilingualParsed(fe, fe);
        }
        return null;
    }
    static parseRoundtableMessages(sourceText: string, structured: Object | null): RoundtableMessagesBilingualParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const p = ArenaBilingualParsing.parseRoundtableDict(structured as Record<string, Object>);
            if (p !== null) {
                return p;
            }
        }
        try {
            const root = JSON.parse(sourceText) as Record<string, Object>;
            return ArenaBilingualParsing.parseRoundtableDict(root);
        }
        catch (_e) {
            return null;
        }
    }
    private static messages(raw: Object | undefined): RoundtableMessageSlice[] | null {
        if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const o = raw as Record<string, Object>;
        const arr = o['messages'];
        if (!Array.isArray(arr)) {
            return null;
        }
        const mapped: RoundtableMessageSlice[] = [];
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i] as Object;
            if (item === null || typeof item !== 'object' || Array.isArray(item)) {
                continue;
            }
            const row = item as Record<string, Object>;
            const speaker = ArenaBilingualParsing.str(row['speaker']);
            const content = ArenaBilingualParsing.str(row['content']);
            if (speaker.length > 0 && content.length > 0) {
                mapped.push(new RoundtableMessageSlice(speaker, content));
            }
        }
        return mapped.length === 0 ? null : mapped;
    }
    private static parseRoundtableDict(root: Record<string, Object>): RoundtableMessagesBilingualParsed | null {
        const directEn = ArenaBilingualParsing.messages(root['en']);
        const directZh = ArenaBilingualParsing.messages(root['zh']);
        if (directEn !== null && directZh !== null) {
            return new RoundtableMessagesBilingualParsed(directEn, directZh);
        }
        const en = ArenaBilingualParsing.messages(ArenaBilingualParsing.pickLocaleBlock(root, ['en', 'english']));
        const zh = ArenaBilingualParsing.messages(ArenaBilingualParsing.pickLocaleBlock(root, ['zh', 'chinese', 'cn']));
        if (en !== null && zh !== null) {
            return new RoundtableMessagesBilingualParsed(en, zh);
        }
        const single = ArenaBilingualParsing.messages(root);
        if (single !== null) {
            return new RoundtableMessagesBilingualParsed(single, single);
        }
        return null;
    }
    static parseDisciplineSummary(sourceText: string, structured: Object | null): DisciplineSummaryBilingualParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const p = ArenaBilingualParsing.parseDisciplineSummaryDict(structured as Record<string, Object>);
            if (p !== null) {
                return p;
            }
        }
        try {
            const root = JSON.parse(sourceText) as Record<string, Object>;
            return ArenaBilingualParsing.parseDisciplineSummaryDict(root);
        }
        catch (_e) {
            return null;
        }
    }
    private static summary(raw: Object | undefined): string | null {
        if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const o = raw as Record<string, Object>;
        const s = ArenaBilingualParsing.str(o['summary'] ?? o['reveal'] ?? o['fullExplanation']);
        return s.length === 0 ? null : s;
    }
    private static parseDisciplineSummaryDict(root: Record<string, Object>): DisciplineSummaryBilingualParsed | null {
        const directEn = ArenaBilingualParsing.summary(root['en']);
        const directZh = ArenaBilingualParsing.summary(root['zh']);
        if (directEn !== null && directZh !== null) {
            return new DisciplineSummaryBilingualParsed(directEn, directZh);
        }
        const en = ArenaBilingualParsing.summary(ArenaBilingualParsing.pickLocaleBlock(root, ['en', 'english']));
        const zh = ArenaBilingualParsing.summary(ArenaBilingualParsing.pickLocaleBlock(root, ['zh', 'chinese', 'cn']));
        if (en !== null && zh !== null) {
            return new DisciplineSummaryBilingualParsed(en, zh);
        }
        const single = ArenaBilingualParsing.summary(root);
        if (single !== null) {
            return new DisciplineSummaryBilingualParsed(single, single);
        }
        return null;
    }
    static parseDisciplineDual(sourceText: string, structured: Object | null): DisciplineDualReplyParsed | null {
        if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) {
            const dict = structured as Record<string, Object>;
            const b = dict['builder'];
            const k = dict['breaker'];
            if (typeof b === 'string' && typeof k === 'string') {
                const builder = b.trim();
                const breaker = k.trim();
                if (builder.length > 0 && breaker.length > 0) {
                    return new DisciplineDualReplyParsed(builder, breaker);
                }
            }
        }
        return ArenaBilingualParsing.parseDisciplineDualMarkers(ArenaBilingualParsing.finalizeStreamSpeech(sourceText));
    }
    static finalizeStreamSpeech(raw: string): string {
        const trimmed = raw.trim();
        if (!trimmed.startsWith('{')) {
            return trimmed;
        }
        try {
            const o = JSON.parse(trimmed) as Record<string, Object>;
            const c = o['content'];
            if (typeof c === 'string' && c.length > 0) {
                return c;
            }
        }
        catch (_e) {
            // fall through
        }
        return trimmed;
    }
    private static parseDisciplineDualMarkers(sourceText: string): DisciplineDualReplyParsed | null {
        const patternBuilder = /^\s*(?:\[Builder\]|【建构者】|建构者[:：])\s*/m;
        const patternBreaker = /^\s*(?:\[Breaker\]|【破坏者】|破坏者[:：])\s*/m;
        const bMatch = patternBuilder.exec(sourceText);
        const kMatch = patternBreaker.exec(sourceText);
        if (bMatch === null || kMatch === null || bMatch.index === undefined || kMatch.index === undefined) {
            return null;
        }
        if (bMatch.index >= kMatch.index) {
            return null;
        }
        const builderStart = bMatch.index + bMatch[0].length;
        const builderText = sourceText.substring(builderStart, kMatch.index).trim();
        const breakerStart = kMatch.index + kMatch[0].length;
        const breakerText = sourceText.substring(breakerStart).trim();
        if (builderText.length === 0 || breakerText.length === 0) {
            return null;
        }
        return new DisciplineDualReplyParsed(builderText, breakerText);
    }
    static buildDebateNoteKey(philosopherId: string, question: string): string {
        return `${philosopherId}|${question.trim()}`;
    }
}
