pragma solidity ^0.5.0;

contract Adoption {

struct art{
      address owner;
      string url;
      int256 price;
      string author;
}

art[] public artworks;
uint256 public totalArtworks;

constructor() public {
    totalArtworks = 0;
}

address[16] public adopters;

function create(string memory url, int256 price, string memory author) public returns (uint256 totalCountries){
    address owner = msg.sender;
    art memory newArtwork = art(owner, url, price, author);
    artworks.push(newArtwork);
    totalArtworks++;
    //emit event
    // emit CountryEvent (countryName, leader, population);
    return totalArtworks;
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
