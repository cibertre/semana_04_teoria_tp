const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("node:path");
const { leerJson } = require("./archivos");
const PORT = 3000;
const rutaDatos = path.join(__dirname, "..", "datos", "productos.json");
async function main() {
 const productos = await leerJson(rutaDatos);
 const app = express();
 app.set("view engine", "ejs");
 app.set("views", path.join(__dirname, "..", "views"));
 app.use(expressLayouts);
 app.set("layout", "layouts/main");

 app.use(express.static(path.join(__dirname, "..", "public")));
 app.use(express.urlencoded({ extended: false }));
 app.get("/api/productos", (req, res) => {
 res.json(productos);
 });
 app.get("/", (req, res) => {
 res.render("inicio", { titulo: "Mercado artesanal" });
});
app.get("/productos", (req, res) => {
 res.render("productos/lista", {
 titulo: "Productos artesanales",
 productos,
 });
});
app.get("/productos/:id", (req, res) => {
 const id = Number(req.params.id);
 const producto = productos.find((elemento) => elemento.id === id);
 if (!producto) {
 return res.status(404).render("no-encontrado", {
 titulo: "Producto no encontrado",
 mensaje: "No existe un producto con ese identificador.",
 });
 }
 res.render("productos/detalle", {
 titulo: producto.nombre,
 producto,
 });
});
app.get("/productos/nuevo", (req, res) => {
 res.render("productos/nuevo", {
 titulo: "Nuevo producto",
 error: null,
 valores: {},
 });
});
 app.post("/productos", (req, res) => {
 const { nombre, categoria, precio, descripcion } = req.body;
 const nombreLimpio = String(nombre ?? "").trim();
 const categoriaLimpia = String(categoria ?? "").trim();
 const descripcionLimpia = String(descripcion ?? "").trim();
 const precioNumerico = Number(precio);
 if (
 !nombreLimpio ||
 !categoriaLimpia ||
 !descripcionLimpia ||
 !Number.isFinite(precioNumerico) ||
 precioNumerico <= 0
 ) {
 return res.status(400).render("productos/nuevo", {
 titulo: "Nuevo producto",
 error: "Completá todos los campos con valores válidos.",
 valores: req.body,
 });
 }
 const ultimoId = productos.reduce(
 (mayorId, producto) => Math.max(mayorId, producto.id),
 0,
 );
 productos.push({
 id: ultimoId + 1,
 nombre: nombreLimpio,
 categoria: categoriaLimpia,
 precio: precioNumerico,
 descripcion: descripcionLimpia,
 });
 res.redirect("/productos");
});
 app.listen(PORT, () => {
 console.log(`Aplicación disponible en http://localhost:${PORT}`);
 });
}
main().catch((error) => {
 console.error("No se pudo iniciar la aplicación:", error);
 process.exitCode = 1;
});
