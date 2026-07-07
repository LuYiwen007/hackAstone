import { preferences } from '@kit.ArkData';
import { http } from '@kit.NetworkKit';
import { buffer } from '@kit.ArkTS';
import { Battle, DebateTopicContent, Philosopher } from '../common/ArenaModels';
import { ArenaConfiguration } from '../common/ArenaConfiguration';
import { DisciplineBattleBilingualParsed } from '../common/ArenaBilingualParsing';
import { AuthStore } from './AuthStore';
import { bumpCatalogVersion } from '../common/CatalogEvents';
import { AppLocaleStore } from './AppLocaleStore';

interface StoredBattleSlice {
  question: string;
  category: string;
  builderView: string;
  breakerView: string;
  judgeQuestions: string[];
  reveal: string;
}

interface StoredGeneratedBattle {
  id: string;
  en: StoredBattleSlice;
  zh: StoredBattleSlice;
}

interface CatalogParts {
  philosophers: Philosopher[];
  battles: Battle[];
  debateTopics: Record<string, DebateTopicContent>;
}

const GENERATED_KEY = 'arena-generated-discipline-battles-v2';
const PREF_FILE = 'arena_catalog_store';

let appContext: Context | null = null;

export class ArenaCatalogStore {
  philosophers: Philosopher[] = [];
  battles: Battle[] = [];
  debateTopics: Record<string, DebateTopicContent> = {};
  catalogFromServer: boolean = false;
  catalogError: string | null = null;

  private generatedBilingual: StoredGeneratedBattle[] = [];

  static bindContext(ctx: Context): void {
    appContext = ctx;
  }

  private static prefs(): preferences.Preferences {
    if (appContext === null) {
      throw new Error('ArenaCatalogStore: context not bound');
    }
    return preferences.getPreferencesSync(appContext, { name: PREF_FILE });
  }

  allBattles(english: boolean): Battle[] {
    const generated = this.generatedBilingual.map((stored) => {
      const slice = english ? stored.en : stored.zh;
      return {
        id: stored.id,
        question: slice.question,
        category: slice.category,
        builderView: slice.builderView,
        breakerView: slice.breakerView,
        judgeQuestions: slice.judgeQuestions,
        reveal: slice.reveal,
      } as Battle;
    });
    return generated.concat(this.battles);
  }

  bootstrap(): void {
    this.generatedBilingual = ArenaCatalogStore.loadGenerated();
    const sys = AppLocaleStore.resolveSystemLanguageCode();
    const loc = sys.startsWith('zh') ? 'zh' : 'en';
    this.reload(loc);
  }

  async reload(locale: string): Promise<void> {
    const fallback = await ArenaCatalogStore.readBundledCatalogFile();
    const loc = locale.startsWith('zh') ? 'zh' : 'en';
    try {
      const parts = await ArenaCatalogStore.fetchCatalogParts(loc);
      this.philosophers = parts.philosophers;
      this.battles = parts.battles.length === 0 ? (fallback?.battles ?? []) : parts.battles;
      this.debateTopics = ArenaCatalogStore.mergeDebateTopics(
        fallback?.debateTopics ?? {},
        parts.debateTopics
      );
      this.catalogFromServer = true;
      this.catalogError = null;
    } catch (err) {
      this.catalogFromServer = false;
      this.catalogError = ArenaCatalogStore.errorMessage(err);
      if (fallback !== null) {
        this.philosophers = fallback.philosophers;
        this.battles = fallback.battles;
        this.debateTopics = fallback.debateTopics;
      }
    }
    bumpCatalogVersion();
  }

  battleForDisplay(id: string, english: boolean): Battle | null {
    const gen = this.generatedBilingual.find((item) => item.id === id);
    if (gen !== undefined) {
      const slice = english ? gen.en : gen.zh;
      return {
        id: gen.id,
        question: slice.question,
        category: slice.category,
        builderView: slice.builderView,
        breakerView: slice.breakerView,
        judgeQuestions: slice.judgeQuestions,
        reveal: slice.reveal,
      };
    }
    return this.battles.find((b) => b.id === id) ?? null;
  }

