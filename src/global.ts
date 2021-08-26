export {}

declare global {
    interface Window {
        marked: any
    }
    interface Page {
        name: string,
        icon: string,
        color: string,
        innerHTML: string,
    }
    
    interface Folder {
        name: string,
        subDocs: (Page|Folder)[]
    }
}