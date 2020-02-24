const route = {
  path: '/profile',
  async handler(req, res, next) {
    console.log('handler for', route.path);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 500);
    })
      .then(() => {
        res.json({
          test: true,
        });
      })
    ;
  },
};

export default route;
