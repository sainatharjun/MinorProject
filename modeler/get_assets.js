var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')

async function get_assetData(id){
  const assets=await conn.searchAssets(id)
  return JSON.stringify(assets[0])
  
}


module.exports.get_assets = async (req,res) => {
  const s = req.session;
  var text=""
var i=0;
for(i=0;i<s.user.assetsOwned.length;i++){
  text+=await get_assetData(s.user.assetsOwned[i])+"<button class='btn btn-info' onclick='sellAsset("+'"'+s.user.assetsOwned[i]+'"'+")'>Sell Asset</button>@";
}
console.log(text)
text = text.split(',');
text=text.join('<br>');
text=text.split('{');
text=text.join('<div class="col-md-4">');
text=text.split('}');
text=text.join('<br>');
text=text.split('@');
text=text.join('</div>');
res.send(text);
  //let code = '';

  

}