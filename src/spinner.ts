import cliSpinners, { SpinnerName } from "cli-spinners";
import GraphicsModel from "./models/GraphicsModel";

export function spinner(style: SpinnerName, x: number, y?: number) {
  let { frames, interval } = cliSpinners[style];
  let i = 0;
  return setInterval(() => {
    let frame = frames[i];
    i = (i + 1) % frames.length;
    GraphicsModel.printmv(frame, x, y);
  }, interval);
}

export function startSpinner(x: number, y?: number) {
  return spinner("dots", x, y);
}

export class Spinner {
  style: SpinnerName;
  handle?: NodeJS.Timer;

  constructor(style: SpinnerName) {
    this.style = style;
  }

  start(x: number, y?: number) {
    this.handle = spinner(this.style, x, y);
  }
  stop() {
    if (!this.handle) return;
    clearInterval(this.handle);
  }
}
