// fillEmptyComponents.js
import fs from "fs";
import path from "path";

const baseDir = path.join("src", "components");

// Recursively go through all folders and find empty .jsx files
function fillEmptyFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      fillEmptyFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".jsx")) {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        const compName = path.basename(entry.name, ".jsx");
        const placeholder = `
export default function ${compName}() {
  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <h2>${compName} Placeholder</h2>
      <p>This component is under development.</p>
    </div>
  );
}
`;
        fs.writeFileSync(fullPath, placeholder.trimStart());
        console.log(`✅ Filled: ${fullPath}`);
      } else {
        console.log(`⚙️  Skipped (not empty): ${fullPath}`);
      }
    }
  }
}

fillEmptyFiles(baseDir);
console.log("\n🎉 All empty .jsx files now contain placeholder code!");
