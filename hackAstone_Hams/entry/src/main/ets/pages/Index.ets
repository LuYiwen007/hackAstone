import { hilog } from '@kit.PerformanceAnalysisKit';
import { ArenaTheme } from '../common/ArenaTheme';
import {
  catalogStore,
  localeStore,
  appPageStack,
} from '../route/GlobalStores';
import { NAV_OVERLAY_KEY } from '../common/NavOverlayEvents';
import { AppRouteName, AppRoutes } from '../route/AppRoutes';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { DisciplinesPage } from './DisciplinesPage';
import { MindProfilePage } from './MindProfilePage';
import { RoundtablePage } from './RoundtablePage';
import { DilemmaPage } from './DilemmaPage';
import { BattlePage } from './BattlePage';
import { PhilosophyBattlePage } from './PhilosophyBattlePage';
import { AccountSettingsPage } from './AccountSettingsPage';

const LOG_DOMAIN = 0x0000;

/** 应用根导航：Navigation 持有唯一 NavPathStack，子页经 navDestination 推入。 */
@Entry
@Component
struct Index {
  @StorageLink(NAV_OVERLAY_KEY) navHasOverlay: boolean = false;

  @Builder
  pageMap(name: string, _param: Object) {
    if (name === AppRouteName.LOGIN) {
      NavDestination() {
        LoginPage()
      }
      .hideTitleBar(true)
    } else if (name === AppRouteName.DISCIPLINES) {
      NavDestination() {
        DisciplinesPage()
      }
      .hideTitleBar(true)
    } else if (name === AppRouteName.PROFILE) {
      NavDestination() {
        MindProfilePage()
      }
      .hideTitleBar(true)
    } else if (name === AppRouteName.ROUNDTABLE) {
      NavDestination() {
        RoundtablePage()
      }
      .hideTitleBar(true)
    } else if (name === AppRouteName.DILEMMA) {
      NavDestination() {
        DilemmaPage()
      }
      .hideTitleBar(true)
    } else if (name === AppRouteName.SETTINGS) {
      NavDestination() {
        AccountSettingsPage({
          onDismiss: () => { appPageStack.pop(); }
        })
      }
      .hideTitleBar(true)
    } else if (name.startsWith(`${AppRouteName.BATTLE}/`)) {
      NavDestination() {
        BattlePage({
          battleId: AppRoutes.parseBattleId(name) ?? '',
        })
      }
      .hideTitleBar(true)
    } else if (name.startsWith(`${AppRouteName.PHILOSOPHY_BATTLE}/`)) {
      NavDestination() {
        PhilosophyBattlePage({
          philosopherId: AppRoutes.parsePhilosophyBattleId(name) ?? '',
        })
      }
      .hideTitleBar(true)
    } else {
      NavDestination() {
        Column() {
          Text(`Unknown route: ${name}`)
            .fontColor(ArenaTheme.textMuted);
        }
        .width('100%')
        .height('100%')
        .backgroundColor(ArenaTheme.background);
      }
      .hideTitleBar(true)
    }
  }

  aboutToAppear(): void {
    hilog.info(LOG_DOMAIN, 'hackAstone', 'Index aboutToAppear v1.1.5');
    localeStore.refreshFromSystem();
    catalogStore.reload(localeStore.catalogLocale);
  }

  build() {
    Stack() {
      HomePage()

      Navigation(appPageStack) {
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
      .hitTestBehavior(this.navHasOverlay ? HitTestMode.Default : HitTestMode.Transparent)
    }
    .width('100%')
    .height('100%')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
    .backgroundColor(ArenaTheme.background)
  }
}
