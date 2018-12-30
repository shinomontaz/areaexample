function pointsToSource( points, olSource ) {
    points.forEach( function(el) {
        feature = new ol.Feature({
            geometry: new ol.geom.Point( ol.proj.transform([ parseFloat(el.y), parseFloat(el.x) ], 'EPSG:4326', 'EPSG:3857')),
            id  : el.id,
            name: el.name,
            type: el.type,
            rank: el.rank,
            time: el.time,
            prod: el.product,
            visited_at: el.visited_at,
            relation: el.relation,
        });
        feature.setId( el.id );
        olSource.addFeature(feature);
    });
}
  
function doSelectZone( currFeature, selectInteraction, map, featuresLayer ) {
    $('#relation-zones').empty();
    var sel_id = currFeature.getId();
    $('#relation-name').text( currFeature.get( 'relation_name' ) );
    $('#zone-name').text( currFeature.get( 'name' ) );

    // get relation by feature id
    var relation = currFeature.get( 'fk_relation' );

    $.ajax({
        method: 'POST',
        url: '/site/relzones',
        data: { fk_relation: relation },
    }).done(function( msg ) {
        var msg = JSON.parse(msg);

        $.each(msg, function (id, name) {
          $('#relation-zones').append( '<li>' + name + '</li>' );
        });
    });
    
    $.each(featuresLayer.getFeatures(), function(idx, val) {
        if( val.get('fk_relation') == relation ) {
            selectInteraction.getFeatures().push(val);
        }
    });
}

function areasSelection( currPolygon, source ) {
    var currentIds = $('#clients').val().split("\n");
    var currentNames = $('#client_names').val().split("\n");
    var features = source.getFeatures();

    for (var i=0;i<features.length;i++) {
      if(
        currPolygon.getGeometry() && 
        currPolygon.getGeometry().intersectsCoordinate( features[i].getGeometry().getCoordinates(  ) ) &&
        !currentIds.includes( features[i].get('id').toString() ) &&
        currentIds.length <= 1500
      ) {
        $('#clients').val( $('#clients').val() + ( features[i].get('id') + "\n" ));
        $('#client_names').val( $('#client_names').val() + features[i].get('name') + "\n" );
        
        currentIds = $.trim( $('#clients').val() ).split("\n");
        currentNames = $.trim( $('#client_names').val() ).split("\n");
      }
    }
    
    // loop throw existed features
    $('#clients').val( '' );
    $('#client_names').val( '' );

    var tempIds = [];
    currentIds.forEach(function( currentId, idx ) {
  		var currfeature = source.getFeatureById( currentId );
      if(
        currfeature && currPolygon.getGeometry() && currPolygon.getGeometry().intersectsCoordinate( currfeature.getGeometry().getCoordinates(  ) )
      ) {
        tempIds.push(currentId);
      }
    });

    tempIds.forEach(function( currentId, idx ) {
      if( currentId ) {
        var currfeature = source.getFeatureById( currentId );
      
        $('#clients').val( $('#clients').val() + ( currfeature.get('id') + "\n" ));
        $('#client_names').val( $('#client_names').val() + currfeature.get('name') + "\n" );
      }
    });

    currentIds = $.trim( $('#clients').val() ).split("\n");
    currentNames = $.trim( $('#client_names').val() ).split("\n");
    
    if( currentIds.length > 1 || ( currentIds.length == 1 && currentIds[0] ) ) { // temp hack
      $('#plan-trip').text( currentIds.length );
    } else {
      $('#plan-trip').html( '<i class=\"fa fa-calendar-check-o\"></i>' );
    }
  }