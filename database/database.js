const mongodb = require("mongodb");
const dotenv = require("dotenv");

//create a class to handle the database
class Database {
  collections = {
    blogs: null,
    users: null,
  };

  client = null;
  database = null;

  async setup() {
    this.client = await new mongodb.MongoClient(
      process.env.MONGO_URI
    ).connect();
    this.database = await this.client.db("foodie-blog");

    let listedColllections = await this.database
      .listCollections({}, { nameOnly: true })
      .toArray();

    let names = listedColllections.map((collection) => {
      return collection.name;
    });
    //map the array of objects to an array of strings
    //loop through each key to compare the name of the collection with the names list
    Object.keys(this.collections).forEach(async (collectionName) => {
      //check if the collection name is in the list of existing collections, if not, create a new one
      if (names.includes(collectionName)) {
        //fetch collection
        this.collections[collectionName] = await this.database.collection(
          collectionName
        );
      } else {
        //create a new one
        this.collections[collectionName] = await this.database.createCollection(
          collectionName
        );
      }
    });
  }
}

module.exports = Database;
