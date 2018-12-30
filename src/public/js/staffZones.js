var currEmployee = window.employeeId;

var selectEuropa = new ol.style.Style({
    fill: new ol.style.Fill({color: 'rgba(0, 255, 255, 0.9)'}),
    stroke: new ol.style.Stroke({
        color: '#f00',
        width: 1
    }),
    zIndex: 99999
});

var currentZone;

var curr_zone = null;
var zone_id = null;
select = new ol.interaction.Select({
    style: [selectEuropa]
});

var map_vector = new ol.layer.Vector({
    name: 'vectorlayer',
    source: new ol.source.Vector()
});
window.popupObject = new Popup( $('#popup')[0] );
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        map_vector
    ],
    view: new ol.View({
        center: ol.proj.transform([window.areaCenterY, window.areaCenterX], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8
    }),
    overlays: [popupObject.instance],
});

popupObject.setColormap( Styles.colormap );
popupObject.setIconmap( Styles.iconmap );
popupObject.setContent( $('#popup-content') );
popupObject.setSelectStyle( Styles.getInverted );

var ownedByCurrentStyle = new ol.style.Style({
    fill: new ol.style.Fill({color: 'rgba(0, 255, 0, 0.2)'}),
    stroke: new ol.style.Stroke({
        color: '#008000',
        opacity: 0.2,
        width: 1
    })
});
var occupiedStyle = new ol.style.Style({
    fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.2)'}),
    stroke: new ol.style.Stroke({
        color: '#808080',
        opacity: 0.1,
        width: 1
    })

});
var transparentStyle = new ol.style.Style({ fill: new ol.style.Fill({color: 'rgba(192, 192, 192, 0.4)'}),
    stroke: new ol.style.Stroke({color: '#808080', opacity: 0.2}) });

$.each( $('.zonedata'), function(i, v) {

    var polyFeatures  = (new ol.format.GeoJSON()).readFeatures($(v).val());
    $.each(polyFeatures, function(idx, val) {
        val.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        val.setId($(v).attr('data-zone-id'));
        val.set('relation', $(v).attr('data-zone-relation'));
        val.set('employee_id', $(v).attr('data-employee-id'));
        resetStyle(val);
        map_vector.getSource().addFeature( val );
    });

} );

addAllInteractions();

function addAllInteractions() {
    map.addInteraction(select);
    map.on('click', function(e) {
        if (currentZone) {
            resetStyle(currentZone);
        }
        $('#relation-zones').empty();
        var feature;
        map.forEachFeatureAtPixel(e.pixel, function (f, layer) {
            feature = f;
        });

        currentZone = feature;
        if (currentZone) {
            var oldStyle = currentZone.getStyle();
            currentZone.setStyle(selectEuropa);
            if (oldStyle) {
                currentZone.getStyle().setFill(oldStyle.getFill());
            }
            popupObject.instance.setPosition(e.coordinate);
        } else {
            popupObject.hide();
            return;
        }

        var sel_id = feature.get('relation');
        var zoneId = feature.getId();

        if ( sel_id ) {
            $('#bind-zone-block').hide();
            $('#relation-name').text( $( '[data-zone-id=\''+zoneId+'\']' ).data('relation-name') );
            $('#zone-name').text( $( '[data-zone-id=\''+zoneId+'\']' ).data('zone-name') );

            if (feature.get('employee_id') == currEmployee) {
                $('#bindZone').hide();
                $('#unbindZone').show();
            } else {
                $('#bindZone').show();
                $('#unbindZone').hide();
            }
        } else {
            $('#relation-name').text( 'Зона не привязана к ОСП!' );

            $('#zone-id').val(feature.getId());

            $('#popup-content').append($('#bind-zone-block').show());
            $('#zone-name').text( currentZone.get('name') );
            $('#bindZone').hide();
            $('#unbindZone').hide();
        }

    });
}

$('#bindZone').click(function() {
    var id = currentZone.get('relation');

    if (
        !$( '[data-zone-relation=\''+id+'\']').data('employee-id') ||
        confirm(window.zoneIsAlreadyOccupied)
    ) {
        $.ajax({
            method: 'POST',
            url: '/staff/bindzone',
            data: {
                employee_id: getCurrEmployee(),
                relation_id: id
            },
        }).done(function() {
            currentZone.set('employee_id', currEmployee);
            currentZone.setStyle(ownedByCurrentStyle);
            rel = currentZone.get('relation')
            $.each( map_vector.getSource().getFeatures(), function(idx, val) {
                if (val.get('relation') == rel) {
                    val.set('employee_id', getCurrEmployee());
                    val.setStyle(ownedByCurrentStyle);
                }
            } );


            $('#bindZone').hide();
            $('#unbindZone').show();
            popupObject.hide();
        }).fail(function() {
            alert(window.faildToBindAZone);
        });
    }
});

function getCurrEmployee() {
    return currEmployee;
}

$('#unbindZone').click(function() {
    var id = currentZone.get('relation');

    $.ajax({
        method: 'POST',
        url: '/staff/unbindzone',
        data: {
            employee_id: getCurrEmployee(),
            relation_id: id
        },
    }).done(function() {
        currentZone.unset('employee_id');
        currentZone.setStyle(transparentStyle);

        $('#bindZone').show();
        $('#unbindZone').hide();
    }).fail(function() {
        alert(window.faildToUnbindAZone);
    });
    popupObject.hide();
    $(this).hide();
});

$('#unbindAllZones').click(function() {
    var employee_id = $(this).data('employee');

    if (confirm(window.unbindAllEmployeeZones)) {

        $.ajax({
            method: 'GET',
            url: '/staff/unbindallzones?employee_id=' + employee_id,
        }).done(function() {

            var features = map_vector.getSource().getFeatures();
            for (var i in features)
            {
                var feature = features[i];

                if (feature.get('employee_id') == employee_id) {
                    feature.setStyle(transparentStyle);
                    feature.unset('employee_id');
                }
            }
            popupObject.hide();

        }).fail(function() {
            alert(window.faildToUnbindAZone);
        });

    }
})

function resetStyle(feature)
{
    if (feature.get('employee_id') == currEmployee) {
        feature.setStyle(ownedByCurrentStyle);
    } else if (feature.get('employee_id') != null) {
        feature.setStyle(occupiedStyle);
    } else {
        feature.setStyle(transparentStyle);
    }
}

$('#employee-selector').on( 'change', function() {
    currEmployee = this.value;
    $.each( map_vector.getSource().getFeatures(), function(idx, val) {
        resetStyle(val);
    } );
    popupObject.hide();
});

function init_modal(e) {
    e.preventDefault();
    $('#modal-form').modal('show')
        .find('#modal-content')
        .load( '/staff/view/' + getCurrEmployee() );

    $('#modal-form').modal('show')
        .find('#myModalLabel').text( $(this).data('header') );
}

$('.edit-employee').click( init_modal );