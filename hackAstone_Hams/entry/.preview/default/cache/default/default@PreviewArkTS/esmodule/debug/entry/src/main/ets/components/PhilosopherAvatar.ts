if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PhilosopherAvatar_Params {
    philosopher?: Philosopher;
    avatarSize?: number;
    imageFailed?: boolean;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { PhilosopherData } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import type { Philosopher } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import { ArenaConfiguration } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaConfiguration";
export class PhilosopherAvatar extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__philosopher = new SynchedPropertyObjectOneWayPU(params.philosopher, this, "philosopher");
        this.__avatarSize = new SynchedPropertySimpleOneWayPU(params.avatarSize, this, "avatarSize");
        this.__imageFailed = new ObservedPropertySimplePU(false, this, "imageFailed");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PhilosopherAvatar_Params) {
        if (params.philosopher === undefined) {
            this.__philosopher.set(new PhilosopherData());
        }
        if (params.avatarSize === undefined) {
            this.__avatarSize.set(40);
        }
        if (params.imageFailed !== undefined) {
            this.imageFailed = params.imageFailed;
        }
    }
    updateStateVars(params: PhilosopherAvatar_Params) {
        this.__philosopher.reset(params.philosopher);
        this.__avatarSize.reset(params.avatarSize);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__philosopher.purgeDependencyOnElmtId(rmElmtId);
        this.__avatarSize.purgeDependencyOnElmtId(rmElmtId);
        this.__imageFailed.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__philosopher.aboutToBeDeleted();
        this.__avatarSize.aboutToBeDeleted();
        this.__imageFailed.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __philosopher: SynchedPropertySimpleOneWayPU<Philosopher>;
    get philosopher() {
        return this.__philosopher.get();
    }
    set philosopher(newValue: Philosopher) {
        this.__philosopher.set(newValue);
    }
    private __avatarSize: SynchedPropertySimpleOneWayPU<number>;
    get avatarSize() {
        return this.__avatarSize.get();
    }
    set avatarSize(newValue: number) {
        this.__avatarSize.set(newValue);
    }
    private __imageFailed: ObservedPropertySimplePU<boolean>;
    get imageFailed() {
        return this.__imageFailed.get();
    }
    set imageFailed(newValue: boolean) {
        this.__imageFailed.set(newValue);
    }
    private imageUrl(): string | null {
        return ArenaConfiguration.philosopherImageURL(this.philosopher.id);
    }
    private fallbackChar(): string {
        const cn = this.philosopher.nameCN ?? '';
        return cn.length > 0 ? cn.substring(0, 1) : '?';
    }
    fallbackFace(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Center });
            Stack.debugLine("entry/src/main/ets/components/PhilosopherAvatar.ets(23:5)", "entry");
            Stack.width(this.avatarSize);
            Stack.height(this.avatarSize);
            Stack.linearGradient({
                angle: 135,
                colors: [[ArenaTheme.headerGradientStart, 0], [ArenaTheme.headerGradientEnd, 1]]
            });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.fallbackChar());
            Text.debugLine("entry/src/main/ets/components/PhilosopherAvatar.ets(24:7)", "entry");
            Text.fontSize(this.avatarSize * 0.42);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Stack.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/components/PhilosopherAvatar.ets(38:5)", "entry");
            Stack.width(this.avatarSize);
            Stack.height(this.avatarSize);
            Stack.borderRadius(this.avatarSize / 2);
            Stack.border({ width: 1, color: ArenaTheme.border });
            Stack.clip(true);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.imageUrl() !== null && !this.imageFailed) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(this.imageUrl()!);
                        Image.debugLine("entry/src/main/ets/components/PhilosopherAvatar.ets(40:9)", "entry");
                        Image.width(this.avatarSize);
                        Image.height(this.avatarSize);
                        Image.borderRadius(this.avatarSize / 2);
                        Image.objectFit(ImageFit.Cover);
                        Image.onError(() => {
                            this.imageFailed = true;
                        });
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.fallbackFace.bind(this)();
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
