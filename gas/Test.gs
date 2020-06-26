var password = "potatoisgodpotatoisgodpotatoisgod";
function postTest() {
  var nonce = Math.floor(Math.random()*100000000);
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password+nonce)
               .reduce(function(str,chr){
                 chr = (chr < 0 ? chr + 256 : chr).toString(16);
                 return str + (chr.length==1?'0':'') + chr;
               },'');
  var json = {
    "type":"newTakerunVideo",
    "hash":hash, 
    "nonce":nonce,
    "debug":"true",
    "title":"【maimai外部出力(60fps)】CHAOS DXMAS AP",
    "description":"タッチノーツの使い方を模索しようという意図が見て取れますね、無限の可能性を感じます",
    "url":"https://www.youtube.com/watch?v=N_y9OTC17MU"
  };
  sendGlitch(GLITCH_URL, json);
}
