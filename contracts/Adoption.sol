pragma solidity ^0.5.0;

contract Adoption {
  struct Artwork{
        uint id;
        string url;
        bool onSale;
        uint price;
  }

  Artwork[] public artworks;
  uint public nextId;

  address[16] public adopters;

  function create(string memory url) public{
      artworks.push(Artwork(nextId, url, false, 0));
      nextId++;
  }

  function getArtwork(uint id) public view returns (uint, string memory, bool, uint){
    for(uint i = 0; i < artworks.length; i++){
      if(artworks[i].id == id){
        return (artworks[i].id, artworks[i].url, artworks[i].onSale, artworks[i].price);
      }
    }
  }

  function sellArtwork(uint id, uint price) public {
    for(uint i = 0; i < artworks.length; i++){
      if(artworks[i].id == id){
        artworks[i].onSale = true;
        artworks[i].price = price;
        return;
      }
    }
  }

  function destroy(uint id) public{
      delete artworks[id];
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
