document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("upload_window");

  if (uploadForm) {
    uploadForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fileInput = document.getElementById("file_input");
      const files = Array.from(fileInput.files);

      if (files.length > 0) {
        const filePaths = files.map((file) => file.path);
        window.electron.send("files-upload", filePaths);
      }
    });
  } else {
    console.error("Upload form not found in the DOM");
  }
});
