const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvlly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("droneShop");
    const ordersCollection = database.collection("droneOrders");
    const usersCollection = database.collection("users");
    const productsCollection = database.collection("droneProducts");
    const ratingsCollection = database.collection("ratings");

    //POST API for adding new product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;

      const result = await productsCollection.insertOne(newProduct);
      res.json(result);
    });

    //GET API to get all products
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();

      res.send(products);
    });

    //saving orders
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });

    //get api for getting all orders
    app.get("/all-orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //GET API for My-order route
    app.get("/my-orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //DELETE API for my order and all orders deletion
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);

      res.json(result);
    });

    //GET API to fetch ratings
    app.get("/ratings", async (req, res) => {
      const cursor = ratingsCollection.find({});
      const ratings = await cursor.toArray();
      res.json(ratings);
    });

    //POST API to save reivews
    app.post("/ratings", async (req, res) => {
      const newRatings = req.body;
      const result = await ratingsCollection.insertOne(newRatings);
      res.json(result);
    });

    //POST api to add users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //PUT api for adding users by google authentication
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //put api to make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get api for finding admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);

      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //product DELETE api
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await productsCollection.deleteOne(query);

      res.json(result);
    });

    //UPDATE API to update status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          orderStatus: updateData.orderStatus,
        },
      };

      const result = await ordersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.json(result);
    });
  } finally {
    //   await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
