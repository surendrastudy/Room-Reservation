//   console.log(mapToken)

  maptilersdk.config.apiKey = mapToken;
  const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element in which the SDK will render the map
    style: maptilersdk.MapStyle.STREETS,
    zoom: 12 // starting zoom
  });

  // Perform forward geocoding for 'Paris'
  maptilersdk.geocoding.forward(mapLocation)
    .then(result => {
      const location = result.features[0].geometry.coordinates;
      map.setCenter(location);
      const marker = new maptilersdk.Marker({ color: 'red' })
      .setLngLat(location)
      .addTo(map);

    const popup = new maptilersdk.Popup()
      .setHTML(`<h3>${mapName}</h3>`);

    // Attach the popup to the marker
    marker.setPopup(popup);
    // Open the popup
    popup.addTo(map);
      

    })
    .catch(error => {
      console.error('Error occurred during geocoding:', error);
    });