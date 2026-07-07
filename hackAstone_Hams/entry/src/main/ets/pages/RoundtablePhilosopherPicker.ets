import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from '../l10n/ArenaL10n';
import { catalogStore, arenaL10n, arenaNavPush, arenaNavPop, arenaNavClear } from '../route/GlobalStores';

@Component
export struct RoundtablePhilosopherPicker {
  @Link selected: Philosopher[];

  @State draftIds: Set<string> = new Set();
  @State query: string = '';

  private readonly maxPick: number = 4;

  private get sorted(): Philosopher[] {
    const list = catalogStore.philosophers.slice();
    list.sort((a: Philosopher, b: Philosopher) => {
      const an = philosopherDisplayName(a, arenaL10n().prefersEnglish);
      const bn = philosopherDisplayName(b, arenaL10n().prefersEnglish);
      return an.localeCompare(bn);
    });
    return list;
  }

  private get filtered(): Philosopher[] {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      return this.sorted;
    }
    return this.sorted.filter((p: Philosopher) => {
      const hay = `${philosopherDisplayName(p, arenaL10n().prefersEnglish)} ${p.nameCN} ${p.school}`.toLowerCase();
      return hay.includes(q);
    });
  }

  aboutToAppear(): void {
    const ids = new Set<string>();
    this.selected.forEach((p: Philosopher) => ids.add(p.id));
    this.draftIds = ids;
  }

  private toggle(id: string): void {
    const next = new Set(this.draftIds);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < this.maxPick) {
      next.add(id);
    }
    this.draftIds = next;
  }

  private confirm(): void {
    const order = this.sorted.map((p: Philosopher) => p.id);
    const picked: Philosopher[] = [];
    order.forEach((id: string) => {
      if (this.draftIds.has(id)) {
        const p = catalogStore.philosophers.find((x: Philosopher) => x.id === id);
        if (p) {
          picked.push(p);
        }
      }
    });
    this.selected = picked;
    arenaNavPop();
  }

  build() {
    Column() {
      Row() {
        Text(arenaL10n().roundtablePickerTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Blank()
        Button(arenaL10n().roundtablePickerConfirm)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.orangeAccent)
          .backgroundColor(Color.Transparent)
          .enabled(this.draftIds.size >= 2)
          .onClick(() => this.confirm())
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 14, bottom: 14 })
      .border({ width: { bottom: 1 }, color: ArenaTheme.border })

      Scroll() {
        Column({ space: 16 }) {
          Text(arenaL10n().roundtablePickerHint)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().roundtablePickerCount(catalogStore.philosophers.length, this.draftIds.size))
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.orangeAccent)

          TextInput({ placeholder: arenaL10n().roundtableSearchPlaceholder, text: this.query })
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(ArenaTheme.surface)
            .border({ width: 1, color: ArenaTheme.border, radius: 8 })
            .onChange((v: string) => {
              this.query = v;
            })

          Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start }) {
            ForEach(this.filtered, (p: Philosopher) => {
              this.philosopherTile(p);
            }, (p: Philosopher) => p.id)
          }
          .width('100%')
        }
        .padding({ left: 16, right: 16, top: 16, bottom: 28 })
        .width('100%')
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }

  @Builder
  philosopherTile(p: Philosopher) {
    Row({ space: 10 }) {
      Column({ space: 4 }) {
        Text(philosopherDisplayName(p, arenaL10n().prefersEnglish))
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
        Text(p.school)
          .fontSize(11)
          .fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      if (this.draftIds.has(p.id)) {
        Text('✓')
          .fontSize(18)
          .fontColor(ArenaTheme.orangeAccent)
      }
    }
    .width('48%')
    .padding(12)
    .margin({ right: 8, bottom: 10 })
    .backgroundColor(this.draftIds.has(p.id) ? '#F9731620' : ArenaTheme.surface)
    .border({
      width: 1,
      color: this.draftIds.has(p.id) ? '#F9731699' : ArenaTheme.border,
      radius: 10
    })
    .opacity(this.draftIds.size >= this.maxPick && !this.draftIds.has(p.id) ? 0.4 : 1)
    .enabled(!(this.draftIds.size >= this.maxPick && !this.draftIds.has(p.id)))
    .onClick(() => this.toggle(p.id))
  }
}
