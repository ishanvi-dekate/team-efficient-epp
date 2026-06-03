import SwiftUI

struct SparklineView: View {
    var values: [Double]
    var color: Color = .indigo
    var lineWidth: CGFloat = 2

    var body: some View {
        GeometryReader { geo in
            if values.count >= 2 {
                let min = values.min() ?? 0
                let max = values.max() ?? 1
                let range = max == min ? 1 : max - min
                let points = values.enumerated().map { i, v in
                    CGPoint(
                        x: CGFloat(i) / CGFloat(values.count - 1) * geo.size.width,
                        y: geo.size.height - CGFloat((v - min) / range) * geo.size.height
                    )
                }
                Path { path in
                    path.move(to: points[0])
                    for pt in points.dropFirst() { path.addLine(to: pt) }
                }
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round))
            }
        }
    }
}
