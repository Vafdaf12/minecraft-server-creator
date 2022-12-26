import { stdout } from "process";
import { cursor } from "sisteransi";
import { repeatStr } from "../utils";
import kleur from "kleur";
import { Spinner } from "../spinner";
// import { TIMES } from "../constants";

export const CHECK = '\u2714';
export const TIMES = '✖';
export const ARROW = '\u276F';

const DIVIDER = repeatStr("-", 40);
const SPINNER = new Spinner("dots");

/**
 * This singleton deals with all things related to console
 * output. This acts as a unified location for performing
 * any output operations.
 */
class GraphicsModel {
    /**
     * Outputs some text at the specified position
     * @param text The text to output
     * @param x The x-position of the text
     * @param y The y-position of the text
     */
    public printmv(text: string, x: number, y?: number) {
        stdout.write(cursor.to(x, y) + text);
    }

    /**
     * Hides/Shows the cursor
     * @param show whether the cursor should be shown
     */
    public setCursor(show: boolean) {
        stdout.write(show ? cursor.show : cursor.hide);
    }

    /**
     * Writes a new line to the console
     */
    public newline() {
        //! For some reason, manually moving the
        //! cursor doesn't work, but this does
        console.log();
        
    }

    /**
     * Writes a divider line to the console
     */
    public divider() {
        console.log("\n" + kleur.dim(DIVIDER) + "\n");
    }

    /**
     * Outputs some text as a formatted error message
     * @param msg the message to output
     */
    public error(msg: string) {
        console.log(kleur.red(TIMES) + " " + kleur.bold(msg));
    }

    public startSpinner(x: number, y?: number) {
        SPINNER.start(x, y);
    }
    public stopSpinner() {
        SPINNER.stop();
    }

    public setSpinner(show: boolean, x?: number, y?: number) {
        if(show) SPINNER.start(x || 0, y);
        else SPINNER.stop();
    }

}

export default new GraphicsModel();