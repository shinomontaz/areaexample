window.Styles = function(  ) {
};

Styles.prototype.cache = {};
Styles.prototype.iconmap = {};
Styles.prototype.colormap = {};

Styles.prototype.getStyle = function( type, product ) {
    var col = this.colormap[type];
    
    shape = 'Cross';
    var funcName  = 'get'+shape;
    return this[funcName](col);
}

Styles.prototype.getIcon = function( icon, size, color, border ) {
    if( !this.cache['getIcon' + icon + size + color + border] ) {
        this.cache['getIcon' + icon + size + color + border] = new ol.style.Style({
            image: new ol.style.Circle({
                radius: size - 1,
                fill: new ol.style.Fill({
                    color: color,
                }),
                stroke: new ol.style.Stroke({
                    width: 1,
                    color: border
                }),
            }),
            text: new ol.style.Text({
                text: icon,
                font : 'Normal '+(size)+'px FontAwesome',
                fill: new ol.style.Fill({
                    color: '#fff',
                })
            })
        });
    }
    return this.cache['getIcon' + icon + size + color + border];
}

Styles.prototype.getCross = function( color ) {
    if( !this.cache['getCross' + color] ) {
        this.cache['getCross' + color] = new ol.style.Style({
            image: new ol.style.RegularShape({
            points: 4,
            radius: 4,
            radius2: 0,
            angle: 0,
            fill: new ol.style.Fill({
                color: color
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: color
            }),
            })
        });
    }
    return this.cache['getCross' + color];
};

Styles.prototype.getCommon = function( fill, border, width ) {
    if( !this.cache['getCommon' + border + fill + width] ) {
        this.cache['getCommon' + border + fill + width] = new ol.style.Style({
        fill: new ol.style.Fill({
            color: fill
        }),
        stroke: new ol.style.Stroke({
            color: border,
            width: width
        })
        });
    }
    return this.cache['getCommon' + border + fill + width];
}

Styles.prototype.getTriangle = function( color ) {
    if( !this.cache['getTriangle' + color] ) {
        this.cache['getTriangle' + color]  =new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0)',
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: color
                }),
                points: 3,
                radius: 4,
                angle: Math.PI / 3
            })
        });
    }
    return this.cache['getTriangle' + color];
}

Styles.prototype.getCircle = function( color ) {
    if( !this.cache['getCircle' + color] ) {
        this.cache['getCircle' + color] = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0)',
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: color
            }),
        })
    });
    }
    return this.cache['getCircle' + color];
}
    
Styles.prototype.getCross = function( color ) {
    if( !this.cache['getCross' + color] ) {
        this.cache['getCross' + color] = new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: 4,
                radius2: 0,
                angle: 0,
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: color
                }),
            })
        });
    }
    return this.cache['getCross' + color];
};

Styles.prototype.getCircleText = function( color, text, radius, border ) {
    if( !this.cache['getCircleText' + color + text + radius] ) {
        this.cache['getCircleText' + color + text + radius] = new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius,
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: border
                }),
                fill: new ol.style.Fill({
                    color: color
                })
            }),
            text: new ol.style.Text({
                text: text,
                fill: new ol.style.Fill({
                  color: '#fff'
                })
            })
        });
    }
    return this.cache['getCircleText' + color + text + radius];
}

Styles.prototype.getInverted = function(cluster) {
    return [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "white",
            lineCap: "butt",
            lineJoin: "bevel",
            width:3         
        }),
        fill : new ol.style.Fill({
            color: "black"
        }),
    })];
};