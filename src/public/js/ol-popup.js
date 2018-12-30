window.Popup = function( element ) {
    this.instance = new ol.Overlay({
        element: element,
        autoPan: true,
    });
};

Popup.prototype.instance = {};
Popup.prototype.content = {};
Popup.prototype.style = {};
Popup.prototype.iconmap = {};
Popup.prototype.colormap = {};

Popup.prototype.setContent  = function( content ) {
    this.content = content;
}

Popup.prototype.setIconmap = function( iconmap ) {
    this.iconmap = iconmap;
}

Popup.prototype.setColormap = function( colormap ) {
    this.colormap = colormap;
}

Popup.prototype.displayCluster = function( cluster ) {
    var html = '';
    $.each(cluster.get('features'), function(idx, feature) {
        html += '<p>'+
                    '<span style="font-family: FontAwesome; color: '+popupObject.colormap[feature.get('type')]+'">'+( popupObject.iconmap[ parseInt( feature.get('prod') ) ] ) + '</span> ' +
                    feature.get('name') +
                    '</p>';
    });
    html = '<div class="cluster-list">' + html +'</div>';
    this.content.html( html );
}

Popup.prototype.setSelectStyle = function( style ) {
    this.style = style;
}

Popup.prototype.setMap = function( map, layer ) {
    var selectforpopup = new ol.interaction.Select({
        layers: [ layer ],
        condition: ol.events.condition.doubleClick,
    });
    
    map.addInteraction( selectforpopup );
    selectforpopup.on( 'select', function(e) {
        var cluster = e.target.getFeatures().item(0);
        if( cluster ) {
            var coordinate  = cluster.getGeometry().getCoordinates();
            popupObject.displayCluster(cluster);
            popupObject.instance.setPosition(coordinate);
        } else {
            popupObject.instance.setPosition(undefined);
        }
    });
}

Popup.prototype.setMapAlt = function( map, layer ) {
    var selectforpopup = new ol.interaction.Select({
        layers: [ layer ]
    });
    
    map.addInteraction( selectforpopup );
    selectforpopup.on( 'select', function(e) {
        var cluster = e.target.getFeatures().item(0);
        if( cluster ) {
            var coordinate  = cluster.getGeometry().getCoordinates();
            popupObject.displayCluster(cluster);
            popupObject.instance.setPosition(coordinate);
        } else {
            popupObject.instance.setPosition(undefined);
        }
    });
}

Popup.prototype.hide = function( ) {
    popupObject.instance.setPosition(undefined);
}