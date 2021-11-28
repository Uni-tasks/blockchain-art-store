pragma solidity ^0.5.0;

contract Adoption {
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

  address[16] public adopters;

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

  function destroy(uint id) public{
      require(artworks[id].owner == msg.sender);
      delete artworks[id];
  }

  function getTotalArtworks() public view returns (uint256 length){
      return artworks.length;
   }

  // Adopting a pet
  function adopt(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    adopters[petId] = msg.sender;

    return petId;
  }

  // Retrieving the adopters
  function getAdopters() public view returns (address[16] memory) {
    return adopters;
  }
}
