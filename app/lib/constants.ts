import type { CSSProperties } from "react";

export const starterMarkdown = `# Atlas Markdown Studio

Write in the editor. Preview on the right.

- Swap sides for left-right control
- Focus one panel to take the full page
- Save to DynamoDB and track your files

\`\`\`ts
const message = "Ship it.";
console.log(message);
\`\`\`
`;

export const pageStyle = {
  "--panel": "#ffffff",
  "--panel-muted": "#f4f1ed",
  "--accent": "#ff7a5c",
  "--accent-strong": "#ea5d3d",
  "--ink": "#1d1c1a",
} as CSSProperties;
