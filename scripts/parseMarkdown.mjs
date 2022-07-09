import { marked } from "marked";
import * as fs from "fs";
import path from "path";

const dir = "content/blog";
fs.readdirSync(dir).forEach((file) => {
  let fullPath = path.join(dir, file);
  const parsed = marked(fs.readFileSync(fullPath, "utf8"));

  // if (url.endsWith(".md")) {
  //   // Preset icon and color based on ascii value of first character of file name
  //   color = COLORS[Object.keys(COLORS)[url.split("/")[1].charCodeAt(0) % 7]]; // isolate file name
  //   icon = "fas fa-file-alt";
  //   innerHTML = `
  //   <zero-md src="${url}">
  //     <template>
  //       <link rel="stylesheet" href="/style.css" />
  //     </template>
  //   </zero-md>
  //   `;
  // } else {
  // Requires the public folder to exist at the same level as src
  fs.writeFileSync(
    `../public/content/blog/${path.parse(file).name}.html`,
    parsed
  );
});
