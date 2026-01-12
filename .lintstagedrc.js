const isLegacy = (filePath) => {
  const p = filePath.replaceAll("\\", "/"); // windows 경로 정규화
  return p.includes("/src/legacy-blog/");
};

const isManifest = (filePath) => {
  const p = filePath.replaceAll("\\", "/");
  return p.endsWith("/public/manifest.json");
};

module.exports = {
  "*.{js,jsx,ts,tsx}": (files) => {
    const normalized = files.map((f) => f.replaceAll("\\", "/"));
    const targets = normalized.filter((f) => !isLegacy(f));

    if (targets.length === 0) return [];
    return [
      `prettier --write ${targets.join(" ")}`,
      `eslint --fix ${targets.join(" ")}`,
    ];
  },

  "*.{json,css,scss,md,yml,yaml}": (files) => {
    const normalized = files.map((f) => f.replaceAll("\\", "/"));
    const targets = normalized.filter((f) => !isLegacy(f) && !isManifest(f));

    if (targets.length === 0) return [];
    return [`prettier --ignore-unknown --write ${targets.join(" ")}`];
  },
};
