import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher, CatalogTimePeriodMeta, RegionMeta } from '../common/ArenaModels';
import { CatalogMeta } from '../data/CatalogMeta';
import {
  regionAnchorX,
  regionAnchorY,
  regionCardOffsetX,
  regionCardOffsetY
} from '../common/MapLayoutUtil';
import { arenaL10n } from '../route/GlobalStores';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';

@Component
export struct WorldMapSection {
  @Link selectedRegion: string | null;
  @Prop currentPeriod: CatalogTimePeriodMeta;
  @Prop philosophers: Philosopher[] = [];

  @State pinchBase: number = 1;
  @State pinchGesture: number = 1;
  @State panOffsetX: number = 0;
  @State panOffsetY: number = 0;
  @State displayPinch: number = 1;

  private readonly pinchMax: number = 4;
  private readonly mapW: number = CatalogMeta.mapViewBox.width;
  private readonly mapH: number = CatalogMeta.mapViewBox.height;

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

  private philosophersInRegion(regionId: string): Philosopher[] {
    return CatalogMeta.getPhilosophersByPeriodAndRegion(this.currentPeriod, regionId, this.philosophers);
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
          this.simplifiedLandmass()
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
          }, (region: RegionMeta) => region.id)
        }
        .width(this.mapW)
        .height(this.mapH)
        .scale({
          x: this.displayPinch,
          y: this.displayPinch,
          centerX: 0,
          centerY: 0
        })
        .translate({ x: this.panOffsetX, y: this.panOffsetY })
      }
      .width('100%')
      .aspectRatio(this.mapW / this.mapH)
      .clip(true)
      .borderRadius(16)
      .border({ width: 1, color: ArenaTheme.border })
      .gesture(
        GestureGroup(GestureMode.Parallel,
          PinchGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.pinchGesture = event.scale;
              this.displayPinch = Math.min(Math.max(this.pinchBase * event.scale, 1), this.pinchMax);
            })
            .onActionEnd(() => {
              this.pinchBase = Math.min(Math.max(this.pinchBase * this.pinchGesture, 1), this.pinchMax);
              this.pinchGesture = 1;
              this.displayPinch = this.pinchBase;
            }),
          PanGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.panOffsetX += event.offsetX;
              this.panOffsetY += event.offsetY;
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
  simplifiedLandmass() {
    Column() {
      Row() {
        Column()
          .width(180)
          .height(120)
          .backgroundColor('#174E6380')
          .borderRadius(20)
          .margin({ top: 40, left: 20 })
        Blank()
        Column()
          .width(140)
          .height(100)
          .backgroundColor('#174E6380')
          .borderRadius(16)
          .margin({ top: 30, right: 60 })
      }
      .width('100%')
      Row() {
        Column()
          .width(120)
          .height(80)
          .backgroundColor('#174E6380')
          .borderRadius(12)
          .margin({ left: 280, top: 10 })
        Column()
          .width(100)
          .height(70)
          .backgroundColor('#174E6380')
          .borderRadius(12)
          .margin({ left: 40, top: 20 })
        Column()
          .width(160)
          .height(110)
          .backgroundColor('#174E6380')
          .borderRadius(18)
          .margin({ left: 60, top: 0 })
        Column()
          .width(90)
          .height(130)
          .backgroundColor('#174E6380')
          .borderRadius(14)
          .margin({ left: 30, top: 30 })
      }
      .width('100%')
    }
    .width('100%')
    .height('100%')
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
            }, (p: Philosopher) => p.id)
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
