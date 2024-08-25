const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    heidth: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    autoHideMenuBar: false,
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get-markdown-files", (event, directoryPath) => {
  const fullPath = path.join(app.getPath("userData"), directoryPath);
  console.log("Reading directory:", fullPath);
  try {
    const files = fs.readdirSync(fullPath);
    console.log("Files found:", files);
    const markdownFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".md"
    );
    console.log("Markdown files:", markdownFiles);
    return markdownFiles;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
});

ipcMain.handle("save-markdown-file", async (event, fileName, content) => {
  console.log("Saving file:", fileName);
  console.log("Content:", content.substring(0, 100) + "..."); // Log first 100 chars of content
  const dirPath = path.join(app.getPath("userData"), "md_files");
  const filePath = path.join(dirPath, fileName);
  console.log("File path:", filePath);

  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
        reject(err);
        return;
      }

      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          reject(err);
        } else {
          console.log("File saved successfully");
          // Verify file was actually saved
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error("Error reading saved file:", err);
              reject(err);
            } else {
              console.log(
                "File content verification:",
                data.substring(0, 100) + "..."
              );
              resolve(true);
            }
          });
        }
      });
    });
  });
});

ipcMain.handle("remove-markdown-file", async (event, fileName) => {
  console.log("Removing file:", fileName);
  const filePath = path.join(app.getPath("userData"), "md_files", fileName);
  console.log("File path:", filePath);

  try {
    await fs.promises.unlink(filePath);
    console.log("File removed successfully");
    return true;
  } catch (err) {
    console.error("Error removing file:", err);
    throw err;
  }
});

ipcMain.on("files-upload", (event, filePaths) => {
  const destinationFolder = "./md_files/"; // Replace with your desired path

  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
  }

  filePaths.forEach((filePath) => {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(destinationFolder, fileName);

    fs.copyFile(filePath, destinationPath, (err) => {
      if (err) {
        console.error("Failed to copy file:", filePath, err);
      } else {
        console.log("File copied successfully to:", destinationPath);
      }
    });
  });
});
