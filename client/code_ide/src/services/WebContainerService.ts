import { WebContainer } from '@webcontainer/api';

class WebContainerService {
  private static instance: WebContainerService;
  private webcontainerPromise: Promise<WebContainer> | null = null;
  private _webcontainer: WebContainer | null = null;

  private constructor() {}

  static getInstance() {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  async load() {
    if (this._webcontainer) return this._webcontainer;
    if (this.webcontainerPromise) return this.webcontainerPromise;

    this.webcontainerPromise = WebContainer.boot();
    this._webcontainer = await this.webcontainerPromise;
    return this._webcontainer;
  }

  async mount(files: any) {
    const webcontainer = await this.load();
    await webcontainer.mount(files);
  }

  async spawn(command: string, args: string[], onData: (data: string) => void) {
    const webcontainer = await this.load();
    const process = await webcontainer.spawn(command, args);
    process.output.pipeTo(new WritableStream({
      write(data) {
        onData(data);
      }
    }));
    return process;
  }

  get webcontainer() {
    return this._webcontainer;
  }
}

export const webcontainerService = WebContainerService.getInstance();
