pragma solidity ^0.5.0;

contract ArtworkStore {
  struct Artwork{
        uint id;
        string name;
        string url;
        bool onSale;
        uint price;
        address owner;
  }

  Artwork[] public artworks;
  uint public nextId;

  function create(string memory name, string memory url) public {
      artworks.push(Artwork(nextId, name, url, false, 0, msg.sender));
      nextId++;
  }

  function getArtwork(uint id) public view returns (uint, string memory, string memory, bool, uint, address){
    for(uint i = 0; i < artworks.length; i++){
      if(artworks[i].id == id){
        return (artworks[i].id, artworks[i].name, artworks[i].url, artworks[i].onSale, artworks[i].price, artworks[i].owner);
      }
    }
  }

  function sellArtwork(uint id, uint price) public {
    require(artworks[id].owner == msg.sender);
    
    for(uint i = 0; i < artworks.length; i++){
      if(artworks[i].id == id){
        artworks[i].onSale = true;
        artworks[i].price = price;
        return;
      }
    }
  }

  function purchaseArtwork(uint id) public payable {
    require(artworks[id].price <= msg.value);
    require(artworks[id].onSale == true);

    // transfer ownership
    for(uint i = 0; i < artworks.length; i++){
      if (artworks[i].id == id) {
        artworks[i].owner = msg.sender;
        artworks[i].onSale = false;
        artworks[i].price = 0;
        return;
      }
    }

    // transfer ethereum
    address(artworks[id].owner).transfer(msg.value);
  }

  function destroy(uint id) public{
      require(artworks[id].owner == msg.sender);
      delete artworks[id];
  }

  function getTotalArtworks() public view returns (uint256 length){
      return artworks.length;
   }
}
