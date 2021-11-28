App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    App.displayWallet();

    return App.initContract();
  },

  displayWallet: function() {
    // Display user wallet address
    $('#wallet-address').text(App.web3Provider.selectedAddress);
  },

  initContract: function() {
    $.getJSON('ArtworkStore.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.loadArtworks();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#new-artwork-btn', App.handleCreateArtwork);
    $(document).on('click', '.sale-btn', App.handleSellArtwork);
    $(document).on('click', '.delete-btn', App.handleDeleteArtwork);
    $(document).on('click', '.purchase-btn', App.handlePurchaseArtwork);
  },

  loadArtworks: function() {
    console.log("Loading artworks...");
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getTotalArtworks.call();
    }).then(function(artworks) {
      count = artworks.c[0]

      var artworksRow = $('#artworksRow');
      var userArtworksRow = $('#userArtworksRow');
      var artworkTemplate = $('#artworkTemplate');
      var userArtworkTemplate = $('#userArtworkTemplate');

      for (i = 0; i < count; i++) {
        adoptionInstance.getArtwork.call(i).then(function(artwork) {
          console.log(artwork)
          const id = artwork[0].c[0];
          const name = artwork[1];
          const url = artwork[2];
          const isForSale = artwork[3];
          const price = artwork[4].c[0];
          const ownerAddress = artwork[5];
          const userAddress = App.web3Provider.selectedAddress;

          if(url !== '') {
            artworkTemplate.find('img').attr('src', url);
            artworkTemplate.find('.artwork-name').text(name);
            artworkTemplate.find('.card-body').attr('data-id', id);
            artworkTemplate.find('.card-body').attr('data-price', price);

            if (isForSale) {
              artworkTemplate.find('.artwork-price').text(price + ' ETH');
              const text = ownerAddress === userAddress ? 'Your artwork' : 'Purchase';
              artworkTemplate.find('.purchase-btn').text(text).attr('disabled', ownerAddress === userAddress ? true : false);;
            } else {
              artworkTemplate.find('.artwork-price').text('');
              artworkTemplate.find('.purchase-btn').text('Not for sale').attr('disabled', true);
            }

            if (ownerAddress === userAddress) {
              userArtworkTemplate.find('img').attr('src', url);
              userArtworkTemplate.find('.user-artwork-name').text(name);
              userArtworkTemplate.find('.sale-btn').attr('data-id', id);
              userArtworkTemplate.find('.card-body').attr('data-id', id);
              userArtworksRow.append(userArtworkTemplate.html());
            }
            
            artworksRow.append(artworkTemplate.html());
          }
        }).catch(function(err) {
          console.log(err.message);
        });
      }
      console.log("Artworks loaded successfully.");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleCreateArtwork: function(event) {
    event.preventDefault();

    var name = $('#name').val();
    var url = $('#url').val();
    console.log("Creating artwork...", name, url);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        console.log("here")

        return adoptionInstance.create(name, url, {from: account});
      }).then(function(result) {
        console.log(result);
        console.log("Artwork created successfully.");
        $('#name').val('');
        $('#url').val('');
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleSellArtwork: function(event) {
    event.preventDefault();

    const parentElement = $(event.target.parentElement)
    var price = parseInt(parentElement.find('input').val());
    var artworkId = parseInt(parentElement.data('id'));

    console.log("Listing artwork for sale...", artworkId, price);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.sellArtwork(artworkId, price, {from: account});
      }).then(function(result) {
        $('#url').val('');
        console.log("Artwork listed for sale successfully.");
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleDeleteArtwork: function(event) {
    event.preventDefault();

    var artworkId = parseInt($(event.target.parentElement).data('id'));
    console.log("Deleting artwork...", artworkId);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.destroy(artworkId, {from: account});
      }).then(function(result) {
        $('#url').val('');
        console.log("Artwork deleted successfully.", artworkId);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handlePurchaseArtwork: function(event) {
    event.preventDefault();

    var artworkId = parseInt($(event.target.parentElement).data('id'));
    var price = parseInt($(event.target.parentElement).data('price'));
    console.log("Purchasing artwork...", artworkId, price);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.purchaseArtwork(artworkId, {from: account, value: web3.toWei(price, "ether")});
      }).then(function(result) {
        console.log(result)
        console.log("Artwork purchased succefully.", artworkId, price);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
