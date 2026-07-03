export interface Influences {
  influencedBy?: string[];
  influenced?: string[];
}

export interface Philosopher {
  id: string;
  name: string;
  nameCN: string;
  region: string;
  period: number;
  school: string;
  keyIdeas: string[];
  lifespan?: string;
  birthPlace?: string;
  majorWorks?: string[];
  famousQuotes?: string[];
  summary?: string;
  influences?: Influences;
}

export class PhilosopherData implements Philosopher {
  id: string = '';
  name: string = '';
  nameCN: string = '';
  region: string = '';
  period: number = 0;
  school: string = '';
  keyIdeas: string[] = [];
  lifespan?: string;
  birthPlace?: string;
  majorWorks?: string[];
  famousQuotes?: string[];
  summary?: string;
  influences?: Influences;
}

export interface RegionMeta {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface CatalogTimePeriodMeta {
  id: string;
  year: number;
  label: string;
  era: string;
  startYear?: number;
  endYear?: number;
  showAll?: boolean;
}

export interface Battle {
  id: string;
  question: string;
  category: string;
  builderView: string;
  breakerView: string;
  judgeQuestions: string[];
  reveal: string;
}

export interface DebateTopicContent {
  question: string;
  philosopherView: string;
  oppositeView: string;
  judgeQuestions: string[];
  fullExplanation?: string;
}

export interface MindProfileStat {
  label: string;
  value: string;
}

export interface MindProfileBias {
  name: string;
  description: string;
  percentage: number;
  color: string;
  instances: number;
}

export interface MindProfileRecentBattle {
  question: string;
  choice: string;
  judgeComment: string;
  changed: boolean;
}

export interface MindProfilePayload {
  biases: MindProfileBias[];
  stats: MindProfileStat[];
  recentBattles: MindProfileRecentBattle[];
}

export enum PhilosophyChoice {
  AGREE = 'agree',
  DISAGREE = 'disagree',
  UNCERTAIN = 'uncertain',
}

/** 界面主显示名：英文界面优先拉丁名，否则中文名。 */
export function philosopherDisplayName(philosopher: Philosopher, isEnglish: boolean): string {
  if (isEnglish) {
    const n = philosopher.name.trim();
    if (n.length > 0) {
      return n;
    }
  }
  return philosopher.nameCN;
}
