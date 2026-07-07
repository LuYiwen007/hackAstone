import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher, CatalogTimePeriodMeta, RegionMeta } from '../common/ArenaModels';
import { CatalogMeta } from '../data/CatalogMeta';
import {
  regionAnchorX,
  regionAnchorY,
  regionCardOffsetX,
  regionCardOffsetY
} from '../common/MapLayoutUtil';
import { drawLandPathOnCanvas, drawSimplifiedLandOnCanvas } from '../common/MapCanvasDraw';
import { loadMapLandCommands } from '../common/MapLandCache';
import { arenaL10n } from '../route/GlobalStores';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';

@Component
export struct WorldMapSection {
  @Link selectedRegion: string | null;
  @Prop @Watch('onPeriodIdChange') selectedPeriodId: string = CatalogMeta.timePeriods[0].id;
  @Prop philosophers: Philosopher[] = [];

  @State pinchBase: number = 1;
  @State pinchGesture: number = 1;
  @State panOffsetX: number = 0;
  @State panOffsetY: number = 0;
  @State panDragX: number = 0;
  @State panDragY: number = 0;
  @State containerW: number = 0;
  @State containerH: number = 0;
  @State mapEpoch: number = 0;
  @State landCommands: string = '';
  @State canvasReady: boolean = false;

  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private mapContext: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);

  private readonly pinchMax: number = 4;
  private readonly mapW: number = CatalogMeta.mapViewBox.width;
  private readonly mapH: number = CatalogMeta.mapViewBox.height;

  aboutToAppear(): void {
    loadMapLandCommands(getContext(this)).then((cmds: string) => {
      this.landCommands = cmds;
      this.redrawLand();
    });
  }

  private onPeriodIdChange(): void {
    this.mapEpoch++;
    this.selectedRegion = null;
  }

  private resolvedPeriod(): CatalogTimePeriodMeta {
    const found = CatalogMeta.timePeriods.find((p: CatalogTimePeriodMeta) => p.id === this.selectedPeriodId);
    return found ?? CatalogMeta.timePeriods[0];
  }

  private currentPinch(): number {
    const raw = this.pinchBase * this.pinchGesture;
    return Math.min(Math.max(raw, 1), this.pinchMax);
  }

  private fitScale(): number {
    if (this.containerW <= 0 || this.containerH <= 0) {
      return 1;
    }
    const baseFit = Math.min(this.containerW / this.mapW, this.containerH / this.mapH);
    return baseFit * this.currentPinch();
  }

  private clampPan(): void {
    if (this.containerW <= 0 || this.containerH <= 0) {
      return;
    }
    const scale = this.fitScale();
    const scaledW = this.mapW * scale;
    const scaledH = this.mapH * scale;
    const minX = Math.min(0, this.containerW - scaledW);
    const minY = Math.min(0, this.containerH - scaledH);
    const totalX = this.panOffsetX + this.panDragX;
    const totalY = this.panOffsetY + this.panDragY;
    this.panOffsetX = Math.min(0, Math.max(totalX, minX));
    this.panOffsetY = Math.min(0, Math.max(totalY, minY));
    this.panDragX = 0;
    this.panDragY = 0;
  }

  private philosophersInRegion(regionId: string): Philosopher[] {
    return CatalogMeta.getPhilosophersByPeriodAndRegion(this.resolvedPeriod(), regionId, this.philosophers);
  }

  private redrawLand(): void {
    if (!this.canvasReady) {
      return;
    }
    this.mapContext.clearRect(0, 0, this.mapW, this.mapH);
    if (this.landCommands.length > 0) {
      drawLandPathOnCanvas(this.mapContext, this.landCommands, this.mapW, this.mapH);
    } else {
      drawSimplifiedLandOnCanvas(this.mapContext);
    }
  }

  build() {
    Column({ space: 12 }) {
      Row({ space: 10 }) {
        Text('🌏')
          .fontSize(20)
          .fontColor(ArenaTheme.cyanAccent)
        Text(arenaL10n().worldMapTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }

      Stack({ alignContent: Alignment.TopStart }) {
        Column()
          .width('100%')
          .height('100%')
          .borderRadius(16)
          .linearGradient({
            angle: 180,
            colors: [['#081F2E8C', 0], [ArenaTheme.background, 1]]
          })

        Stack({ alignContent: Alignment.TopStart }) {
          Canvas(this.mapContext)
            .width(this.mapW)
            .height(this.mapH)
            .onReady(() => {
              this.canvasReady = true;
              this.redrawLand();
            })

          ForEach(CatalogMeta.oceanLabels, (label: ESObject) => {
            Text(label.text as string)
              .fontSize(13)
              .fontWeight(FontWeight.Medium)
              .fontColor('#BAE6FD38')
              .letterSpacing(4)
              .position({ x: label.x as number, y: label.y as number })
          }, (label: ESObject) => label.id as string)

          ForEach(CatalogMeta.regions, (region: RegionMeta) => {
            this.regionOverlayInner(
              region,
              this.philosophersInRegion(region.id),
              this.selectedRegion === region.id,
              arenaL10n().regionName(region.id),
              regionAnchorX(region, CatalogMeta.regionGeoLayout[region.id], this.mapW),
              regionAnchorY(region, CatalogMeta.regionGeoLayout[region.id], this.mapH),
              regionCardOffsetX(CatalogMeta.regionGeoLayout[region.id]),
              regionCardOffsetY(CatalogMeta.regionGeoLayout[region.id])
            );
          }, (region: RegionMeta) => `${region.id}-${this.selectedPeriodId}-${this.mapEpoch}`)
        }
        .width(this.mapW)
        .height(this.mapH)
        .scale({
          x: this.fitScale(),
          y: this.fitScale(),
          centerX: 0,
          centerY: 0
        })
        .translate({ x: this.panOffsetX + this.panDragX, y: this.panOffsetY + this.panDragY })
      }
      .width('100%')
      .aspectRatio(this.mapW / this.mapH)
      .clip(true)
      .borderRadius(16)
      .border({ width: 1, color: ArenaTheme.border })
      .onAreaChange((_old, newArea) => {
        this.containerW = newArea.width as number;
        this.containerH = newArea.height as number;
        this.clampPan();
      })
      .priorityGesture(
        GestureGroup(GestureMode.Parallel,
          PinchGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.pinchGesture = event.scale;
            })
            .onActionEnd(() => {
              this.pinchBase = Math.min(Math.max(this.pinchBase * this.pinchGesture, 1), this.pinchMax);
              this.pinchGesture = 1;
              this.clampPan();
            }),
          PanGesture({ fingers: 1, direction: PanDirection.All, distance: 6 })
            .onActionUpdate((event: GestureEvent) => {
              this.panDragX = event.offsetX;
              this.panDragY = event.offsetY;
            })
            .onActionEnd(() => {
              this.panOffsetX += this.panDragX;
              this.panOffsetY += this.panDragY;
              this.panDragX = 0;
              this.panDragY = 0;
              this.clampPan();
            })
        )
      )
    }
    .padding(16)
    .width('100%')
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(14)
    .border({ width: 1, color: ArenaTheme.border })
  }

  @Builder
  regionOverlayInner(
    region: RegionMeta,
    items: Philosopher[],
    active: boolean,
    regionTitle: string,
    anchorX: number,
    anchorY: number,
    cardOffsetX: number,
    cardOffsetY: number
  ) {
    Column({ space: 0 }) {
      Column({ space: 6 }) {
        Text(regionTitle)
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(items.length === 0 ? arenaL10n().noFiguresShort : arenaL10n().philosopherCount(items.length))
          .fontSize(11)
          .fontColor(ArenaTheme.textMuted)
        if (items.slice(0, 6).length > 0) {
          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(items.slice(0, 6), (p: Philosopher) => {
              PhilosopherAvatar({ philosopher: p, avatarSize: 26 })
                .margin({ right: 4, bottom: 4 })
            }, (p: Philosopher) => `${p.id}-${this.selectedPeriodId}`)
          }
          .width(132)
        }
      }
      .padding({ left: 12, right: 12, top: 10, bottom: 10 })
      .backgroundColor(active ? '#06B6D420' : '#00000059')
      .borderRadius(14)
      .border({
        width: 1,
        color: active ? '#22D3EEB3' : ArenaTheme.border
      })
      .offset({
        x: cardOffsetX,
        y: cardOffsetY
      })

      Column()
        .width(2)
        .height(active ? 28 : 22)
        .backgroundColor(active ? ArenaTheme.cyanMuted : '#22D3EEA6')
        .margin({ top: 2 })

      Column()
        .width(12)
        .height(12)
        .borderRadius(6)
        .backgroundColor(active ? ArenaTheme.cyanMuted : ArenaTheme.cyanAccent)
        .border({ width: 2, color: '#000000F2' })
    }
    .position({
      x: anchorX,
      y: anchorY - 48
    })
    .onClick(() => {
      this.selectedRegion = region.id;
    })
  }
}
