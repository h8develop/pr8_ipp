const PROTO_PATH = "../proto/products.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");

// Загрузка proto файла
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
});

const productsProto = grpc.loadPackageDefinition(packageDefinition);

// In-memory хранилище продуктов
let products = [
  {
    id: "1",
    name: "Молоко",
    quantity: 2,
    purchased: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2", 
    name: "Хлеб",
    quantity: 1,
    purchased: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Реализация сервиса
function getServer() {
  const server = new grpc.Server();
  
  server.addService(productsProto.products.ProductService.service, {
    CreateProduct: (call, callback) => {
      const product = call.request;
      product.id = uuidv4();
      product.created_at = new Date().toISOString();
      product.updated_at = new Date().toISOString();
      product.purchased = false;
      
      products.push(product);
      console.log("Продукт создан:", product);
      callback(null, product);
    },

    GetProduct: (call, callback) => {
      const product = products.find(p => p.id === call.request.id);
      if (product) {
        callback(null, product);
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Продукт не найден"
        });
      }
    },

    GetAllProducts: (_, callback) => {
      callback(null, { products });
    },

    UpdateProduct: (call, callback) => {
      const updatedProduct = call.request;
      const index = products.findIndex(p => p.id === updatedProduct.id);
      
      if (index !== -1) {
        updatedProduct.updated_at = new Date().toISOString();
        products[index] = { ...products[index], ...updatedProduct };
        console.log("Продукт обновлен:", products[index]);
        callback(null, products[index]);
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Продукт не найден"
        });
      }
    },

    DeleteProduct: (call, callback) => {
      const index = products.findIndex(p => p.id === call.request.id);
      
      if (index !== -1) {
        const deletedProduct = products.splice(index, 1)[0];
        console.log("Продукт удален:", deletedProduct);
        callback(null, {});
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Продукт не найден"
        });
      }
    },

    MarkAsPurchased: (call, callback) => {
      const product = products.find(p => p.id === call.request.id);
      
      if (product) {
        product.purchased = true;
        product.updated_at = new Date().toISOString();
        console.log("Продукт отмечен как купленный:", product);
        callback(null, product);
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Продукт не найден"
        });
      }
    }
  });
  
  return server;
}

// Запуск сервера
const server = getServer();
server.bindAsync(
  "127.0.0.1:50052",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Ошибка запуска сервера:", error);
      return;
    }
    console.log("gRPC сервер запущен на http://127.0.0.1:50052");
    server.start();
  }
);