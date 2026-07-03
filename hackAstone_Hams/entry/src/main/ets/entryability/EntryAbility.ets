import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { bindGlobalStores } from '../route/GlobalStores';

const DOMAIN = 0x0000;

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    bindGlobalStores(this.context);
    this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_DARK);
    hilog.info(DOMAIN, 'hackAstone', 'EntryAbility onCreate');
  }

  onDestroy(): void {
    hilog.info(DOMAIN, 'hackAstone', 'EntryAbility onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        hilog.error(DOMAIN, 'hackAstone', 'Failed to load Index. Cause: %{public}s', JSON.stringify(err));
        return;
      }
      hilog.info(DOMAIN, 'hackAstone', 'Succeeded in loading Index.');
      windowStage.getMainWindow((winErr, mainWindow) => {
        if (winErr.code || mainWindow === undefined) {
          hilog.error(DOMAIN, 'hackAstone', 'Failed to get main window. Cause: %{public}s', JSON.stringify(winErr));
          return;
        }
        mainWindow.setWindowBackgroundColor('#FF0A0A0D');
      });
    });
  }

  onWindowStageDestroy(): void {
    hilog.info(DOMAIN, 'hackAstone', 'EntryAbility onWindowStageDestroy');
  }

  onForeground(): void {
    hilog.info(DOMAIN, 'hackAstone', 'EntryAbility onForeground');
  }

  onBackground(): void {
    hilog.info(DOMAIN, 'hackAstone', 'EntryAbility onBackground');
  }
}
