import SwiftUI

/// 完整视角总结生成动画（橙色圆环 + 轨迹），对齐 Harmony `PerspectiveSummaryLoader`。
struct PerspectiveSummaryLoader: View {
    @State private var rotation: Double = 0
    @State private var trailShift: CGFloat = 0

    var body: some View {
        ZStack {
            ghostRing(size: 72, opacity: 0.1, offsetX: -trailShift - 28)
            ghostRing(size: 84, opacity: 0.18, offsetX: -trailShift - 14)
            ghostRing(size: 96, opacity: 0.26, offsetX: -trailShift)

            Circle()
                .stroke(ArenaTheme.orangeAccent, lineWidth: 7)
                .frame(width: 112, height: 112)
                .shadow(color: ArenaTheme.orangeAccent.opacity(0.5), radius: 24)
                .rotationEffect(.degrees(rotation))

            Circle()
                .fill(.white)
                .frame(width: 10, height: 10)
                .overlay(Circle().stroke(Color.white.opacity(0.6), lineWidth: 2))
        }
        .frame(height: 168)
        .onAppear {
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                rotation = 360
            }
            withAnimation(.linear(duration: 2.4).repeatForever(autoreverses: false)) {
                trailShift = 48
            }
        }
    }

    private func ghostRing(size: CGFloat, opacity: Double, offsetX: CGFloat) -> some View {
        Circle()
            .stroke(ArenaTheme.orangeAccent.opacity(opacity), lineWidth: 3)
            .frame(width: size, height: size)
            .offset(x: offsetX)
    }
}
