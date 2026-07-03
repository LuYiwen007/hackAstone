if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface WorldMapSection_Params {
    selectedRegion?: string | null;
    currentPeriod?: CatalogTimePeriodMeta;
    philosophers?: Philosopher[];
    pinchBase?: number;
    pinchGesture?: number;
    panOffsetX?: number;
    panOffsetY?: number;
    pinchMax?: number;
    mapW?: number;
    mapH?: number;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Philosopher, CatalogTimePeriodMeta, RegionMeta } from '../common/ArenaModels';
import { CatalogMeta } from "@bundle:com.hackastone.arena/entry/ets/data/CatalogMeta";
import { MapProjection } from "@bundle:com.hackastone.arena/entry/ets/common/MapProjection";
import { localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { PhilosopherAvatar } from "@bundle:com.hackastone.arena/entry/ets/components/PhilosopherAvatar";
export class WorldMapSection extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__selectedRegion = new SynchedPropertyObjectTwoWayPU(params.selectedRegion, this, "selectedRegion");
        this.__currentPeriod = new SynchedPropertyObjectOneWayPU(params.currentPeriod, this, "currentPeriod");
        this.__philosophers = new SynchedPropertyObjectOneWayPU(params.philosophers, this, "philosophers");
        this.__pinchBase = new ObservedPropertySimplePU(1, this, "pinchBase");
        this.__pinchGesture = new ObservedPropertySimplePU(1, this, "pinchGesture");
        this.__panOffsetX = new ObservedPropertySimplePU(0, this, "panOffsetX");
        this.__panOffsetY = new ObservedPropertySimplePU(0, this, "panOffsetY");
        this.pinchMax = 4;
        this.mapW = CatalogMeta.mapViewBox.width;
        this.mapH = CatalogMeta.mapViewBox.height;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: WorldMapSection_Params) {
        if (params.philosophers === undefined) {
            this.__philosophers.set([]);
        }
        if (params.pinchBase !== undefined) {
            this.pinchBase = params.pinchBase;
        }
        if (params.pinchGesture !== undefined) {
            this.pinchGesture = params.pinchGesture;
        }
        if (params.panOffsetX !== undefined) {
            this.panOffsetX = params.panOffsetX;
        }
        if (params.panOffsetY !== undefined) {
            this.panOffsetY = params.panOffsetY;
        }
        if (params.pinchMax !== undefined) {
            this.pinchMax = params.pinchMax;
        }
        if (params.mapW !== undefined) {
            this.mapW = params.mapW;
        }
        if (params.mapH !== undefined) {
            this.mapH = params.mapH;
        }
    }
    updateStateVars(params: WorldMapSection_Params) {
        this.__currentPeriod.reset(params.currentPeriod);
        this.__philosophers.reset(params.philosophers);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__selectedRegion.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPeriod.purgeDependencyOnElmtId(rmElmtId);
        this.__philosophers.purgeDependencyOnElmtId(rmElmtId);
        this.__pinchBase.purgeDependencyOnElmtId(rmElmtId);
        this.__pinchGesture.purgeDependencyOnElmtId(rmElmtId);
        this.__panOffsetX.purgeDependencyOnElmtId(rmElmtId);
        this.__panOffsetY.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__selectedRegion.aboutToBeDeleted();
        this.__currentPeriod.aboutToBeDeleted();
        this.__philosophers.aboutToBeDeleted();
        this.__pinchBase.aboutToBeDeleted();
        this.__pinchGesture.aboutToBeDeleted();
        this.__panOffsetX.aboutToBeDeleted();
        this.__panOffsetY.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __selectedRegion: SynchedPropertySimpleOneWayPU<string | null>;
    get selectedRegion() {
        return this.__selectedRegion.get();
    }
    set selectedRegion(newValue: string | null) {
        this.__selectedRegion.set(newValue);
    }
    private __currentPeriod: SynchedPropertySimpleOneWayPU<CatalogTimePeriodMeta>;
    get currentPeriod() {
        return this.__currentPeriod.get();
    }
    set currentPeriod(newValue: CatalogTimePeriodMeta) {
        this.__currentPeriod.set(newValue);
    }
    private __philosophers: SynchedPropertySimpleOneWayPU<Philosopher[]>;
    get philosophers() {
        return this.__philosophers.get();
    }
    set philosophers(newValue: Philosopher[]) {
        this.__philosophers.set(newValue);
    }
    private __pinchBase: ObservedPropertySimplePU<number>;
    get pinchBase() {
        return this.__pinchBase.get();
    }
    set pinchBase(newValue: number) {
        this.__pinchBase.set(newValue);
    }
    private __pinchGesture: ObservedPropertySimplePU<number>;
    get pinchGesture() {
        return this.__pinchGesture.get();
    }
    set pinchGesture(newValue: number) {
        this.__pinchGesture.set(newValue);
    }
    private __panOffsetX: ObservedPropertySimplePU<number>;
    get panOffsetX() {
        return this.__panOffsetX.get();
    }
    set panOffsetX(newValue: number) {
        this.__panOffsetX.set(newValue);
    }
    private __panOffsetY: ObservedPropertySimplePU<number>;
    get panOffsetY() {
        return this.__panOffsetY.get();
    }
    set panOffsetY(newValue: number) {
        this.__panOffsetY.set(newValue);
    }
    private readonly pinchMax: number;
    private readonly mapW: number;
    private readonly mapH: number;
    private currentPinch(): number {
        const raw = this.pinchBase * this.pinchGesture;
        return Math.min(Math.max(raw, 1), this.pinchMax);
    }
    private clampPan(containerW: number, containerH: number, baseFit: number): void {
        const pinch = this.currentPinch();
        const scaledW = this.mapW * baseFit * pinch;
        const scaledH = this.mapH * baseFit * pinch;
        const minX = Math.min(0, containerW - scaledW);
        const minY = Math.min(0, containerH - scaledH);
        this.panOffsetX = Math.min(0, Math.max(this.panOffsetX, minX));
        this.panOffsetY = Math.min(0, Math.max(this.panOffsetY, minY));
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(39:5)", "entry");
            Column.padding(16);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(14);
            Column.border({ width: 1, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/components/WorldMapSection.ets(40:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🌏');
            Text.debugLine("entry/src/main/ets/components/WorldMapSection.ets(41:9)", "entry");
            Text.fontSize(20);
            Text.fontColor(ArenaTheme.cyanAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.worldMapTitle);
            Text.debugLine("entry/src/main/ets/components/WorldMapSection.ets(44:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.TopStart });
            Stack.debugLine("entry/src/main/ets/components/WorldMapSection.ets(50:7)", "entry");
            Stack.width('100%');
            Stack.aspectRatio(this.mapW / this.mapH);
            Stack.clip(true);
            Stack.borderRadius(16);
            Stack.border({ width: 1, color: ArenaTheme.border });
            globalThis.Gesture.create(GesturePriority.Low);
            GestureGroup.create(GestureMode.Parallel);
            PinchGesture.create();
            PinchGesture.onActionUpdate((event: GestureEvent) => {
                this.pinchGesture = event.scale;
            });
            PinchGesture.onActionEnd(() => {
                this.pinchBase = Math.min(Math.max(this.pinchBase * this.pinchGesture, 1), this.pinchMax);
                this.pinchGesture = 1;
            });
            PinchGesture.pop();
            PanGesture.create();
            PanGesture.onActionUpdate((event: GestureEvent) => {
                this.panOffsetX += event.offsetX;
                this.panOffsetY += event.offsetY;
            });
            PanGesture.pop();
            GestureGroup.pop();
            globalThis.Gesture.pop();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(51:9)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.borderRadius(16);
            Column.linearGradient({
                angle: 180,
                colors: [['#081F2E8C', 0], [ArenaTheme.background, 1]]
            });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.TopStart });
            Stack.debugLine("entry/src/main/ets/components/WorldMapSection.ets(60:9)", "entry");
            Stack.width(this.mapW);
            Stack.height(this.mapH);
            Stack.scale({
                x: this.currentPinch(),
                y: this.currentPinch(),
                centerX: 0,
                centerY: 0
            });
            Stack.translate({ x: this.panOffsetX, y: this.panOffsetY });
        }, Stack);
        this.simplifiedLandmass.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const label = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(label.text as string);
                    Text.debugLine("entry/src/main/ets/components/WorldMapSection.ets(63:13)", "entry");
                    Text.fontSize(13);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor('#BAE6FD38');
                    Text.letterSpacing(4);
                    Text.position({ x: label.x as number, y: label.y as number });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, CatalogMeta.oceanLabels, forEachItemGenFunction, (label: any) => label.id as string, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const region = _item;
                this.regionOverlay.bind(this)(region);
            };
            this.forEachUpdateFunction(elmtId, CatalogMeta.regions, forEachItemGenFunction, (region: RegionMeta) => region.id, false, false);
        }, ForEach);
        ForEach.pop();
        Stack.pop();
        Stack.pop();
        Column.pop();
    }
    simplifiedLandmass(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(117:5)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/components/WorldMapSection.ets(118:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(119:9)", "entry");
            Column.width(180);
            Column.height(120);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(20);
            Column.margin({ top: 40, left: 20 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/components/WorldMapSection.ets(125:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(126:9)", "entry");
            Column.width(140);
            Column.height(100);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(16);
            Column.margin({ top: 30, right: 60 });
        }, Column);
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/components/WorldMapSection.ets(134:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(135:9)", "entry");
            Column.width(120);
            Column.height(80);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(12);
            Column.margin({ left: 280, top: 10 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(141:9)", "entry");
            Column.width(100);
            Column.height(70);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(12);
            Column.margin({ left: 40, top: 20 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(147:9)", "entry");
            Column.width(160);
            Column.height(110);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(18);
            Column.margin({ left: 60, top: 0 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(153:9)", "entry");
            Column.width(90);
            Column.height(130);
            Column.backgroundColor('#174E6380');
            Column.borderRadius(14);
            Column.margin({ left: 30, top: 30 });
        }, Column);
        Column.pop();
        Row.pop();
        Column.pop();
    }
    private regionAnchorX(region: RegionMeta, layout: any | undefined): number {
        if (layout) {
            return MapProjection.lonToX(layout['lon'] as number);
        }
        return (region.x / 100) * this.mapW;
    }
    private regionAnchorY(region: RegionMeta, layout: any | undefined): number {
        if (layout) {
            return MapProjection.latToY(layout['lat'] as number);
        }
        return (region.y / 100) * this.mapH;
    }
    private regionCardOffsetX(layout: any | undefined): number {
        if (layout) {
            return layout['cardOffsetX'] as number ?? 0;
        }
        return 0;
    }
    private regionCardOffsetY(layout: any | undefined): number {
        if (layout) {
            return layout['cardOffsetY'] as number ?? 0;
        }
        return 0;
    }
    regionOverlay(region: RegionMeta, parent = null) {
        this.regionOverlayInner.bind(this)(region, CatalogMeta.regionGeoLayout[region.id], CatalogMeta.getPhilosophersByPeriodAndRegion(ObservedObject.GetRawObject(this.currentPeriod), region.id, ObservedObject.GetRawObject(this.philosophers)), this.selectedRegion === region.id, localeStore.L.regionName(region.id));
    }
    regionOverlayInner(region: RegionMeta, layout: any | undefined, items: Philosopher[], active: boolean, regionTitle: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(213:5)", "entry");
            Column.position({
                x: this.regionAnchorX(region, layout),
                y: this.regionAnchorY(region, layout) - 48
            });
            Column.onClick(() => {
                this.selectedRegion = region.id;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(214:7)", "entry");
            Column.padding({ left: 12, right: 12, top: 10, bottom: 10 });
            Column.backgroundColor(active ? '#06B6D420' : '#00000059');
            Column.borderRadius(14);
            Column.border({
                width: 1,
                color: active ? '#22D3EEB3' : ArenaTheme.border
            });
            Column.offset({
                x: this.regionCardOffsetX(layout),
                y: this.regionCardOffsetY(layout)
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(regionTitle);
            Text.debugLine("entry/src/main/ets/components/WorldMapSection.ets(215:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(items.length === 0 ? localeStore.L.noFiguresShort : localeStore.L.philosopherCount(items.length));
            Text.debugLine("entry/src/main/ets/components/WorldMapSection.ets(219:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (items.slice(0, 6).length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.debugLine("entry/src/main/ets/components/WorldMapSection.ets(223:11)", "entry");
                        Flex.width(132);
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const p = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                __Common__.create();
                                __Common__.margin({ right: 4, bottom: 4 });
                            }, __Common__);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new PhilosopherAvatar(this, { philosopher: p, avatarSize: 26 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/WorldMapSection.ets", line: 225, col: 15 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                philosopher: p,
                                                avatarSize: 26
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            philosopher: p, avatarSize: 26
                                        });
                                    }
                                }, { name: "PhilosopherAvatar" });
                            }
                            __Common__.pop();
                        };
                        this.forEachUpdateFunction(elmtId, items.slice(0, 6), forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(244:7)", "entry");
            Column.width(2);
            Column.height(active ? 28 : 22);
            Column.backgroundColor(active ? ArenaTheme.cyanMuted : '#22D3EEA6');
            Column.margin({ top: 2 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/components/WorldMapSection.ets(250:7)", "entry");
            Column.width(12);
            Column.height(12);
            Column.borderRadius(6);
            Column.backgroundColor(active ? ArenaTheme.cyanMuted : ArenaTheme.cyanAccent);
            Column.border({ width: 2, color: '#000000F2' });
        }, Column);
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
