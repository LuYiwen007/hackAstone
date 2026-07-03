import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import ConfigurationConstant from "@ohos:app.ability.ConfigurationConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
import { bindGlobalStores } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
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
