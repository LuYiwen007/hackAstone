import { hilog } from '@kit.PerformanceAnalysisKit';
import { ArenaTheme } from '../common/ArenaTheme';
import {
  catalogStore,
  localeStore,
} from '../route/GlobalStores';
import { AppRouteName, AppRoutes } from '../route/AppRoutes';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { DisciplinesPage } from './DisciplinesPage';
import { MindProfilePage } from './MindProfilePage';
import { RoundtablePage } from './RoundtablePage';
import { DilemmaPage } from './DilemmaPage';
import { BattlePage } from './BattlePage';
import { PhilosophyBattlePage } from './PhilosophyBattlePage';

const LOG_DOMAIN = 0x0000;

/** 应用根导航：Home 常驻底层，Navigation 仅承载 push 的子页面。 */
@Entry
@Component
struct Index {
  @State pageStack: NavPathStack = new NavPathStack();

  @Builder
  pageMap(name: string, _param: Object) {
    if (name === AppRouteName.LOGIN) {
      LoginPage({ pageStack: this.pageStack });
    } else if (name === AppRouteName.DISCIPLINES) {
      DisciplinesPage({ pageStack: this.pageStack });
    } else if (name === AppRouteName.PROFILE) {
      MindProfilePage({ pageStack: this.pageStack });
    } else if (name === AppRouteName.ROUNDTABLE) {
      RoundtablePage({ pageStack: this.pageStack });
    } else if (name === AppRouteName.DILEMMA) {
      DilemmaPage({ pageStack: this.pageStack });
    } else if (name.startsWith(`${AppRouteName.BATTLE}/`)) {
      BattlePage({
        pageStack: this.pageStack,
        battleId: AppRoutes.parseBattleId(name) ?? '',
      });
    } else if (name.startsWith(`${AppRouteName.PHILOSOPHY_BATTLE}/`)) {
      PhilosophyBattlePage({
        pageStack: this.pageStack,
        philosopherId: AppRoutes.parsePhilosophyBattleId(name) ?? '',
      });
    } else {
      Column() {
        Text(`Unknown route: ${name}`)
          .fontColor(ArenaTheme.textMuted);
      }
      .width('100%')
      .height('100%')
      .backgroundColor(ArenaTheme.background);
    }
  }

  aboutToAppear(): void {
    hilog.info(LOG_DOMAIN, 'hackAstone', 'Index aboutToAppear v1.0.3');
    localeStore.refreshFromSystem();
    catalogStore.reload(localeStore.catalogLocale);
  }

  build() {
    Stack() {
      HomePage({ pageStack: this.pageStack })

      Navigation(this.pageStack) {
        Column()
          .width(0)
          .height(0)
      }
      .mode(NavigationMode.Stack)
      .navDestination(this.pageMap)
      .hideNavBar(true)
      .hideTitleBar(true)
      .width('100%')
      .height('100%')
      .backgroundColor(Color.Transparent)
      .hitTestBehavior(HitTestMode.Transparent)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }
}
