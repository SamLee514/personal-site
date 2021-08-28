export {}

declare global {
    interface Window {
        marked: any
    }
    interface Page {
        icon: string,
        color: string,
        innerHTML: string,
    }
    
    interface Folder {
        subDocs: Map<string, (Page|Folder)>
    }
}