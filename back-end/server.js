require('dotenv').config()
require('app-module-path').addPath(__dirname);
const App = require("./dist/app").default;
new App();