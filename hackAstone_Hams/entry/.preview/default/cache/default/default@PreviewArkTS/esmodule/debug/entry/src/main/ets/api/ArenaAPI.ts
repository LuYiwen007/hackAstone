import http from "@ohos:net.http";
import type { Battle, DebateTopicContent, MindProfilePayload, Philosopher } from '../common/ArenaModels';
import { ArenaBilingualParsing, } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaBilingualParsing";
import type { DilemmaSummaryBilingualParsed, DilemmaTurnBilingualParsed, DisciplineBattleBilingualParsed, DisciplineDualReplyParsed, DisciplineSummaryBilingualParsed, RoundtableMessagesBilingualParsed } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaBilingualParsing";
import { JsonBody, JsonPayload } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { AuthSessionData } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import type { AuthSession } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import { ApiError } from "@bundle:com.hackastone.arena/entry/ets/api/ApiError";
import { httpRequest, httpUploadAvatar, parseEnvelope } from "@bundle:com.hackastone.arena/entry/ets/api/HttpClient";
import { apiPostStream, AgentStreamHandlers } from "@bundle:com.hackastone.arena/entry/ets/api/StreamClient";
import type { StreamDeltaHandler } from "@bundle:com.hackastone.arena/entry/ets/api/StreamClient";
interface JudgeStepStreamDTO {
    judgeSpeaks?: boolean;
    judgeMessage?: string;
    judgeQuestion?: string;
    addressTo?: string;
    continueDebate?: boolean;
}
interface JudgeMetaDTO {
    addressTo?: string;
    continueDebate?: boolean;
}
export class PhilosophyJudgeStepParsed {
    judgeSpeaks: boolean = false;
    judgeMessage: string = '';
    addressTo: string | null = null;
    continueDebate: boolean = true;
    constructor(judgeSpeaks: boolean, judgeMessage: string, addressTo: string | null, continueDebate: boolean) {
        this.judgeSpeaks = judgeSpeaks;
        this.judgeMessage = judgeMessage;
        this.addressTo = addressTo;
        this.continueDebate = continueDebate;
    }
    static from(structured: Object | null | undefined, fallbackText: string): PhilosophyJudgeStepParsed | null {
        if (structured !== null && structured !== undefined && typeof structured === 'object') {
            return PhilosophyJudgeStepParsed.fromDictionary(structured as Record<string, Object>);
        }
        return PhilosophyJudgeStepParsed.fromPlainText(fallbackText);
    }
    private static fromDictionary(o: Record<string, Object>): PhilosophyJudgeStepParsed | null {
        const speaks = o['judgeSpeaks'] === true;
        const msg = String(o['judgeMessage'] ?? '').trim();
        const addressRaw = String(o['addressTo'] ?? '').trim().toLowerCase();
        const cont = o['continueDebate'] !== false;
        if (speaks && msg.length === 0) {
            return null;
        }
        if (!speaks) {
            return new PhilosophyJudgeStepParsed(false, '', null, cont);
        }
        const at = addressRaw === 'philosopher' ? 'philosopher' : 'user';
        return new PhilosophyJudgeStepParsed(true, msg, at, cont);
    }
    private static fromPlainText(full: string): PhilosophyJudgeStepParsed | null {
        const trimmed = full.trim();
        if (trimmed.length === 0 || trimmed === '[NO_JUDGE]') {
            return new PhilosophyJudgeStepParsed(false, '', null, true);
        }
        const dto = JsonPayload.parse<JudgeStepStreamDTO>(trimmed);
        if (dto !== null) {
            const msg = String(dto.judgeMessage ?? dto.judgeQuestion ?? '').trim();
            const speaks = dto.judgeSpeaks === true || msg.length > 0;
            if (speaks && msg.length === 0) {
                return null;
            }
            if (!speaks) {
                return new PhilosophyJudgeStepParsed(false, '', null, dto.continueDebate !== false);
            }
            let at = String(dto.addressTo ?? '').toLowerCase();
            if (at !== 'user' && at !== 'philosopher') {
                at = 'user';
            }
            return new PhilosophyJudgeStepParsed(true, msg, at, dto.continueDebate !== false);
        }
        let messagePart = trimmed;
        let addressTo = 'user';
        let continueDebate = true;
        const metaIdx = trimmed.lastIndexOf('\nMETA:');
        if (metaIdx >= 0) {
            messagePart = trimmed.substring(0, metaIdx).trim();
            const metaJson = trimmed.substring(metaIdx + '\nMETA:'.length).replace(/^META:/, '').trim();
            const meta = JsonPayload.parse<JudgeMetaDTO>(metaJson);
            if (meta !== null) {
                const at = String(meta.addressTo ?? '').toLowerCase();
                if (at === 'user' || at === 'philosopher') {
                    addressTo = at;
                }
                if (meta.continueDebate === false) {
                    continueDebate = false;
                }
            }
        }
        if (messagePart.length === 0 || messagePart === '[NO_JUDGE]') {
            return new PhilosophyJudgeStepParsed(false, '', null, continueDebate);
        }
        return new PhilosophyJudgeStepParsed(true, messagePart, addressTo, continueDebate);
    }
}
export class AgentRunResponse {
    agent: string = 'echo';
    appId: string = '';
    text: string = '';
    cached: boolean = false;
    dilemmaTurn: DilemmaTurnBilingualParsed | null = null;
    dilemmaSummary: DilemmaSummaryBilingualParsed | null = null;
    roundtableMessages: RoundtableMessagesBilingualParsed | null = null;
    disciplineBattle: DisciplineBattleBilingualParsed | null = null;
    disciplineDual: DisciplineDualReplyParsed | null = null;
    disciplineSummary: DisciplineSummaryBilingualParsed | null = null;
    philosophyJudge: PhilosophyJudgeStepParsed | null = null;
    debateTopic: DebateTopicContent | null = null;
    static fromDictionary(o: Record<string, Object>): AgentRunResponse {
        const text = String(o['text'] ?? '');
        let topic: DebateTopicContent | null = null;
        const dt = o['debateTopic'];
        if (dt !== undefined && dt !== null) {
            topic = JSON.parse(JSON.stringify(dt)) as DebateTopicContent;
        }
        const resp = new AgentRunResponse();
        resp.agent = String(o['agent'] ?? 'echo');
        resp.appId = String(o['appId'] ?? '');
        resp.text = text;
        resp.cached = o['cached'] === true;
        resp.dilemmaTurn = ArenaBilingualParsing.parseDilemmaTurn(text, o['dilemmaTurn']);
        resp.dilemmaSummary = ArenaBilingualParsing.parseDilemmaSummary(text, o['dilemmaSummary']);
        resp.roundtableMessages = ArenaBilingualParsing.parseRoundtableMessages(text, o['roundtableMessages']);
        resp.disciplineBattle = ArenaBilingualParsing.parseDisciplineBattle(text, o['battle']);
        resp.disciplineDual = ArenaBilingualParsing.parseDisciplineDual(text, o['disciplineDual']);
        resp.disciplineSummary = ArenaBilingualParsing.parseDisciplineSummary(text, o['disciplineSummary']);
        resp.philosophyJudge = PhilosophyJudgeStepParsed.from(o['philosophyJudge'], text);
        resp.debateTopic = topic;
        return resp;
    }
}
export class UserSettingsPreferencesDTO {
    autoSave?: boolean;
    sound?: boolean;
    timer?: boolean;
    compact?: boolean;
    animations?: boolean;
}
export class UserSettingsNotificationsDTO {
    daily?: boolean;
    weekly?: boolean;
    updates?: boolean;
}
export class UserSettingsAppearanceDTO {
    theme?: string;
}
export class UserSettingsDTO {
    locale?: string;
    preferences?: UserSettingsPreferencesDTO;
    notifications?: UserSettingsNotificationsDTO;
    appearance?: UserSettingsAppearanceDTO;
}
export class UserProfileDTO {
    userId: string = '';
    email?: string;
    nickname: string = '';
    avatarUrl?: string;
    settings?: UserSettingsDTO;
}
export class CatalogPartsResult {
    philosophers: Philosopher[] = [];
    battles: Battle[] = [];
    debateTopics: Record<string, DebateTopicContent> = {};
}
export class ArenaAPI {
    static async register(email: string, password: string, nickname: string): Promise<string> {
        const body = new JsonBody()
            .put('email', email)
            .put('password', password)
            .put('nickname', nickname)
            .build();
        const raw = await httpRequest('/user/register', http.RequestMethod.POST, body);
        const inner = parseEnvelope(raw) as Record<string, Object>;
        return String(inner['userId'] ?? '');
    }
    static async login(account: string, password: string): Promise<AuthSession> {
        const body = new JsonBody()
            .put('account', account)
            .put('password', password)
            .build();
        const raw = await httpRequest('/user/login', http.RequestMethod.POST, body);
        const inner = parseEnvelope(raw) as Record<string, Object>;
        const token = inner['token'];
        const userId = inner['userId'];
        if (typeof token !== 'string' || typeof userId !== 'string') {
            throw ApiError.decode();
        }
        const session = new AuthSessionData();
        session.token = token;
        session.userId = userId;
        session.nickname = String(inner['nickname'] ?? '');
        if (inner['email'] !== undefined) {
            session.email = String(inner['email']);
        }
        return session;
    }
    static async fetchCurrentUser(): Promise<UserProfileDTO> {
        const raw = await httpRequest('/user/me', http.RequestMethod.GET);
        const inner = parseEnvelope(raw);
        return JSON.parse(JSON.stringify(inner)) as UserProfileDTO;
    }
    static async updateProfile(nickname: string): Promise<UserProfileDTO> {
        const body = new JsonBody().put('nickname', nickname).build();
        const raw = await httpRequest('/user/profile', http.RequestMethod.PUT, body);
        const inner = parseEnvelope(raw);
        return JSON.parse(JSON.stringify(inner)) as UserProfileDTO;
    }
    static async updateSettings(jsonBody: Record<string, Object>): Promise<UserSettingsDTO> {
        const raw = await httpRequest('/user/settings', http.RequestMethod.PUT, jsonBody);
        const inner = parseEnvelope(raw) as Record<string, Object>;
        const settings = inner['settings'];
        if (settings === undefined) {
            throw ApiError.decode();
        }
        return JSON.parse(JSON.stringify(settings)) as UserSettingsDTO;
    }
    static async uploadAvatar(jpegData: ArrayBuffer): Promise<UserProfileDTO> {
        const raw = await httpUploadAvatar(jpegData);
        const inner = parseEnvelope(raw);
        return JSON.parse(JSON.stringify(inner)) as UserProfileDTO;
    }
    static async fetchCatalogParts(locale: string = 'en'): Promise<CatalogPartsResult> {
        const loc = locale.startsWith('zh') ? 'zh' : 'en';
        const raw = await httpRequest(`/arena/catalog?locale=${loc}`, http.RequestMethod.GET);
        const inner = parseEnvelope(raw) as Record<string, Object>;
        return ArenaAPI.decodeCatalogDictionary(inner);
    }
    static async fetchMindProfile(locale: string = 'en'): Promise<MindProfilePayload> {
        const loc = locale.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        const raw = await httpRequest(`/arena/profile?locale=${loc}`, http.RequestMethod.GET);
        const inner = parseEnvelope(raw);
        return JSON.parse(JSON.stringify(inner)) as MindProfilePayload;
    }
    static async saveBattleRecord(battleType: string, topic: string, userChoice: string, judgeSummary: string, changedStance: boolean, messages?: Array<Record<string, string>>, profileI18n?: Record<string, Object>): Promise<void> {
        const body = new JsonBody()
            .put('battleType', battleType)
            .put('topic', topic)
            .put('userChoice', userChoice)
            .put('judgeSummary', judgeSummary)
            .put('changedStance', changedStance);
        if (messages !== undefined) {
            body.put('messages', messages);
        }
        if (profileI18n !== undefined) {
            body.put('profileI18n', profileI18n);
        }
        await httpRequest('/arena/battle/record', http.RequestMethod.POST, body.build());
    }
    static async fetchDebateNote(sourceType: string, sourceKey: string): Promise<string | null> {
        const encKey = encodeURIComponent(sourceKey);
        const raw = await httpRequest(`/arena/notes?sourceType=${sourceType}&sourceKey=${encKey}`, http.RequestMethod.GET);
        const inner = parseEnvelope(raw) as Record<string, Object>;
        const content = inner['content'];
        if (typeof content !== 'string' || content.length === 0) {
            return null;
        }
        return content;
    }
    static async saveDebateNote(sourceType: string, sourceKey: string, topic: string, content: string): Promise<void> {
        const body = new JsonBody()
            .put('sourceType', sourceType)
            .put('sourceKey', sourceKey)
            .put('topic', topic)
            .put('content', content)
            .build();
        await httpRequest('/arena/notes', http.RequestMethod.POST, body);
    }
    private static async requestAgentStream(path: string, jsonBody: Record<string, Object>, onDelta?: StreamDeltaHandler): Promise<Record<string, Object>> {
        const handlers = new AgentStreamHandlers();
        handlers.onDelta = onDelta;
        return apiPostStream(path, jsonBody, handlers);
    }
    static async runEcho(query: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        return ArenaAPI.runAgent('echo', query, [], onDelta);
    }
    static async generateTopic(philosopherName: string, philosopherSchool: string, keyIdeas: string[], locale: string = 'en', onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('keyIdeas', keyIdeas.join('。'))
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/topic/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async generateDisciplineBattle(categoryEn: string, categoryZh: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('categoryEn', categoryEn)
            .put('categoryZh', categoryZh)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/discipline/battle/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDisciplineDebateOpponent(question: string, builderView: string, breakerView: string, userChoice: string, userMessage: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('question', question)
            .put('builderView', builderView)
            .put('breakerView', breakerView)
            .put('userChoice', userChoice)
            .put('userMessage', userMessage)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/discipline/debate/opponent/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDisciplineDebateDual(question: string, builderView: string, breakerView: string, userMessage: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('question', question)
            .put('builderView', builderView)
            .put('breakerView', breakerView)
            .put('userChoice', 'uncertain')
            .put('userMessage', userMessage)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/discipline/debate/dual/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDisciplineDebateSummary(question: string, builderView: string, breakerView: string, userChoice: string, history: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('question', question)
            .put('builderView', builderView)
            .put('breakerView', breakerView)
            .put('userChoice', userChoice)
            .put('history', history)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/discipline/debate/summary/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async runAgent(agent: string, query: string, imageList: string[] = [], onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('agent', agent)
            .put('query', query)
            .put('imageList', imageList)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/run/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async generateRoundtableOpenings(topic: string, participants: Array<Record<string, Object>>, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('topic', topic)
            .put('participants', participants)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/roundtable/openings/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamPhilosophyPhilosopherToUser(debateQuestion: string, philosopherId: string, philosopherName: string, school: string, keyIdeas: string, summary: string, userStance: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('debateQuestion', debateQuestion)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('school', school)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('userStance', userStance)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/philosophy/philosopher/to-user/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamPhilosophyJudgeStep(debateQuestion: string, philosopherName: string, school: string, userStance: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('debateQuestion', debateQuestion)
            .put('philosopherName', philosopherName)
            .put('school', school)
            .put('userStance', userStance)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/philosophy/judge/step/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamPhilosophyPhilosopherToJudge(debateQuestion: string, philosopherId: string, philosopherName: string, school: string, keyIdeas: string, summary: string, userStance: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('debateQuestion', debateQuestion)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('school', school)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('userStance', userStance)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/philosophy/philosopher/to-judge/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamRoundtablePhilosopherOpening(topic: string, philosopherId: string, philosopherName: string, school: string, keyIdeas: string, summary: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('topic', topic)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('school', school)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/roundtable/philosopher/opening/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamRoundtablePhilosopherReply(topic: string, userInput: string, philosopherId: string, philosopherName: string, school: string, keyIdeas: string, summary: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('topic', topic)
            .put('userInput', userInput)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('school', school)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/roundtable/philosopher/reply/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async generateRoundtableReply(topic: string, userInput: string, participants: Array<Record<string, Object>>, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('topic', topic)
            .put('userInput', userInput)
            .put('participants', participants)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/roundtable/reply/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDilemmaPhilosopherToUser(moralDilemmaTitle: string, moralDilemmaEnglishTitle: string, question: string, promptLead: string, userStance: string, philosopherId: string, philosopherName: string, philosopherSchool: string, keyIdeas: string, summary: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('moralDilemmaTitle', moralDilemmaTitle)
            .put('moralDilemmaEnglishTitle', moralDilemmaEnglishTitle)
            .put('question', question)
            .put('promptLead', promptLead)
            .put('userStance', userStance)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/dilemma/philosopher/to-user/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDilemmaJudgeStep(moralDilemmaTitle: string, moralDilemmaEnglishTitle: string, question: string, promptLead: string, userStance: string, philosopherName: string, philosopherSchool: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('moralDilemmaTitle', moralDilemmaTitle)
            .put('moralDilemmaEnglishTitle', moralDilemmaEnglishTitle)
            .put('question', question)
            .put('promptLead', promptLead)
            .put('userStance', userStance)
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/dilemma/judge/step/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async streamDilemmaPhilosopherToJudge(moralDilemmaTitle: string, moralDilemmaEnglishTitle: string, question: string, promptLead: string, userStance: string, philosopherId: string, philosopherName: string, philosopherSchool: string, keyIdeas: string, summary: string, history: string, locale: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('moralDilemmaTitle', moralDilemmaTitle)
            .put('moralDilemmaEnglishTitle', moralDilemmaEnglishTitle)
            .put('question', question)
            .put('promptLead', promptLead)
            .put('userStance', userStance)
            .put('philosopherId', philosopherId)
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('keyIdeas', keyIdeas)
            .put('summary', summary)
            .put('history', history)
            .put('locale', locale)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/dilemma/philosopher/to-judge/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    /** @deprecated 合并双语 JSON 单轮 */
    static async dilemmaTurn(moralDilemmaTitle: string, moralDilemmaEnglishTitle: string, question: string, promptLead: string, userStance: string, philosopherName: string, philosopherSchool: string, keyIdeas: string, history: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('moralDilemmaTitle', moralDilemmaTitle)
            .put('moralDilemmaEnglishTitle', moralDilemmaEnglishTitle)
            .put('question', question)
            .put('promptLead', promptLead)
            .put('userStance', userStance)
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('keyIdeas', keyIdeas)
            .put('history', history)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/dilemma/turn/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    static async dilemmaSummary(moralDilemmaTitle: string, question: string, userStance: string, philosopherName: string, philosopherSchool: string, history: string, onDelta?: StreamDeltaHandler): Promise<AgentRunResponse> {
        const body = new JsonBody()
            .put('moralDilemmaTitle', moralDilemmaTitle)
            .put('question', question)
            .put('userStance', userStance)
            .put('philosopherName', philosopherName)
            .put('philosopherSchool', philosopherSchool)
            .put('history', history)
            .build();
        const inner = await ArenaAPI.requestAgentStream('/arena/agent/dilemma/summary/stream', body, onDelta);
        return AgentRunResponse.fromDictionary(inner);
    }
    private static decodeArray<T>(anyVal: Object | undefined): T[] {
        if (anyVal === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(anyVal)) as T[];
    }
    private static decodeDebateTopics(anyVal: Object | undefined): Record<string, DebateTopicContent> {
        if (anyVal === undefined || typeof anyVal !== 'object') {
            return {};
        }
        const dict = anyVal as Record<string, Object>;
        const out: Record<string, DebateTopicContent> = {};
        const keys = Object.keys(dict);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            out[k] = JSON.parse(JSON.stringify(dict[k])) as DebateTopicContent;
        }
        return out;
    }
    static decodeCatalogDictionary(inner: Record<string, Object>): CatalogPartsResult {
        const result = new CatalogPartsResult();
        result.philosophers = ArenaAPI.decodeArray<Philosopher>(inner['philosophers']);
        result.battles = ArenaAPI.decodeArray<Battle>(inner['battles']);
        result.debateTopics = ArenaAPI.decodeDebateTopics(inner['debateTopics']);
        return result;
    }
}
