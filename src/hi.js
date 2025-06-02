require('dotenv').config({ path: '../.env' });
const token = process.env.TOKEN;
console.log('Token from env:', token);