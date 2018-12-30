var interactions = function( map, featureSource ) {
    this.map = map;
    this.featureSource = featureSource;
    
    this.layer = new ol.layer.Vector({
        name: 'selectlayer',
        source: new ol.source.Vector(),
    });
    
    this.map.addLayer( this.layer );
};

interactions.prototype.map = {};
interactions.prototype.featureSource = {};
interactions.prototype.layer = {};

interactions.prototype.curselect = {};
interactions.prototype.curmodify = {};
interactions.prototype.curdraw = {};

interactions.prototype.clearInteractions = function () {
    this.layer.getSource().clear();
    this.map.removeInteraction( this.curselect );
    this.map.removeInteraction( this.curmodify );
    this.map.removeInteraction( this.curdraw );
}

interactions.prototype.addDrawInteraction = function () {
    this.map.removeInteraction( this.curselect );
    this.map.removeInteraction( this.curmodify );

    this.curdraw = new ol.interaction.Draw({
      source: this.layer.getSource(),
      type: 'Polygon'
    });
    this.map.addInteraction( this.curdraw );
    this.getFromBoxSelect( this.featureSource );
}

interactions.prototype.addSelection = function( handlerFunction ) {
    var selectEuropa = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 1
        })
    });
    this.curselect = new ol.interaction.Select({
      style: [selectEuropa]
    });

    this.map.addInteraction( this.curselect );
    
    self = this;
    this.curselect.on('select', function(e) {
        var feature = e.target.getFeatures().item(0);
        self.curselect.getFeatures().clear();
        handlerFunction( feature, self.curselect, self.map, self.featureSource );
    });
}

interactions.prototype.addAllInteractions = function() {
    if( typeof this.curdraw != 'undefined' ) {
      this.map.removeInteraction( this.curdraw );
    }
    this.curselect = new ol.interaction.Select({
      layers: [ this.layer ],
    });
    
    this.map.addInteraction( this.curselect );
    this.addDeletionFunctionality();

    this.curmodify = new ol.interaction.Modify({
      features: this.curselect.getFeatures(),
      deleteCondition: function(event) {
        return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
      }
    });
    this.map.addInteraction( this.curmodify );
    
    this.getFromBoxModify( this.featureSource );
    this.getFromBoxSelectDrawned( this.featureSource );
}

interactions.prototype.addDeletionFunctionality = function( ) {
    var selected_features = this.curselect.getFeatures();
    self = this;
    selected_features.on('add', function(event) {
        var feature = event.element;
        $(document).on('keyup', function(event) {
            if (event.keyCode == 46) {
                // remove all selected features from select_interaction and map_vector
                selected_features.forEach(function(selected_feature) {
                    selected_features.remove(selected_feature);
                    
                    selected_feature.setGeometry(null);
                    self.handleSelection( selected_feature, self.featureSource );
                    self.layer.getSource().removeFeature(selected_feature);
                });
                // remove listener
                $(document).off('keyup');
            }
        });
    });
}
  
interactions.prototype.getFromBoxSelect = function( source ) {
    self = this;
    this.curdraw.on('drawend', function( event ) {
        event.feature.setId( self.createUid() );      // 
        self.handleSelection( event.feature, source );  // inside this method we should "static"
        self.addAllInteractions();                      //
    });
}

interactions.prototype.getFromBoxModify = function( source ) {
    self = this;
    this.curmodify.on('modifyend', function( event ) {
        self.handleSelection( event.features.getArray()[0], source ); // inside this method we should "static"
    });
}

interactions.prototype.getFromBoxSelectDrawned = function( source ) {
    self = this;
    this.curselect.on('select', function( event ) {
        var feature = event.target.getFeatures().item(0);
        feature.setId( self.createUid() );
        self.handleSelection( feature, source ); // inside this method we should "static"
    });
}

interactions.prototype.createUid = function() {  // generates a random string
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 10; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

interactions.prototype.handleSelection = {};
