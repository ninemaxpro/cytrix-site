declare module "asciinema-player" {
  interface PlayerOptions {
    theme?: string;
    autoPlay?: boolean;
    loop?: boolean;
    fit?: string;
    terminalFontSize?: string;
    rows?: number;
  }
  export function create(src: string, container: HTMLElement, options?: PlayerOptions): void;
}
