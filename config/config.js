console.log('./'+(process.env.NODE_ENV || 'development')+'.json');
module.exports = require('./'+(process.env.NODE_ENV || 'development')+'.json');