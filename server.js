const Koa = require('koa');
const koaStatic = require('koa-static');
const {readFileSync} = require('fs');

const app = new Koa();

// serve html, css
app.use(koaStatic('./public'));

// serve js libraries
app.use(async (ctx, next) => {
  next();
  if (!ctx.path.endsWith('.js')) {
    return;
  }
  switch (ctx.path) {
    case '/vue.js':
      ctx.body = readFileSync('node_modules/vue/dist/vue.js');
      break;
    case '/vuex.js':
      ctx.body = readFileSync('node_modules/vuex/dist/vuex.js');
      break;
  }
});

// serve ajax
let data = { count: 42 }
app.use(async (ctx, next) => {
  next();
  if (ctx.path !== '/data') {
    return;
  }
  ctx.body = JSON.stringify(data);
});

const PORT = 3000;
console.log(`starting on port ${PORT}`);
app.listen(PORT);