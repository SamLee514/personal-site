// color
const BLUE = "#5E81AC";
const RED = "BF616A";
const ORANGE = "";
const YELLOW = "#EBCB8B";
const GREEN = "#A3BE8C";
const PINK = "#B48EAD";
const DAMP = "#D8DEE9";
const GREY = "#4C566A";

const parser = new DOMParser();

function isPage(item: Page | Folder): item is Page {
  return (item as Page).icon !== undefined;
}

async function getFileContentAndTabInfo(url: string) {
  const text = await (await fetch(url)).text();
  const parsed = parser.parseFromString(text, "text/html");
  const parsedColor = parsed.head?.getAttribute("color");
  const parsedIcon = parsed.head?.getAttribute("icon");
  return {
    color: parsedColor ? parsedColor : "#000000",
    icon: parsedIcon ? parsedIcon : "fas fa-file",
    innerHTML: parsed.body.innerHTML,
  };
}

// Helper for getContent. Recursively builds the content map using the provided content tree
async function getContentFromTree(
  tree: any,
  content: Map<string, Page | Folder>
) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") {
      const page = await getFileContentAndTabInfo(value);
      content.set(key, page);
    } else {
      const folder = new Map();
      content.set(key, folder);
      await getContentFromTree(value, folder);
    }
  }
}

async function getContent(): Promise<any> {
  //Promise<Map<string, Page | Folder>> {
  // const content =
  const contentTree = await (await fetch("content_tree.json")).json();
  const content = new Map<string, Page | Folder>();
  await getContentFromTree(contentTree, content);
  return content;
  // console.log("content!:", content);
  // const content = new Map();
  // content.set("about", {
  //   icon: "fas fa-portrait",
  //   color: PINK,
  //   innerHTML: await getInnerHTML("content/about.html"),
  // });
  // content.set("my-work", {});
  //   content.set("my-work", {
  //     subDocs: new Map([
  //       [
  //         "projects",
  //         {
  //           icon: "fas fa-tools",
  //           color: YELLOW,
  //           innerHTML: await getInnerHTML("content/projects.html"),
  //         },
  //       ],
  //       [
  //         "experience",
  //         {
  //           icon: "fas fa-globe-americas",
  //           color: GREEN,
  //           innerHTML: await getInnerHTML("content/experience.html"),
  //         },
  //       ],
  //     ]),
  //   });
  // content.set("blog", {
  //   subDocs: new Map([]),
  // });
  // content.set("resume", {
  //   icon: "fas fa-print",
  //   color: ORANGE,
  //   innerHTML: await getInnerHTML("content/resume.html"),
  // });
  // return content;
}

const startingItemIndex = 0;

function makeExclusivelyActive(name: string) {
  document
    .getElementById(`${currentlyActiveItemName}-explorer`)!
    .classList.remove("active");
  document.getElementById(`${name}-explorer`)!.classList.add("active");

  const newTab = document.getElementById(`${name}-tab`);
  const oldTab = document.getElementById(`${currentlyActiveItemName}-tab`);
  if (newTab !== null) {
    if (oldTab !== null) {
      oldTab!.classList.remove("active");
    }
    newTab!.classList.add("active");
  }

  currentlyActiveItemName = name;
}

function toggleOpenFolder(name: string) {
  const contents = document.getElementById(`${name}-accordion`)!;
  const id = `${name}-icon`;
  if (contents.style.maxHeight !== "0px") {
    document.getElementById(id)!.className = "fas fa-chevron-right";
    contents.style.maxHeight = "0px";
  } else {
    document.getElementById(id)!.className = "fas fa-chevron-down";
    contents.style.maxHeight = `${contents.scrollHeight}px`;
  }
}

function openPage(name: string, item: Page) {
  const tabId = `${name}-tab`;
  const closeId = `${name}-close`;
  const tab = document.getElementById(tabId);
  if (tab === null) {
    document.getElementById("tabs")!.innerHTML += `
            <button id="${tabId}" name=${name}>
                <i class="${item.icon}" style="color:${item.color}; width:1em"></i>
                <span>${name}</span>
                <i class="fas fa-times fa-xs close-button" id="${closeId}"></i>
            </button> 
        `;
  }
  const editor = document.getElementById("editor-content")!;
  editor.innerHTML = item.innerHTML;
  (editor as HTMLElement).parentElement!.classList.remove("inactive");
  makeExclusivelyActive(name);
}

