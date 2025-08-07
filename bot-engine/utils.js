// bot-engine/utils.js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports = {
  sleep,
  randomBetween
};