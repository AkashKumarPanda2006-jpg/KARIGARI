
const fs = require("fs");
let content = fs.readFileSync("src/app/artisan/schemes/page.tsx", "utf8");

content = content.replace(
  `Government Schemes`,
  `{language === "or" ? "?????? ?????" : language === "hi" ? "?????? ???????" : "Government Schemes"}`
);

fs.writeFileSync("src/app/artisan/schemes/page.tsx", content);

