require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken"); //! JWT-------------------
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser"); //! CookieParser-------------------
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
// import ObjectId from "mongodb"

//! This code sets up CORS (Cross-Origin Resource Sharing) middleware in an Express.js server. It configures the server to allow requests from a specific origin (http://localhost:5173) and includes credentials like cookies or authentication headers in those requests.
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
//!-------------------------------------
app.use(express.json());
app.use(cookieParser()); //! Cookie parser middleware----------------

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

    //! Auth related APIs ------------------------------Start

    //! Create the JWT token and send it to the client
    // app.post("/jwt", async (req, res) => {
    //   const user = req.body;
    //   // const token = jwt.sign(user, "secret", { expiresIn: "1h" });
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "5h",
    //   });
    //   res
    //     .cookie("token", token, {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    //   // res.send(token);
    // });
    // ! 60.2 ->
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "secret", { expiresIn: "1h" });
      res.send(token);
      // ! 60.2 <-
    });

    //! remove the JWT token from the cookie
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });
    //! Auth related APIs ------------------------------End

    // app.get("/jobs", async (req, res) => {
    //   const email = req.query.email;
    //   let query = {};
    //   if (email) {
    //     query = { hr_email: email };
    //   }
    //   const jobs = await jobsDB.find(query).toArray();
    //   res.send(jobs);
    // });
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

    // ! Find all jog applications
    app.get("/job-applications", async (req, res) => {
      const result = await jobsApplicationsDB.find().toArray();
      res.send(result);
    });

    app.get("/job-applications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };

      console.log(req.cookies);

      const result = await jobsApplicationsDB.find(query).toArray();
      res.send(result);
    });

    app.get("job-applications/jobs/:job_id", async (req, res) => {
      const jobId = req.params.job_id;
      const query = { job_id: jobId.id };
      const result = await jobsApplicationsDB.find(query).toArray();
      res.send(result);
    });

    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const applications = await jobsApplicationsDB.insertOne(application);
      const id = application.job_id;
      const query = { _id: new ObjectId(id) };
      const job = await jobsDB.findOne(query);
      // console.log(job);
      let newCount = 0;
      if (job.jobApplicationCount) {
        newCount = job.jobApplicationCount + 1;
      } else {
        newCount = 1;
      }
      // Update
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          jobApplicationCount: newCount,
        },
      };
      const updatedResult = await jobsDB.updateOne(filter, updatedDoc);
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
