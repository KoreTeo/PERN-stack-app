function isValue(val){
  return (val !== undefined && val != null && val != '');
}

const db = require('./db');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Router = require('express');

const port = 8124;
const app = express();

app.use(express.static('public'))
app.use(express.urlencoded({extended: false }));
app.use(express.json());
app.use(bodyParser.json());

class ProductController {
  async createProduct(req, res) {
    const {product_id, product_name, supplier_id, category_id, quantity_per_unit, unit_price, units_in_stock, units_on_order, reorder_level, discontinued} = req.body;
    let queryStart = 'INSERT INTO products (product_name';
    let queryData = `, discontinued) VALUES (\'${product_name}\'`;
    if(!isValue(product_name)){
      return null;
    }
    if(!isValue(discontinued)){
      return null;
    }
    if(isValue(supplier_id)){
      queryStart += ', supplier_id';
      queryData += ', ' + supplier_id;
    }
    if(isValue(category_id)){
      queryStart += ', category_id';
      queryData += ', ' + category_id;
    }
    if(isValue(quantity_per_unit)){
      queryStart += ', quantity_per_unit';
      queryData += ', \'' + quantity_per_unit + '\'';
    }
    if(isValue(unit_price)){
      queryStart += ', unit_price';
      queryData += ', ' + unit_price;
    }
    if(isValue(units_in_stock)){
      queryStart += ', units_in_stock';
      queryData += ', ' + units_in_stock;
    }
    if(isValue(units_on_order)){
      queryStart += ', units_on_order';
      queryData += ', ' + units_on_order;
    }
    if(isValue(reorder_level)){
      queryStart += ', reorder_level';
      queryData += ', ' + reorder_level;
    }
    console.log(queryStart + queryData + `, ${discontinued})`);
    const newProduct = await db.query(queryStart + queryData + `, ${discontinued})`);
    //const newProduct = await db.query('INSERT INTO products (product_name, discontinued) VALUES ($1, $2) RETURNING *', [product_name, discontinued]);
    res.redirect('/');
  }
  async getAllProducts(req, res) {
    const products = await db.query('SELECT * FROM products ORDER BY product_id');
    return res.render('index.hbs', 
      {products: products.rows}
    );
  }
  async getFilterProducts(req, res) {
    const {product_name, category_id, discontinued} = req.body;
    let products;
    if (isValue(discontinued) && isValue(category_id)) {
      console.log(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND category_id = ${category_id} AND discontinued = ${discontinued}`)
      products = await db.query(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND category_id = ${category_id} AND discontinued = ${discontinued} ORDER BY product_id`);
    }
    else if (isValue(category_id)) {
      console.log(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND category_id = ${category_id}`)
      products = await db.query(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND category_id = ${category_id} ORDER BY product_id`);
    }
    else if (isValue(discontinued)) {
      console.log(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND discontinued = ${discontinued}`)
      products = await db.query(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' AND discontinued = ${discontinued} ORDER BY product_id`);
    }
    else {
      console.log(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\'`)
      products = await db.query(`SELECT * FROM products WHERE product_name LIKE \'${product_name}%\' ORDER BY product_id`);
    }
    return res.render('index.hbs',
      {products: products.rows}
    );
  }
  async deleteProduct(req, res) {
    const id = req.params.id;
    const product = await db.query('DELETE FROM products WHERE product_id=$1 RETURNING *', [id]);
    res.redirect('/');
  }
}

const productController = new ProductController();

const productRouter = new Router();

productRouter.post('/product/create/', productController.createProduct);
productRouter.get('/', productController.getAllProducts);
productRouter.post('/filter/', productController.getFilterProducts);
productRouter.post('/product/:id', productController.deleteProduct);

app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use('/', productRouter);

async function startApp(){
  try {
    app.listen(port, () => {
      console.log(`Сервер запущен на порте: ${port}`);
    })    
  }
  catch(e){
    console.log(e);
  }
}

startApp();
