let fs = require("fs");
//-----------------------------------------------

//----------------------------------------------- variables global
const dataFile = fs.readFileSync("./config/text.json");
let conf = JSON.parse(dataFile);
let subjects = conf.subjects
//-----------------------------------------------

const subject = subjects[
  Math.floor(Math.random() * subjects.length)
]
console.log(subject)