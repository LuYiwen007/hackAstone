import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher, PhilosopherData } from '../common/ArenaModels';
import { ArenaConfiguration } from '../common/ArenaConfiguration';

/** 哲学家头像：远程图片或渐变首字 fallback，对齐 iOS `PhilosopherAvatarView`。 */
@Component
export struct PhilosopherAvatar {
  @Prop philosopher: Philosopher = new PhilosopherData();
  @Prop avatarSize: number = 40;
  @State imageFailed: boolean = false;

  private imageUrl(): string | null {
    return ArenaConfiguration.philosopherImageURL(this.philosopher.id);
  }

  private fallbackChar(): string {
    const cn = this.philosopher.nameCN ?? '';
    return cn.length > 0 ? cn.substring(0, 1) : '?';
  }

  @Builder
  fallbackFace() {
    Stack({ alignContent: Alignment.Center }) {
      Text(this.fallbackChar())
        .fontSize(this.avatarSize * 0.42)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.White)
    }
    .width(this.avatarSize)
    .height(this.avatarSize)
    .linearGradient({
      angle: 135,
      colors: [[ArenaTheme.avatarGradientStart, 0], [ArenaTheme.avatarGradientEnd, 1]]
    })
  }

  build() {
    Stack() {
      if (this.imageUrl() !== null && !this.imageFailed) {
        Image(this.imageUrl()!)
          .width(this.avatarSize)
          .height(this.avatarSize)
          .borderRadius(this.avatarSize / 2)
          .objectFit(ImageFit.Cover)
          .onError(() => {
            this.imageFailed = true;
          })
      } else {
        this.fallbackFace();
      }
    }
    .width(this.avatarSize)
    .height(this.avatarSize)
    .borderRadius(this.avatarSize / 2)
    .border({ width: 1, color: ArenaTheme.border })
    .clip(true)
  }
}
