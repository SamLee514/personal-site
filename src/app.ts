import countapi from "countapi-js";

const COLORS: { [key: string]: string } = {
  BLUE: "#5E81AC",
  RED: "BF616A",
  ORANGE: "#D08770",
  YELLOW: "#EBCB8B",
  GREEN: "#A3BE8C",
  PINK: "#B48EAD",
  DAMP: "#D8DEE9",
  GREY: "#4C566A",
};

const parser = new DOMParser();

function isPage(item: Page | Folder): item is Page {
  return (item as Page).icon !== undefined;
}

async function getFileContentAndTabInfo(url: string) {
  let color: string, icon: string, innerHTML: string;

  const text = await (await fetch(url)).text();
  const parsed = parser.parseFromString(text, "text/html");
  const parsedColor = parsed.head?.getAttribute("color");
  const parsedIcon = parsed.head?.getAttribute("icon");
  color =
    parsedColor && parsedColor in COLORS
      ? COLORS[parsedColor]
      : COLORS[Object.keys(COLORS)[url.split("/")[1].charCodeAt(0) % 7]]; // generate color from file name
  icon = parsedIcon || "fas fa-file";
  innerHTML = parsed.body?.innerHTML || "";
  // }
  return { color, icon, innerHTML };
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
  const contentTree = await (await fetch("/content_tree.json")).json();
  const content = new Map<string, Page | Folder>();
  await getContentFromTree(contentTree, content);
  return content;
}

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

// TODO: opening a folder inside another folder should increase max height for the opened parent folder
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

const times = {} as { [key: string]: number };
function reasonablyUpdateViewCount(namespace: string, key: string) {
  // TODO: might be useful to change this to timer. This is arbitrary and inconsistent.
  const thisItemName = currentlyActiveItemName;
  if (!times[thisItemName]) times[thisItemName] = 2000;
  let delta = 1;
  const timer = setInterval(async function () {
    times[thisItemName] -= delta;
    // Pause timer if navigated away from page
    if (document.hidden) return;
    // Kill timer and save if navigated away from in-page tab
    if (currentlyActiveItemName !== thisItemName || times[thisItemName] < 0) {
      clearInterval(timer);
      return;
    }
    // Update viewcount after 10,000 cycles
    if (times[thisItemName] === 0) {
      const { value } = await countapi.hit(namespace, key);
      console.log(
        `All right, you've been here long enough. Thanks for being viewer number ${value} of this page!`
      );
    }
  }, delta);
}

async function openPage(name: string, item: Page) {
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
  window.history.replaceState({}, "", "/" + name);
  // Analytics
  const namespace =
    process.env.NODE_ENV === "production"
      ? window.location.hostname
      : "samlee.dev-development";
  const key = name.replaceAll("/", "_");
  const { value: views } = await countapi.get(namespace, key);
  const viewsAndDate = document.getElementById("viewsAndDate");
  if (viewsAndDate)
    viewsAndDate.innerHTML = `${views} ${viewsAndDate.innerHTML}`;
  reasonablyUpdateViewCount(namespace, key);
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
      const iconId = `${processedName}-icon`;
      const accordionId = `${processedName}-accordion`;
      container.innerHTML += `
                <button id="${buttonId}" name="${processedName}">
                    <i id="${iconId}" class="fas fa-chevron-right" style="color:${COLORS.DAMP}; width:1em"></i>
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

// Given a content map and a path, access the deepest item
// For example, given path "my-work/projects/project-1" and content
// { "my-work": { "projects": { "project-1": "deepest-item", ... }, ... }, ... },
// then this function will return "deepest-item"
function deepAccess(
  content: Map<string, Page | Folder>,
  path: string
): Page | Folder {
  const keys = path.split("/");
  if (keys.length === 1) {
    return content.get(keys[0])!;
  }
  return deepAccess(content.get(keys[0])! as Folder, path.split("/", 2)[1]);
}

async function main() {
  const content = await getContent();
  createExplorerButtons(document.getElementById("explorer")!, content, null);
  // Basic routing; currentlyActiveItemName is also the path name of the currently active page
  currentlyActiveItemName = window.location.pathname.substring(1);
  if (currentlyActiveItemName === "") {
    currentlyActiveItemName = "about";
    window.history.replaceState({}, "", "/" + currentlyActiveItemName);
  }
  openPage(
    currentlyActiveItemName,
    deepAccess(content, currentlyActiveItemName) as Page
  );
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
      const item = deepAccess(content, name)!;
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
            openPage(name, deepAccess(content, name)! as Page);
          } else if (element.previousElementSibling) {
            const name = (
              element.previousElementSibling as HTMLElement
            ).getAttribute("name")!;
            openPage(name, deepAccess(content, name)! as Page);
          } else {
            document
              .getElementById(`${currentlyActiveItemName}-explorer`)!
              .classList.remove("active");
            const editor = document.getElementById("editor-content")!;
            editor.innerHTML = `<i class="fas fa-smile-wink fa-10x" style="color:${COLORS.GREY};"></i>`;
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
      const item = deepAccess(content, name)!;
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