  addGeneratedBattle(bilingual: DisciplineBattleBilingualParsed): string {
    const id = `gen-${Date.now()}`;
    const stored: StoredGeneratedBattle = {
      id,
      en: {
        question: bilingual.en.question,
        category: bilingual.en.category,
        builderView: bilingual.en.builderView,
        breakerView: bilingual.en.breakerView,
        judgeQuestions: bilingual.en.judgeQuestions.slice(0, 3),
        reveal: bilingual.en.reveal,
      },
      zh: {
        question: bilingual.zh.question,
        category: bilingual.zh.category,
        builderView: bilingual.zh.builderView,
        breakerView: bilingual.zh.breakerView,
        judgeQuestions: bilingual.zh.judgeQuestions.slice(0, 3),
        reveal: bilingual.zh.reveal,
      },
    };
    this.generatedBilingual.unshift(stored);
    ArenaCatalogStore.persistGenerated(this.generatedBilingual);
    return id;
  }

  private static loadGenerated(): StoredGeneratedBattle[] {
    try {
      const raw = ArenaCatalogStore.prefs().getSync(GENERATED_KEY, '') as string;
      if (raw.length === 0) {
        return [];
      }
      return JSON.parse(raw) as StoredGeneratedBattle[];
    } catch (_e) {
      return [];
    }
  }

  private static persistGenerated(items: StoredGeneratedBattle[]): void {
    ArenaCatalogStore.prefs().putSync(GENERATED_KEY, JSON.stringify(items));
    ArenaCatalogStore.prefs().flushSync();
  }

  private static mergeDebateTopics(
    fallback: Record<string, DebateTopicContent>,
    server: Record<string, DebateTopicContent>
  ): Record<string, DebateTopicContent> {
    const merged: Record<string, DebateTopicContent> = {};
    const fallbackKeys = Object.keys(fallback);
    for (const k of fallbackKeys) {
      merged[k] = fallback[k];
    }
    const serverKeys = Object.keys(server);
    for (const k of serverKeys) {
      merged[k] = server[k];
    }
    return merged;
  }

  private static async readBundledCatalogFile(): Promise<CatalogParts | null> {
    if (appContext === null) {
      return null;
    }
    try {
      const rawBuffer = await appContext.resourceManager.getRawFileContent('fallback_catalog.json');
      const text = buffer.from(rawBuffer).toString('utf-8');
      const obj = JSON.parse(text) as Record<string, Object>;
      return ArenaCatalogStore.decodeCatalogDictionary(obj);
    } catch (_e) {
      return null;
    }
  }

  private static async fetchCatalogParts(locale: string): Promise<CatalogParts> {
    const loc = locale.startsWith('zh') ? 'zh' : 'en';
    const base = ArenaConfiguration.apiBaseURLString;
    const url = `${base}/arena/catalog?locale=${loc}`;
    const token = AuthStore.bearerToken;
    const headers: Record<string, string> = {};
    if (token !== null && token.length > 0) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const client = http.createHttp();
    try {
      const response = await client.request(url, {
        method: http.RequestMethod.GET,
        header: headers,
        expectDataType: http.HttpDataType.STRING,
        connectTimeout: 60000,
        readTimeout: 60000,
      });
      if (response.responseCode < 200 || response.responseCode > 299) {
        throw new Error(`HTTP ${response.responseCode}`);
      }
      const body = response.result as string;
      const envelope = JSON.parse(body) as Record<string, Object>;
      if (envelope['success'] !== true) {
        const msg = String(envelope['message'] ?? '请求失败');
        throw new Error(msg);
      }
      const inner = envelope['data'];
      if (inner === undefined || inner === null || typeof inner !== 'object' || Array.isArray(inner)) {
        throw new Error('数据解析失败');
      }
      return ArenaCatalogStore.decodeCatalogDictionary(inner as Record<string, Object>);
    } finally {
      client.destroy();
    }
  }

  private static decodeArray<T>(raw: Object | undefined): T[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw as T[];
  }

  private static decodeDebateTopics(raw: Object | undefined): Record<string, DebateTopicContent> {
    if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return {};
    }
    const dict = raw as Record<string, Object>;
    const out: Record<string, DebateTopicContent> = {};
    const keys = Object.keys(dict);
    for (const k of keys) {
      out[k] = dict[k] as DebateTopicContent;
    }
    return out;
  }

  private static decodeCatalogDictionary(inner: Record<string, Object>): CatalogParts {
    return {
      philosophers: ArenaCatalogStore.decodeArray<Philosopher>(inner['philosophers']),
      battles: ArenaCatalogStore.decodeArray<Battle>(inner['battles']),
      debateTopics: ArenaCatalogStore.decodeDebateTopics(inner['debateTopics']),
    };
  }

  private static errorMessage(err: Object): string {
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  }
}
