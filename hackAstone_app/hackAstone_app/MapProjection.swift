import CoreGraphics
import Foundation
import SwiftUI

enum MapProjection {
    static let viewBox = CatalogMeta.mapViewBox

    static func lonToX(_ lon: Double) -> CGFloat {
        CGFloat((lon + 180) / 360) * viewBox.width
    }

    static func latToY(_ lat: Double) -> CGFloat {
        let r = CatalogMeta.mapLatRange
        return CGFloat((r.max - lat) / (r.max - r.min)) * viewBox.height
    }

    static func addRing(_ ring: [[Double]], to path: inout Path) {
        guard let first = ring.first, first.count >= 2 else { return }
        path.move(to: CGPoint(x: lonToX(first[0]), y: latToY(first[1])))
        for pt in ring.dropFirst() where pt.count >= 2 {
            path.addLine(to: CGPoint(x: lonToX(pt[0]), y: latToY(pt[1])))
        }
        path.closeSubpath()
    }

    static func addPolygonRings(_ rings: [[[Double]]], to path: inout Path) {
        for ring in rings { addRing(ring, to: &path) }
    }

    static func buildLandPath(from data: Data) throws -> Path {
        var path = Path()
        let root = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        let features = root["features"] as! [[String: Any]]
        for feature in features {
            guard let geom = feature["geometry"] as? [String: Any],
                  let type = geom["type"] as? String,
                  let coords = geom["coordinates"] else { continue }
            if type == "Polygon" {
                let rings = coords as! [[[Double]]]
                addPolygonRings(rings, to: &path)
            } else if type == "MultiPolygon" {
                let polys = coords as! [[[[Double]]]]
                for poly in polys {
                    addPolygonRings(poly, to: &path)
                }
            }
        }
        return path
    }
}
