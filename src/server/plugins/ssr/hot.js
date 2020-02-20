export default function clearCache(compiler) {
  compiler.hooks.done.tap('MyPlugin', () => {
    console.log('Clearing /client/ module cache from server');
    Object.keys(require.cache).forEach((id) => {
      if (RegExp('shared/*').test(id)) {
        delete require.cache[id];
        // TODO find better regex
      }
    });
  });
}
