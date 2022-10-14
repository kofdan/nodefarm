const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

/////////////// FILES ////////////////////
/*
const textIn = fs.readFileSync('./text/input.txt', 'utf8')

const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()} `

fs.writeFileSync('./text/output.txt', textOut);

console.log('File written!'); 






fs.readFile('./text/start.txt', 'utf-8', (err, data1)=>{
    if(err) return console.log('ERROR!');
    fs.readFile(`./text/${data1}.txt`, 'utf-8', (arr, data2)=>{

        console.log(data2)

        fs.readFile('./text/append.txt', 'utf-8', (err, data3)=>{

            console.log(data3)
            
            fs.writeFile('./text/final.txt', `${data2}\n ${data3}`, 'utf-8', (err) =>{
                console.log('Your file has been written')

            })

        })

    })

})
console.log('Will read file!');
// callback hell!!!!!!


*/

// SERVER
/* функция проходится по шаблону который передан в аргументе (temp ) и 
при помощи функции replace по регулярному выражению изменяет шаблон для 
отображения нужных параметров продукта.
*/

/* 
readFileSync - единожды вызывается на протяжении выполнения кода. 
*/
/*
получение шаблона главной страницы
*/
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
/*
получение шаблона одного товара
*/
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
/* 
получение шаблона карточки товара
*/
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

/*
получение "базы данных продуктов" из .json файла
*/
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

/*
Преобразование БД для работы с кодом
*/
const dataObj = JSON.parse(data);

/**
 * работа со слагом
 */

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

/*
server  - функция для работы с сервером. Импортируемый модуль http который 
запускает работу сервера.
*/
const server = http.createServer((req, res) => {
  /**
   * check url object!!!!
   */
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  /*
при обращении в поисковой строке браузера к адрессу / или /overview 
в ответе сервера возвращается html-страница с измененным шаблоном карточек
товаров.
*/
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    /**
     * cardHtml возвращает новый массив объектов свех товаров. Который изменен
     * функцией replaceTemplate. В мар методе при передачи  элемента вызывается функция обработчик которая принимает его и шаблон в котором она будет генерировать странину на основе входящих данных
     */
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    /**
     * переменная output при помощи регулярного выражения и метода replace
     * генерирует шаблон главной страницы приложения
     */
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    /**
     * res.end() - завершает и отправляет ответ на сторону пользователя
     */
    res.end(output);
    // Product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });

    const product = dataObj[query.id];
    /**
     * при product == null остановить работу функции.
     */
    if (!product) {
      res.writeHead(404, {
        "Content-type": "text/html",
        "my-own-header": "hello-world",
      });
      res.end(
        '<h1>The product with this id not found</h1><a href="/"> To Home Page</a>'
      );
      return null;
    }
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // 404 not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>404 not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
