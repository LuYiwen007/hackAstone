import SwiftUI

struct PhilosopherAvatarView: View {
    let philosopher: Philosopher
    var size: CGFloat = 40

    var body: some View {
        Group {
            if let url = ArenaConfiguration.philosopherImageURL(id: philosopher.id) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        fallback
                    }
                }
            } else {
                fallback
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().stroke(ArenaTheme.border, lineWidth: 1))
    }

    private var fallback: some View {
        Text(String(philosopher.nameCN.prefix(1)))
            .font(.system(size: size * 0.42, weight: .bold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                LinearGradient(colors: [ArenaTheme.headerGradientStart, ArenaTheme.headerGradientEnd], startPoint: .topLeading, endPoint: .bottomTrailing)
            )
    }
}
