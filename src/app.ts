// color
const BLUE = "#5E81AC";
const RED = "BF616A";
const ORANGE = "#D08770";
const YELLOW = "#EBCB8B";
const GREEN = "#A3BE8C";
const PINK = "#B48EAD";
const DAMP = "#D8DEE9";

function isPage(item: Page | Folder): item is Page {
    return (item as Page).icon !== undefined;
}

async function processMarkdown(url: string) {
    const markdown = await (await fetch(url)).text();
    return window.marked(markdown);
};

async function getContent(): Promise<(Page|Folder)[]> {
    return [
        {
            name: "about",
            icon: "fas fa-portrait",
            color: GREEN,
            innerHTML: await processMarkdown("public/content/test.md") 
        },
        {
            name: "my work",
            subDocs: [
                {
                    name: "projects",
                    icon: "fas fa-tools",
                    color: YELLOW,
                    innerHTML: await processMarkdown("public/content/projects.md")
                }
            ]
        },
    ]
}

const startingItemIndex = 0;

function makeExclusivelyActive(name: string) {
    document.getElementById(`${currentlyActiveItemName}-explorer`)!.classList.remove("active");
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
    const id = `${name}-icon`
    if (contents.style.maxHeight !== "0px") {
        document.getElementById(id)!.className = "fas fa-chevron-right";
        contents.style.maxHeight = "0px";
    } else {
        document.getElementById(id)!.className = "fas fa-chevron-down";
        contents.style.maxHeight = `${contents.scrollHeight}px`;
    }
}

function openPage(item: Page) {
    console.log("Implement!");
    const tabId = `${item.name}-tab`;
    const closeId = `${item.name}-close`;
    const tab = document.getElementById(tabId);
    if (tab === null) {
        document.getElementById('tabs')!.innerHTML += `
            <button id="${tabId}">
                <i class="${item.icon}" style="color:${item.color}; width:1em"></i>
                ${item.name}
                <i class="fas fa-times fa-xs close-button" id="${closeId}" onclick="document.getElementById('${tabId}').remove();"></i>
            </button> 
        `
    }
    const editor = document.getElementById("editor")! 
    editor.innerHTML = item.innerHTML;
    editor.classList.add("active");
}

let currentlyActiveItemName: string;

async function fillHTML(element: HTMLElement, items: (Page|Folder)[]) {
    // Set up all explorer buttons
    items.forEach(item => {
        const buttonId = `${item.name}-explorer`;
        if (isPage(item)) {
            element.innerHTML += `
                <button id="${buttonId}">
                    <i class="${item.icon}" style="color:${item.color}; width:1em"></i>
                    ${item.name}
                </button>
            `
        } else {
            const iconId = `${item.name}-icon`;
            const accordionId = `${item.name}-accordion`;
            element.innerHTML += `
                <button id="${buttonId}">
                    <i id="${iconId}" class="fas fa-chevron-right" style="color:${DAMP}; width:1em"></i>
                    ${item.name}
                </button>
                <div id="${accordionId}" class="folder-contents" style="max-height:0px;overflow:hidden;"></div>
            `
            fillHTML(document.getElementById(`${accordionId}`)!, item.subDocs);
        }
    });
    // Add event listeners to explorer buttons
    items.forEach(item => {
        document.getElementById(`${item.name}-explorer`)!.addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
            e.preventDefault();
            if (isPage(item)) {
                openPage(item);
            } else {
                toggleOpenFolder(item.name);
            }
            makeExclusivelyActive(item.name);
        });
    })
    
}

async function main() {
    const content = await getContent();
    fillHTML(document.getElementById("explorer")!, content);
    currentlyActiveItemName = "about";
    openPage(content[startingItemIndex] as Page);
    makeExclusivelyActive(currentlyActiveItemName);
    // document.getElementById(`_about`)!.addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
    //     e.preventDefault();
    //     console.log(this);
    //     makeExclusivelyActive(this);
    // })
}

main();
// (await getContent()).forEach(page => {
//     explorer.innerHTML = page.innerHTML;
//     console.log("hey")
// })


// const container: HTMLElement | any = document.getElementById("app");
// const pokemons: number = 100;

// interface IPokemon {
//   id: number;
//   name: string;
//   image: string;
//   type: string;
// }

// const fetchData = (): void => {
//   for (let i = 1; i <= pokemons; i++) {
//     getPokemon(i);
//   }
// };

// const getPokemon = async (id: number): Promise<void> => {
//   const data: Response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
//   const pokemon: any = await data.json();
//   const pokemonType: string = pokemon.types
//     .map((poke: any) => poke.type.name)
//     .join(", ");

//   const transformedPokemon = {
//     id: pokemon.id,
//     name: pokemon.name,
//     image: `${pokemon.sprites.front_default}`,
//     type: pokemonType
//   };

//   showPokemon(transformedPokemon);
// };

// const showPokemon = (pokemon: IPokemon): void => {
//   let output: string = `
//         <div class="card">
//             <span class="card--id">#${pokemon.id}</span>
//             <img class="card--image" src=${pokemon.image} alt=${pokemon.name} />
//             <h1 class="card--name">${pokemon.name}</h1>
//             <span class="card--details">${pokemon.type}</span>
//         </div>
//     `;
//   container.innerHTML += output;
// };

// fetchData();