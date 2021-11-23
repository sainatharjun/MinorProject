// var mysql = require('mysql');

// // connecting to the db
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "123456",
//     database: "userregistration"
//   });

// con.connect((err)=>{
//     if(err) {
//       console.log('Please check your db connection...');
//       throw err;
//     }
// });

// module.exports = con; 


// const mongoClient = require('mongodb');
// const url = 'mongodb://localhost:27017/dbname';

// const login = async (req,res) => {
// const connection = await mongoClient.connect(url,{useUnifiedTopology:true});

// // connection is the object to be used
// await connection.collection('collectionName').insertOne({name:'kaushik', age:20});
// await connection.collection('collectionName').find({name:'kaushik'}).toArray()

// }