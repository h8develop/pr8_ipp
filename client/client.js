const PROTO_PATH = "../proto/products.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
});

const productsProto = grpc.loadPackageDefinition(packageDefinition);

const client = new productsProto.products.ProductService(
  "127.0.0.1:50052",
  grpc.credentials.createInsecure()
);

module.exports = client;