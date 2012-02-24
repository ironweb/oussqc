OpenLayers.Format.QuartKML = OpenLayers.Class(OpenLayers.Format.KML, {
    
    /**
     * Method: parseFeature
     * This function is the core of the KML parsing code in OpenLayers.
     *     It creates the geometries that are then attached to the returned
     *     feature, and calls parseAttributes() to get attribute data out.
     *
     * Parameters:
     * node - {DOMElement}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A vector feature.
     */
    parseFeature: function(node) {
        // only accept one geometry per feature - look for highest "order"
        var order = ["MultiGeometry", "Polygon", "LineString", "Point"];
        var type, nodeList, geometry, parser;
        for(var i=0, len=order.length; i<len; ++i) {
            type = order[i];
            this.internalns = node.namespaceURI ? 
                    node.namespaceURI : this.kmlns;
            nodeList = this.getElementsByTagNameNS(node, 
                                                   this.internalns, type);
            if(nodeList.length > 0) {
                // only deal with first geometry of this type
                var parser = this.parseGeometry[type.toLowerCase()];
                if(parser) {
                    geometry = parser.apply(this, [nodeList[0]]);
                    if (this.internalProjection && this.externalProjection) {
                        geometry.transform(this.externalProjection, 
                                           this.internalProjection); 
                    }                       
                } else {
                    OpenLayers.Console.error(OpenLayers.i18n(
                                "unsupportedGeometryType", {'geomType':type}));
                }
                // stop looking for different geometry types
                break;
            }
        }

        // construct feature (optionally with attributes)
        var attributes;
        if(this.extractAttributes) {
            attributes = this.parseAttributes(node);
        }
        var feature = new OpenLayers.Feature.Vector(geometry, attributes);

        var fid = node.getAttribute("id") || node.getAttribute("name");
        if(fid != null) {
            feature.fid = fid;
        }
        
        feature.style = OpenLayers.Feature.Vector.style["delete"];

        return feature;
    },

    CLASS_NAME: "OpenLayers.Format.ArrondKML"
});
