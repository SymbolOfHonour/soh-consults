const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const root = process.cwd();
  const source = path.join(root, "public", "soh-logo.jpg");

  if (!fs.existsSync(source)) {
    throw new Error("Logo not found: public/soh-logo.jpg");
  }

  async function createIcon(size, destination) {
    await sharp(source)
      .resize(size, size, {
        fit: "contain",
        background: "#ffffff",
      })
      .png()
      .toFile(destination);

    console.log(`Created: ${destination}`);
  }

  const iconsFolder = path.join(root, "public", "icons");

  fs.mkdirSync(iconsFolder, { recursive: true });

  await createIcon(512, path.join(root, "app", "icon.png"));

  await createIcon(
    192,
    path.join(iconsFolder, "icon-192.png")
  );

  await createIcon(
    512,
    path.join(iconsFolder, "icon-512.png")
  );

  console.log("S.O.H CONSULTS icons generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});