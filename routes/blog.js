const express = require("express");

function Router(database) {
  // Create an instance of the Express router
  const router = express.Router();

  const _database = database;

  //get a route to the root of the blog
  router.get("/", async(req, res) => {
    //fetch all the entries in the collection
    const blogData = await _database.collections.blogs.find({}).toArray();
    //render the index.ejs file
    res.render("index", { blogData: blogData });
  });

  //get a route to the new blog page
  router.get("/newBlog", (req, res) => {
    res.render("newBlog", {});
  });

  //accept the post request from the form
  router.post("/newBlog", async (req, res) => {
    //Grab data from form
    let data = req.body;
    //modify title and make it url friendly
    data["slug"] = data.title.replace(/ /g, "-");
    await _database.collections.blogs.insertOne(data);
    //redirect the user the the entry they just created
    res.redirect(`/blog/${data.slug}`);
  });

  //add a get to the actual route to the blog post
  router.get("/blog/:slug", async (req, res) => {
    let slug = req.params.slug;
    let blog = await _database.collections.blogs.findOne({ slug: slug });
    res.render("existing", { blogData: blog });
  });

  return router;
}

module.exports = Router;
