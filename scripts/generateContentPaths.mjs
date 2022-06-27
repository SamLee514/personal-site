import * as fs from "fs";
import path from "path";

function traverseDir(dir, tree) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file);
    const name = path.parse(file).name;
    if (name in tree) throw new Error(`Duplicate file name: ${name}`);
    if (fs.lstatSync(fullPath).isDirectory()) {
      tree[name] = {};
      traverseDir(fullPath, tree[name]);
    } else {
      tree[name] = "/" + fullPath;
    }
  });
}

const tree = {};
traverseDir("content", tree);
fs.writeFileSync("content_tree.json", JSON.stringify(tree, null, 2));
