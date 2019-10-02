module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-modules')({
      getJSON(cssFileName, json, outputFileName) {
        const path = require('path');
        const cssName = path.basename(cssFileName, '.css');
        const jsonFileName = path.resolve('./build/' + cssName + '.json');
        const fs = require('fs');
        fs.writeFileSync(jsonFileName, JSON.stringify(json));
      },
    }),
  ],
};
