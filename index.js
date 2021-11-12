require("dotenv").config();
const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 8000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dafwp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const databse = client.db("chairfull");
		const productsCollection = databse.collection("products");
		const usersCollection = databse.collection("users");
		const reviewsCollection = databse.collection("reviews");
		const ordersCollection = databse.collection("orders");

		// list api [PRODUCT]
		app.get("/products", async (req, res) => {
			const cursor = productsCollection.find({}).sort({ _id: -1 });
			const size = parseInt(req.query.size);
			let result;
			if (size) {
				result = await cursor.limit(size).toArray();
			} else {
				result = await cursor.toArray();
			}
			res.send(result);
		});

		// single api [PRODUCT]
		app.get("/products/:id", async (req, res) => {
			const _id = req.params.id;
			const query = { _id: ObjectId(_id) };
			const result = await productsCollection.findOne(query);
			res.json(result);
		});

		// post api [PRODUCT]
		app.post("/products", async (req, res) => {
			const newProduct = req.body;
			const result = await productsCollection.insertOne(newProduct);
			res.send(result);
		});

		// delete api [PRODUCT]
		app.delete("/products/:id", async (req, res) => {
			const _id = req.params.id;
			const query = { _id: ObjectId(_id) };
			const result = await productsCollection.deleteOne(query);
			res.send(result);
		});

		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const result = await usersCollection.findOne(query);
			let isAdmin = false;
			if (result?.role === "admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});

		// post api [USER]
		app.post("/users", async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// put api [ADMIN USER]
		app.put("/users/admin", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updateDoc = { $set: { role: "admin" } };
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		// post api [REVIEW]
		app.post("/reviews", async (req, res) => {
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.send(result);
		});

		// list api [REVIEW]
		app.get("/reviews", async (req, res) => {
			const cursor = reviewsCollection.find({}).sort({ _id: -1 });
			const size = parseInt(req.query.size);
			let result;
			if (size) {
				result = await cursor.limit(size).toArray();
			} else {
				result = await cursor.toArray();
			}
			res.send(result);
		});

		// delete api [REVIEW]
		app.delete("/reviews/:id", async (req, res) => {
			const _id = req.params.id;
			const query = { _id: ObjectId(_id) };
			const result = await reviewsCollection.deleteOne(query);
			res.send(result);
		});

		// post api [ORDER]
		app.post("/orders", async (req, res) => {
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.send(result);
		});

		// list api [ORDER]
		app.get("/orders", async (req, res) => {
			const email = req.query.email;
			const filter = { email: email };
			let result;
			if (email) {
				result = await ordersCollection
					.find(filter)
					.sort({ _id: -1 })
					.toArray();
			} else {
				result = await ordersCollection
					.find({})
					.sort({ _id: -1 })
					.toArray();
			}
			res.send(result);
		});

		// update status api [ORDER]
		app.put("/orders/:id", async (req, res) => {
			const _id = req.params.id;
			const updatedOrder = req.body;
			const filter = { _id: ObjectId(_id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: updatedOrder.status,
				},
			};
			const result = await ordersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
		});

		// delete api [ORDER]
		app.delete("/orders/:id", async (req, res) => {
			const _id = req.params.id;
			const query = { _id: ObjectId(_id) };
			const result = await ordersCollection.deleteOne(query);
			res.send(result);
		});
	} finally {
		// await client.close()
	}
}

run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("hello World!");
});

app.listen(port, () => {
	console.log(`Application running on - http://localhost:${port}`);
});
