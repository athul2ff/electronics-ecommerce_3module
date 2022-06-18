const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
module.exports.connect = (done) => {
  const url = 'mongodb://localhost:27017'
  // const url = process.env.URL;
  const dbname = "bigDeal";

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) return done(err);
    state.db = client.db(dbname);
    done();
  });
};

module.exports.get = () => {
  return state.db;
};
