export {};

declare global {
  interface Window {
    marked: any;
  }
  interface Page {
    icon: string;
    color: string;
    innerHTML: string;
  }
  type Folder = Map<string, Page | Folder>;
}
