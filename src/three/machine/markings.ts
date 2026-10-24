// Drawings for the printed markings on the machine, matched to VOLTA's
// control-panel render (volta-ui.webp) and the reveal video.

type Fonts = { sans: string; mono: string };
const INK = "rgba(34, 36, 38, 0.82)";

/** POWER / BREWING on the left of the slanted face, BOILER / STEAM on the right. */
export function drawPanelLabels(ctx: CanvasRenderingContext2D, w: number, h: number, f: Fonts) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = INK;
  ctx.font = `500 ${Math.round(h * 0.13)}px ${f.mono}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("POWER", w * 0.04, h * 0.2);
  ctx.fillText("BREWING", w * 0.04, h * 0.66);
  ctx.textAlign = "right";
  ctx.fillText("BOILER", w * 0.96, h * 0.2);
  ctx.fillText("STEAM", w * 0.96, h * 0.66);
}

export function drawWordmark(ctx: CanvasRenderingContext2D, w: number, h: number, f: Fonts) {
  ctx.clearRect(0, 0, w, h);
  ctx.font = `600 ${Math.round(h * 0.72)}px ${f.sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // engraved: a dark lower edge and a light upper edge
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("VOLTA", w / 2, h / 2 - 2);
  ctx.fillStyle = "rgba(40,42,44,0.38)";
  ctx.fillText("VOLTA", w / 2, h / 2 + 2);
  ctx.fillStyle = "rgba(150,155,160,0.55)";
  ctx.fillText("VOLTA", w / 2, h / 2);
}

function iconFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = h * 0.07;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

export function drawPowerIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  iconFrame(ctx, w, h);
  const cx = w / 2, cy = h * 0.54, r = h * 0.24;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2 + 0.7, -Math.PI / 2 - 0.7 + Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.25);
  ctx.lineTo(cx, cy - r * 0.15);
  ctx.stroke();
}

export function drawCupIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  iconFrame(ctx, w, h);
  const cx = w / 2, top = h * 0.3, bot = h * 0.72, half = h * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx - half, top);
  ctx.lineTo(cx + half, top);
  ctx.lineTo(cx + half * 0.8, bot);
  ctx.lineTo(cx - half * 0.8, bot);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + half * 1.05, (top + bot) / 2 - h * 0.02, h * 0.09, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}

export function drawSteamIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  iconFrame(ctx, w, h);
  for (const dx of [-0.13, 0, 0.13]) {
    const x = w / 2 + dx * h * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.24);
    ctx.bezierCurveTo(x + h * 0.08, h * 0.38, x - h * 0.08, h * 0.52, x, h * 0.76);
    ctx.stroke();
  }
}

/** Perforation pattern of the drip grate (dark holes on transparent). */
export function drawGrateHoles(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(10,11,12,0.9)";
  const cols = 9, rows = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5 + (r % 2) * 0.5) / (cols + 0.5)) * w;
      const y = ((r + 0.5) / rows) * h;
      const dx = x / w - 0.5, dy = y / h - 0.5;
      if (dx * dx * 1.2 + dy * dy > 0.16) continue; // round field, like the render
      ctx.beginPath();
      ctx.arc(x, y, h * 0.032, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
