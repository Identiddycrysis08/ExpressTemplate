document.addEventListener("DOMContentLoaded", () => {
  const images = [...document.querySelectorAll("img[data-placeholder]")];

  images.forEach((img) => {
    if (!img.dataset.src) img.dataset.src = img.src;
    const imagePath = img.dataset.src;
    img.sizes = img.dataset.sizes || "100vw";
    img.srcset = [256, 480, 960, 1600]
      .map((width) => `${imagePath}/resize/${width} ${width}w`)
      .join(", ");
    img.src = img.dataset.src + "/placeholder";
    img.addEventListener("load", () => {
      if (!img.currentSrc.endsWith("/placeholder")) {
        img.classList.add("image-loaded");
      }
    });
  });
});