//----------------------------------------------- modules
const readline = require("readline");
let nodemailer = require("nodemailer");
let handlebars = require("handlebars");
let fs = require("fs");
//-----------------------------------------------

//----------------------------------------------- variables global
const dataFile = fs.readFileSync("script/config/text.json");
var conf = JSON.parse(dataFile);
username = conf.username;
let path;
let shortScr = conf.shortScr;
let shouldContinue = true;
let url;
let date;
let subjects = conf.subjects;
const subject = subjects[Math.floor(Math.random() * subjects.length)];
let mailnames = conf.mailnames;
const mailname = mailnames[Math.floor(Math.random() * mailnames.length)];
//-----------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function pickRandomFile() {
  var files = fs.readdirSync(`script/html`);
  files = files.filter((fileName) => fileName);
  random_html = files[Math.floor(Math.random() * files.length)];
  path = "/html/" + random_html;
}

async function getRealDate() {
  let fullDate = new Date();
  let day = fullDate.getDate();
  let dayInc = ++day;
  const month = fullDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "june",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  date = dayInc + " " + monthNames[month];
}

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function foo() {
  const res = await fetch("https://" + shortScr + "/shorten", {
    method: "POST",
    body: JSON.stringify({
      url: url,
    }),
    headers: {
      "Content-type": "application/json",
    },
  });

  link = await res.json();
}

async function askQuestions() {
  while (shouldContinue) {
    try {
      rcvMail = await askQuestion("Снабдите почтой: ");
      if (rcvMail === "exit") scriptSetup(); // Если пользователь нажал "Отмена", выходим из цикла

      url = await askQuestion("Снабдите ссылкой: ");
      if (url === "exit") scriptSetup();

      amount = await askQuestion("Снабдите суммой: ");
      if (amount === "exit") scriptSetup();

      await foo();
      await getRealDate();
      await pickRandomFile();

      async function mailerSetup() {
        var readHTMLFile = function (path, callback) {
          fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
            if (err) {
              callback(err);
            } else {
              callback(null, html);
            }
          });
        };

        readHTMLFile(__dirname + path, function (err, html) {
          if (err) {
            console.log("error reading file", err);
            return;
          } else {
          }

          let template = handlebars.compile(html);
          let replacements = {
            id: link.short_url,
            date: date,
            mail: rcvMail,
            link: "https://" + shortScr + "/" + link.short_url,
            amount: amount,
          };

          let htmlToSend = template(replacements);

          let transport = nodemailer.createTransport({
            host: conf.host,
            port: conf.port,
            auth: {
              user: username,
              pass: conf.pass,
            },
          });
          let mailOptions = {
            from: mailname + "<" + username + ">",
            to: rcvMail,
            subject: subject + link.short_url,
            html: htmlToSend,
          };
          transport.sendMail(mailOptions, (error, info) => {
            if (error) {
              //console.log('\nнедоход')
              //console.log(error.code);
            } else {
              //console.log(info.code + "ушла гадина,  \n\n\n\n\n\n");
            }
          });
        });
      }
      await mailerSetup();
      await askQuestions();
    } catch (err) {
      console.log(err);
    }
  }
}

async function baseSettings() {
  console.log(
    "параметры:\n1. SMTP (строка формата: хост:порт:имя:пароль)\n2. сокра\n3. имя почты, обычно noreply\n4. темы"
  );
  let setting = await askQuestion(":> ");
  switch (setting) {
    case "1":
      console.clear();
      let smtpstring = await askQuestion("хост:порт:имя:пароль :>> ");
      let smtpstringVal = smtpstring.split(":");
      if (smtpstringVal.length === 4) {
        (conf.host = smtpstringVal[0]),
          (conf.port = smtpstringVal[1]),
          (conf.username = smtpstringVal[2]),
          (conf.pass = smtpstringVal[3]);
        try {
          fs.writeFileSync(
            "./config/text.json",
            JSON.stringify(conf, null, 2),
            "utf8"
          );
          console.log(smtpstring + " - ваш новый smtp");
        } catch (error) {
          console.error("Ошибка записи:", error.message);
        }
        baseSettings();
      } else {
        console.clear();
        console.log("неверный ввод:" + smtpstring);
      }
      baseSettings();
      break;
    case "2":
      conf.shortScr = await askQuestion("сокращалка :>> ");
      if (conf.shortScr === null) {
        console.log("не может быть пустым");
        baseSettings();
      } else {
        try {
          fs.writeFileSync(
            "./config/text.json",
            JSON.stringify(conf, null, 2),
            "utf8"
          );
        } catch (error) {
          console.error("Ошибка записи:", error.message);
        }
        baseSettings();
      }
      break;
    case "3":
      console.log("sosi huy");
      baseSettings();
      break;
    case "4":
      console.log("555");
      baseSettings();
      break;
    case "exit":
      console.clear();
      scriptSetup();
      break;
    default:
      console.clear();
      console.log("invalid");
      baseSettings();
      break;
  }
}

async function scriptSetup() {
  try {
    let opt = await askQuestion(
      "выберите опцию\n1. full send\n2. настройки\n:> "
    );
    if (opt === "1") {
      console.clear();
      console.log("back - для выхода в параметры");
      await askQuestions();
    } else if (opt === "2") {
      console.clear();
      console.log("ну ща будем настраивать...");
      await baseSettings();
    } else if (opt === "exit") {
      console.clear();
      rl.close();
    } else {
      console.clear();
      console.log("\n\n\n\nневерный ввод. введи 1 или 2 блять\n\n\n");
      scriptSetup();
    }
  } catch (err) {
    console.log(err);
  }
}
console.log("Добро пожаловать в ГЛИНАМАЙЛЕР\n\nexit - выйти из проги :(");
scriptSetup();
