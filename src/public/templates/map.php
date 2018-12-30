<html>
<body>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="/js/ol-popup.js"></script>
<script src="/js/ol.js"></script>
<script src="/js/polygon.js"></script>
<script src="/js/styles.js"></script>
<script src="/js/staffZones.js"></script>

<div class="container-fluid">
	<div class="row-fluid">
            <form id="zones-form" class="form-inline" action="/" method="POST">
	<div class="form-group">
<button type="button" class="btn btn-info" id="update-zones">Update</button>
<button type="button" class="btn btn-success" id="add-new-zone">Add new zone</button>

<?php foreach( $zones as $zone ): ?>
	<input type="hidden" name="zone[<?=$zone->getId() ?>]" value="<?= $zone->getBorderJson() ?>" class="zonedata" data-zone-id="<?= $zone->getPrimaryKey() ?>" >
<?php endforeach; ?>
        </div>
            </form>
            
    </div>
	<div id="map" class="map"></div>
	<ul class="list-unstyled">
	<li><abbr title="Right shift with click on vertex" class="initialism">Right shift</abbr> - Delete point from zone border</li>
	<li><abbr title="Delete key" class="initialism">Del</abbr> - Delete selected zone</li>
	<li><abbr title="Left mouse click on any point of polygon" class="initialism">Left click</abbr> - Select a zone</li>
	</ul>
</div>
<script type="text/javascript">jQuery(function ($) {
var curr_zone = null;
var zone_id = null;

var map_vector = new ol.layer.Vector({
  name: 'vectorlayer',
  source: new ol.source.Vector()
});
var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		}),
		map_vector
	],
	view: new ol.View({
		center: ol.proj.transform([34.7, 55.43], 'EPSG:4326', 'EPSG:3857'),
		zoom: 10
	})
});

$.each( $('.zonedata'), function(i, v) {
	showPolygone( map, JSON.parse( $(v).val() ), $(v).attr('data-zone-id') );
} );

addAllInteractions();

function showPolygone( map, coordinates, id ) {
	var polyFeature = new ol.Feature({
			geometry: new ol.geom.Polygon([
				coordinates
			])
	});
	polyFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
	polyFeature.setId(id);
	map_vector.getSource().addFeature( polyFeature );
}

function addDrawInteraction() {
  map.removeInteraction(select);
  map.removeInteraction(modify);
  
  draw = new ol.interaction.Draw({
    source: map_vector.getSource(),
    type: 'Polygon'
  });
  map.addInteraction(draw);
  
  draw.on('drawend', function(event) {
    var id = uid();
    event.feature.setId(id);
    createZone(event.feature); 
  });
}

function addAllInteractions() {
	if( typeof draw != 'undefined' ) {
		map.removeInteraction(draw);
	}
	select = new ol.interaction.Select();
	map.addInteraction(select);
	
	var selected_features = select.getFeatures();
	selected_features.on('add', function(event) {
		var feature = event.element;
    feature.on('change', updateZone);
		$(document).on('keyup', function(event) {
			if (event.keyCode == 46) {
				// remove all selected features from select_interaction and map_vector
				selected_features.forEach(function(selected_feature) {
					var selected_feature_id = selected_feature.getId();

					// remove from select_interaction
					selected_features.remove(selected_feature);

					var vectorlayer_features = map_vector.getSource().getFeatures();
					vectorlayer_features.forEach(function(source_feature) {
						var source_feature_id = source_feature.getId();
						if (source_feature_id === selected_feature_id) {
							map_vector.getSource().removeFeature(source_feature);
							// save the changed data
              deleteZone( source_feature_id );
						}
					});
				});
				// remove listener
				$(document).off('keyup');
			}
		});
	});
	
	modify = new ol.interaction.Modify({
		features: selected_features,
		deleteCondition: function(event) {
      return ol.events.condition.shiftKeyOnly(event) &&
        ol.events.condition.singleClick(event);
    }
	});
	map.addInteraction(modify);
}

function updateZone( ) {
	var geom = this.getGeometry().clone().transform( 'EPSG:3857', 'EPSG:4326' );
	$('input[name=\"zone['+this.getId()+']\"]').val( JSON.stringify( geom.getCoordinates()[0] ) );
}

function deleteZone( id ) {
	$('input[name=\"zone['+id+']\"]').val('');
}

function createZone( feature ) {
	var geom = feature.getGeometry().clone().transform( 'EPSG:3857', 'EPSG:4326' );
	var zone_name = 'zone[]';
	$('<input>').attr({
    type: 'hidden',
    name: zone_name,
	}).val( JSON.stringify( geom.getCoordinates()[0] ) ).
	appendTo('#zones-form');
	addAllInteractions();
}

$('#add-new-zone').on('click', function(e) {
	addDrawInteraction();
	// make other buttons inactive
});

$('#update-zones').on('click', function(e) {
	$('#zones-form').submit();
});

function uid()
{
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for( var i=0; i < 10; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

});</script></body>
</html>
