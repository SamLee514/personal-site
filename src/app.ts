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
                    innerHTML: await processMarkdown("public/content/test.md")
                }
            ]
        },
        // {
        //     name: "about",
        //     icon: "fas fa-portrait",
        //     color: GREEN,
        //     innerHTML: await processMarkdown("public/content/test.md") 
        // },
    ]
}

function openPage() {
    console.log("Implement!");
}

// function toggleOpenFolder(button: HTMLElement) {
//     // console.log("Implement!");
//     if (button.classList.contains("active")) {

//     }
//     button.innerHTML =  `
//         <i class="fas fa-chevron-right" style="color:#4C566A; width:1em"></i>
//         ${item.name}
//     `
// }

function makeExclusivelyActive(button: HTMLElement) {
    currentlyActiveButton.classList.remove("active");
    button.classList.add("active");
    currentlyActiveButton = button;
}

function toggleOpenFolder(name: string) {
    const contents = document.getElementById(`_${name}-contents`)!;
    if (contents.style.maxHeight !== "0px") {
        document.getElementById(`_${name}-icon`)!.className = "fas fa-chevron-right";
        contents.style.maxHeight = "0px";
    } else {
        document.getElementById(`_${name}-icon`)!.className = "fas fa-chevron-down";
        contents.style.maxHeight = `${contents.scrollHeight}px`;
    }
}

let currentlyActiveButton: HTMLElement;

async function fillHTML(element: HTMLElement, items: (Page|Folder)[]) {
    // Set up all explorer buttons
    items.forEach(item => {
        if (isPage(item)) {
            element.innerHTML += `
                <button id="_${item.name}">
                    <i class="${item.icon}" style="color:${item.color}; width:1em"></i>
                    ${item.name}
                </button>
            `
        } else {
            element.innerHTML += `
                <button id="_${item.name}">
                    <i id="_${item.name}-icon" class="fas fa-chevron-right" style="color:${DAMP}; width:1em"></i>
                    ${item.name}
                </button>
                <div id="_${item.name}-contents" class="folder-contents" style="max-height:0px;overflow:hidden;"></div>
            `
            fillHTML(document.getElementById(`_${item.name}-contents`)!, item.subDocs);
        }
    });
    // Add event listeners to explorer buttons
    items.forEach(item => {
        document.getElementById(`_${item.name}`)!.addEventListener("click", function (this: HTMLElement, e: MouseEvent) {
            e.preventDefault();
            makeExclusivelyActive(this);
            if (isPage(item)) {
            } else {
                toggleOpenFolder(item.name);
            }
        });
    })
    
}

async function main() {
    const content = await getContent();
    fillHTML(document.getElementById("explorer")!, content);
    currentlyActiveButton = document.getElementById("_about")!;
    makeExclusivelyActive(currentlyActiveButton);
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