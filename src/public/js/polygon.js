var drawer = function( ) {
};

drawer.prototype.showGeoJson = function( vector, geoJson, id ) {
    var polyFeatures  = (new ol.format.GeoJSON()).readFeatures(geoJson);
    $.each(polyFeatures, function(idx, val) {
      if (val.getGeometry()) {
        val.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      }
      val.setId(id);
      vector.getSource().addFeature( val );
    });
}

drawer.prototype.showGeoJsonImage = function( image, geoJson, id ) {
    var polyFeatures  = (new ol.format.GeoJSON()).readFeatures(geoJson);
    $.each(polyFeatures, function(idx, val) {
      if (val.getGeometry()) {
        val.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      }
      val.setId(id);
      image.getSource().getSource().addFeature( val );
    });
}