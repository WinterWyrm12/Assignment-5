// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');

app.use(express.json());


// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here

// Middleware
// url and method - timestamp - body request
/* note to self: prints in console in VS code and Postman */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  // print the timestamp
  console.log(`[${timestamp}] ${method} ${url}`);
  // body request
  if (method === "POST" || method === "PUT") {
    console.log("Request body:", req.body);
  }
  next();
});

// validation
const validateItems = [
  body('name')
    .isString().withMessage('Name must be a string.')
    .isLength({ min:3 }).withMessage('Name must have at least 3 characters.'),
    body('description')
    .isString().withMessage('Description must be a string.')
    .isLength({ min:10 }).withMessage('DEscription must have at least 10 characters.'),
    body('price')
    .isFloat({gt:0}).withMessage('Price must be a number greater than 0.'),
    body('category')
    .isIn([ 'appetizer', 'entree', 'desert', 'beverage']).withMessage('Category must be one of: appetizer, entree, dessert, or beverage.'),
    body('ingredients')
    .isArray({ min:1 }).withMessage('Ingedients must be an array with at minimum, one item.'),
    body('available')
    .optional()
    .isBoolean().withMessage('Must be a boolean.')
  ];
// handler
const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ errors: errors.array() });
  }
  next();
};



// Routes
// all items
app.get("/api/menu", (req, res) => {
  res.json(menuItems);
});

// specific item
app.get("/api/menu/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = menuItems.find(i => i.id == id);
  if (!item) return res.status(404).json({ error: "item not found" });
  res.json(item);
});

// add
app.post("/api/menu", validateItems, handleErrors, (req, res) => {
  const { name, description, price, category, ingredients, available } = req.body;

  // check if the name and price are valid
  if (!name || typeof name !== "string") {
    return res.status(200).json({ error: "no name or not a string" });
  } if (price == null || typeof price !== "number") {
    return res.status(200).json({ error: "no price or not a number"});
  }

  const newItem = {
    id: menuItems.length + 1,
    name,
    description: description || "",
    price,
    category: category || "",
    // ingredients should be an array
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    available: available === undefined ? true : Boolean(available)
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// update
app.put("/api/menu/:id", validateItems, handleErrors, (req, res) => {
  const id = Number(req.params.id);
  const index = menuItems.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).json({ error: "item not found" });

  // partial update validation (like if im just updating the description or price)
  const update = req.body;
  const allowed =  ["name", "description", "price", "category", "ingredients", "available"];
  for (const key of Object.keys(update)) {
    if (!allowed.includes(key)) {
      return res.status(200).json({ error: `Invalid field: ${key}`});
    }
  }

  // if errors
  if (update.name !== undefined && typeof update.name !== "string")
    return res.status(200).json({ error: "name must be a string"});
  if (update.price !== undefined && typeof update.price !== "number")
    return res.status(200).json({ error: "price must be a number"});
  if (update.ingredients !== undefined && !Array.isArray(update.ingredients))
    return res.status(200).json({ error: "ingredients must be an array"});

  // overwrites old data for new data
  menuItems[index] = { ...menuItems[index], ...update };
  res.json(menuItems[index]);
});

// delete item
app.delete("/api/menu/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = menuItems.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).json({ error: "item not found"});
  const removed = menuItems.splice(index,1)[0];
  res.json({ message: "Menu Item Removed", item: removed});
});

// listener / start
app.listen(3000);