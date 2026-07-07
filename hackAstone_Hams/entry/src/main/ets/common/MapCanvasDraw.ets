import { MapProjection } from './MapProjection';

/** 在 Canvas 上绘制 GeoJSON 转换后的 Path commands（与标点共用 map 坐标系）。 */
export function drawLandPathOnCanvas(
  ctx: CanvasRenderingContext2D,
  commands: string,
  mapW: number,
  mapH: number
): void {
  if (commands.length === 0) {
    return;
  }
  ctx.save();
  ctx.fillStyle = '#174E6380';
  ctx.strokeStyle = '#BAE6FD55';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  parsePathCommands(ctx, commands);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function parsePathCommands(ctx: CanvasRenderingContext2D, commands: string): void {
  const tokens = commands.split(/\s+/).filter((t: string) => t.length > 0);
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i];
    if ((cmd === 'M' || cmd === 'L') && i + 2 < tokens.length) {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      if (cmd === 'M') {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      i += 3;
    } else if (cmd === 'Z') {
      ctx.closePath();
      i += 1;
    } else {
      i += 1;
    }
  }
}

/** 无 GeoJSON 时的简化大陆块，锚点与 regionGeoLayout 同一投影。 */
export function drawSimplifiedLandOnCanvas(ctx: CanvasRenderingContext2D): void {
  const blobs: number[][] = [
    [-99, 38, 220, 130],
    [14, 50, 180, 110],
    [45, 31, 120, 90],
    [79, 22, 130, 95],
    [116, 36, 160, 120],
  ];
  ctx.save();
  ctx.fillStyle = '#174E6380';
  for (let bi = 0; bi < blobs.length; bi++) {
    const lon = blobs[bi][0];
    const lat = blobs[bi][1];
    const w = blobs[bi][2];
    const h = blobs[bi][3];
    const cx = MapProjection.lonToX(lon);
    const cy = MapProjection.latToY(lat);
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