let currentlyActiveItemName: string;

async function createExplorerButtons(
  container: HTMLElement,
  items: Map<string, Page | Folder>,
  keyPrefix: string | null
) {
  items.forEach((item, name) => {
    const processedName = keyPrefix ? keyPrefix + "/" + name : name;
    const buttonId = `${processedName}-explorer`;
    if (isPage(item)) {
      container.innerHTML += `
                <button id="${buttonId}" name="${processedName}">
                    <i class="${item.icon}" style="color:${item.color}; width:1em"></i>
                    ${name}
                </button>
            `;
    } else {
      const iconId = `${name}-icon`;
      const accordionId = `${name}-accordion`;
      container.innerHTML += `
                <button id="${buttonId}" name="${processedName}">
                    <i id="${iconId}" class="fas fa-chevron-right" style="color:${DAMP}; width:1em"></i>
                    ${name}
                </button>
                <div id="${accordionId}" class="folder-contents" style="max-height:0px;overflow:hidden;"></div>
            `;
      createExplorerButtons(
        document.getElementById(`${accordionId}`)!,
        item,
        processedName
      );
    }
  });
}

// Given a content map and a set of nested paths, access the deepest item
// For example, given path "my-work/projects/project-1", keys should be ["my-work", "projects", "project-1"]
// If content is { "my-work": { "projects": { "project-1": "deepest-item", ... }, ... }, ... },
// then this function will return "deepest-item"
function deepAccess(
  content: Map<string, Page | Folder>,
  keys: string[]
): Page | Folder {
  if (keys.length === 1) {
    return content.get(keys[0])!;
  }
  return deepAccess(content.get(keys[0])! as Folder, keys.slice(1));
}

async function main() {
  const content = await getContent();
  console.log("content!:", content);
  createExplorerButtons(document.getElementById("explorer")!, content, null);
  currentlyActiveItemName = "about";
  openPage("about", content.get("about") as Page);

  document
    .getElementById("explorer")!
    .addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let element;
      if ((e.target! as HTMLElement).tagName === "BUTTON") {
        element = e.target!;
      } else if (
        (e.target! as HTMLElement).parentElement!.tagName === "BUTTON"
      ) {
        element = (e.target! as HTMLElement).parentElement!;
      } else {
        return;
      }
      const name = (element as HTMLElement).getAttribute("name")!;
      const item = deepAccess(content, name.split("/"))!;
      if (isPage(item)) {
        openPage(name, item);
      } else {
        toggleOpenFolder(name);
      }
    });

  document
    .getElementById("tabs")!
    .addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      let element;
      if ((e.target! as HTMLElement).tagName === "BUTTON") {
        element = e.target!;
      } else if (
        (e.target! as HTMLElement).parentElement!.tagName === "BUTTON"
      ) {
        element = (e.target! as HTMLElement).parentElement!;
        if ((e.target! as HTMLElement).classList.contains("close-button")) {
          if (element.nextElementSibling) {
            const name = (
              element.nextElementSibling as HTMLElement
            ).getAttribute("name")!;
            openPage(name, deepAccess(content, name.split("/"))! as Page);
          } else if (element.previousElementSibling) {
            const name = (
              element.previousElementSibling as HTMLElement
            ).getAttribute("name")!;
            openPage(name, deepAccess(content, name.split("/"))! as Page);
          } else {
            document
              .getElementById(`${currentlyActiveItemName}-explorer`)!
              .classList.remove("active");
            const editor = document.getElementById("editor-content")!;
            editor.innerHTML = `<i class="fas fa-smile-wink fa-10x" style="color:${GREY};"></i>`;
            (editor as HTMLElement).parentElement!.classList.add("inactive");
            (editor as HTMLElement).parentElement!.classList.remove("wide");
            document
              .getElementById("drawer-button")!
              .classList.remove("closed");
          }
          (e.target! as HTMLElement).parentElement!.remove();
          return;
        }
      } else {
        return;
      }
      const name = (element as HTMLElement).getAttribute("name")!;
      const item = deepAccess(content, name.split("/"))!;
      if (isPage(item)) {
        openPage(name, item);
      } else {
        toggleOpenFolder(name);
      }
    });

  document
    .getElementById("drawer-button")!
    .addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
      document.getElementById("editor")!.classList.toggle("wide");
      this.classList.toggle("closed");
    });
}

main();
