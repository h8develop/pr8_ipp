const client = require("./client");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");

const app = express();

// Регистрируем хелпер для форматирования дат
hbs.registerHelper('formatDate', function(dateString) {
  if (!dateString) return 'Неизвестно';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU');
  } catch (e) {
    return dateString;
  }
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Главная страница - список продуктов
app.get("/", (req, res) => {
  client.getAllProducts({}, (err, data) => {
    if (!err) {
      res.render("products", {
        products: data.products || []
      });
    } else {
      console.error("Ошибка получения продуктов:", err);
      res.render("products", { products: [] });
    }
  });
});

// Создание продукта
app.post("/create", (req, res) => {
  const newProduct = {
    name: req.body.name,
    quantity: parseInt(req.body.quantity) || 1
  };

  client.createProduct(newProduct, (err, data) => {
    if (err) {
      console.error("Ошибка создания продукта:", err);
    } else {
      console.log("Продукт создан:", data);
    }
    res.redirect("/");
  });
});

// Обновление продукта
app.post("/update", (req, res) => {
  const updatedProduct = {
    id: req.body.id,
    name: req.body.name,
    quantity: parseInt(req.body.quantity) || 1
  };

  client.updateProduct(updatedProduct, (err, data) => {
    if (err) {
      console.error("Ошибка обновления продукта:", err);
    } else {
      console.log("Продукт обновлен:", data);
    }
    res.redirect("/");
  });
});

// Удаление продукта
app.post("/delete", (req, res) => {
  client.deleteProduct({ id: req.body.id }, (err, _) => {
    if (err) {
      console.error("Ошибка удаления продукта:", err);
    } else {
      console.log("Продукт удален");
    }
    res.redirect("/");
  });
});

// Отметка как купленного
app.post("/purchase", (req, res) => {
  client.markAsPurchased({ id: req.body.id }, (err, data) => {
    if (err) {
      console.error("Ошибка отметки покупки:", err);
    } else {
      console.log("Продукт отмечен как купленный:", data);
    }
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Клиент запущен на порту", PORT);
});