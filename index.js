require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
// import ObjectId from "mongodb"

app.use(cors());
app.use(express.json());

// !MongoDB Connection Start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39hom9r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const jobsDB = client.db("jobPortalDB").collection("jobs");
    const jobsApplicationsDB = client
      .db("jobPortalDB")
      .collection("job_application");

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }
      const jobs = await jobsDB.find(query).toArray();
      res.send(jobs);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const job = await jobsDB.findOne(query);
      res.send(job);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const jobs = await jobsDB.insertOne(newJob);
      res.send(jobs);
    });

    app.get("/job-applications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobsApplicationsDB.find(query).toArray();
      res.send(result);
    });

    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const applications = await jobsApplicationsDB.insertOne(application);
      res.send(applications);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// !MongoDB Connection End

app.get("/", async (req, res) => {
  res.send("Job Portal server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
