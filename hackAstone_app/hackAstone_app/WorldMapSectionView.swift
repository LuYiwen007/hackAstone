import SwiftUI

/// 首页世界地图：陆地 Path + 海区渐变 + 地区锚点；仅地图区域支持双指缩放与拖拽，外层「世界地图」标题与卡片尺寸不变。
struct WorldMapSectionView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var selectedRegion: String?
    let currentPeriod: CatalogTimePeriodMeta
    let philosophers: [Philosopher]

    @State private var landPath = Path()
    @State private var pinchBase: CGFloat = 1
    @State private var pinchGesture: CGFloat = 1
    @State private var panOffset: CGSize = .zero
    @GestureState private var panDrag: CGSize = .zero

    private let pinchMax: CGFloat = 4

    var body: some View {
        let L = locale.L
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: "globe.asia.australia.fill")
                    .foregroundStyle(ArenaTheme.cyanAccent)
                Text(L.worldMapTitle)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
            }

            GeometryReader { geo in
                let W = CatalogMeta.mapViewBox.width
                let H = CatalogMeta.mapViewBox.height
                let baseFit = min(geo.size.width / W, geo.size.height / H)
                let pinch = min(max(pinchBase * pinchGesture, 1), pinchMax)
                let totalScale = baseFit * pinch
                let pan = CGSize(width: panOffset.width + panDrag.width, height: panOffset.height + panDrag.height)

                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(colors: [Color(red: 0.03, green: 0.12, blue: 0.18).opacity(0.55), ArenaTheme.background], startPoint: .top, endPoint: .bottom)
                        )

                    mapCore(L: L)
                        .frame(width: W, height: H)
                        .scaleEffect(totalScale, anchor: .topLeading)
                        .offset(pan)
                }
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(ArenaTheme.border))
                .contentShape(Rectangle())
                .gesture(
                    MagnificationGesture()
                        .onChanged { pinchGesture = $0 }
                        .onEnded { _ in
                            pinchBase = min(max(pinchBase * pinchGesture, 1), pinchMax)
                            pinchGesture = 1
                            clampPan(geo: geo.size, W: W, H: H, baseFit: baseFit)
                        }
                )
                .simultaneousGesture(
                    DragGesture()
                        .updating($panDrag) { value, state, _ in
                            state = value.translation
                        }
                        .onEnded { value in
                            panOffset.width += value.translation.width
                            panOffset.height += value.translation.height
                            clampPan(geo: geo.size, W: W, H: H, baseFit: baseFit)
                        }
                )
            }
            .aspectRatio(CatalogMeta.mapViewBox.width / CatalogMeta.mapViewBox.height, contentMode: .fit)
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
        .onAppear {
            if landPath.isEmpty, let url = Bundle.main.url(forResource: "ne_110m_land", withExtension: "json"),
               let data = try? Data(contentsOf: url),
               let p = try? MapProjection.buildLandPath(from: data)
            {
                landPath = p
            }
        }
    }

    private func currentPinch() -> CGFloat {
        min(max(pinchBase * pinchGesture, 1), pinchMax)
    }

    private func clampPan(geo: CGSize, W: CGFloat, H: CGFloat, baseFit: CGFloat) {
        let pinch = currentPinch()
        let scaledW = W * baseFit * pinch
        let scaledH = H * baseFit * pinch
        let minX = min(0, geo.width - scaledW)
        let minY = min(0, geo.height - scaledH)
        panOffset.width = min(0, max(panOffset.width, minX))
        panOffset.height = min(0, max(panOffset.height, minY))
    }

    private func mapCore(L: ArenaL10n) -> some View {
        ZStack(alignment: .topLeading) {
            landPath
                .fill(
                    LinearGradient(colors: [Color(red: 0.09, green: 0.31, blue: 0.39).opacity(0.7), Color(red: 0.03, green: 0.15, blue: 0.2).opacity(0.35)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
            landPath
                .stroke(Color.white.opacity(0.12), lineWidth: 0.55)
            landPath
                .stroke(Color(red: 0.65, green: 0.95, blue: 0.99).opacity(0.92), lineWidth: 1.2)

            ForEach(CatalogMeta.oceanLabels, id: \.id) { label in
                Text(label.text)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(Color(red: 0.73, green: 0.9, blue: 0.99).opacity(0.22))
                    .kerning(4)
                    .position(x: label.x, y: label.y)
            }

            ForEach(CatalogMeta.regions) { region in
                regionOverlay(region: region, L: L)
            }
        }
    }

    @ViewBuilder
    private func regionOverlay(region: RegionMeta, L: ArenaL10n) -> some View {
        let layout = CatalogMeta.regionGeoLayout[region.id]
        let anchorX: CGFloat = {
            if let layout { return MapProjection.lonToX(layout.lon) }
            return CGFloat(region.x) / 100 * CatalogMeta.mapViewBox.width
        }()
        let anchorY: CGFloat = {
            if let layout { return MapProjection.latToY(layout.lat) }
            return CGFloat(region.y) / 100 * CatalogMeta.mapViewBox.height
        }()
        let items = CatalogMeta.getPhilosophersByPeriodAndRegion(period: currentPeriod, region: region.id, source: philosophers)
        let preview = Array(items.prefix(6))
        let active = selectedRegion == region.id
        let cardOffsetX = layout?.cardOffsetX ?? 0
        let cardOffsetY = layout?.cardOffsetY ?? 0
        let regionTitle = L.regionName(id: region.id)

        Button {
            selectedRegion = region.id
        } label: {
            VStack(spacing: 0) {
                VStack(spacing: 6) {
                    Text(regionTitle)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                    Text(items.isEmpty ? L.noFiguresShort : L.philosopherCount(items.count))
                        .font(.caption2)
                        .foregroundStyle(ArenaTheme.textMuted)
                    if !preview.isEmpty {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 26), spacing: 4)], spacing: 4) {
                            ForEach(preview) { p in
                                PhilosopherAvatarView(philosopher: p, size: 26)
                            }
                        }
                        .frame(maxWidth: 132)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
                .background(active ? Color.cyan.opacity(0.12) : Color.black.opacity(0.35))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(active ? ArenaTheme.cyanAccent.opacity(0.7) : ArenaTheme.border))
                .offset(x: cardOffsetX, y: cardOffsetY)

                Rectangle()
                    .fill(active ? ArenaTheme.cyanMuted : ArenaTheme.cyanAccent.opacity(0.65))
                    .frame(width: 2, height: active ? 28 : 22)
                    .padding(.top, 2)

                Circle()
                    .fill(active ? ArenaTheme.cyanMuted : ArenaTheme.cyanAccent)
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(Color.black.opacity(0.95), lineWidth: 2))
            }
            .position(x: anchorX, y: anchorY - 48)
        }
        .buttonStyle(.plain)
    }
}
