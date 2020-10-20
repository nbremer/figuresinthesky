///////////////////////////////////////////////////////////////////////////
/////////////////////////// Create projection /////////////////////////////
///////////////////////////////////////////////////////////////////////////

function setupStereographicProjection(width, height, margin, focus, chosen_const, const_per_star, star_by_id) {

    // let total_width = margin.left + width + margin.right
    let cultures = (typeof chosen_const === "string" ? "one" : "all")
    const clip_radius = width/2 * 0.95 //Clipping radius in pixels
    
    //Make a stereoscopic projection
    const projection = d3.geoStereographic()
        //.clipAngle(focus.clip_angle)
        .scale(focus.scale)
        .precision(0.1)
        .translate([width/2 + margin.left, height/2 + margin.top])
        .rotate(calcRotate(focus.center, "all"))

    // console.log(chosen_const, cultures, focus.center, focus.scale)

    //Find the best center point and scaling
    //I tried via fitExtent, but that just didn't work out well enough, so brute force it
    let chosen_stars, poly, poly_center, ra_ext, dec_ext, x_ext, y_ext
    if(cultures === "one") {
        //Find a good center in terms of ra and dec
        //since the chosen point doesn't have to be in the center of this constellation
        chosen_stars = [...new Set(const_per_star.filter(d => d.const_id === chosen_const).map(d => d.star_id))]
        poly = chosen_stars.map(d => [-star_by_id[d].ra * 360 / 24, star_by_id[d].dec])
        ra_ext = d3.extent(poly, d => d[0])
        dec_ext = d3.extent(poly, d => d[1])
        focus.center = [(ra_ext[0] + ra_ext[1]) / 2, (dec_ext[0] + dec_ext[1]) / 2]
        projection.rotate(calcRotate(focus.center, cultures))
    
        //Again, fine-tune the center in terms of ra and dec, but this time based on projected coordinates
        poly_center = chosen_stars.map(d => [...pixelPos(star_by_id[d].ra, star_by_id[d].dec, projection)])
        x_ext = d3.extent(poly_center, d => d[0])
        y_ext = d3.extent(poly_center, d => d[1])
        focus.center = projection.invert([(x_ext[0] + x_ext[1])/2, (y_ext[0] + y_ext[1])/2])
        projection.rotate(calcRotate(focus.center, cultures))

        // let fitSize = {type: 'Feature', geometry: { "type": "LineString", "coordinates": [[ra_ext[0], dec_ext[1]], [ra_ext[1], dec_ext[0]]] }}
        // let multiPoint = {type: 'Feature', geometry: { "type": "MultiPoint", "coordinates": poly }}
        // d3.geoBounds(focus.fitSize)

        let max_length = getMaxLength()
        //Should the scale become bigger or smaller from te default
        let sign = max_length < clip_radius ? 1 : -1
        
        //Loop and incrementally increase (or decrease) the scale until a good fit inside the circle is there
        let rescale = true
        while(rescale) {
            focus.scale = focus.scale + sign * 50
            projection.scale(focus.scale)
            max_length = getMaxLength()

            if(sign === 1 && (max_length >= clip_radius || focus.scale > 2550)) rescale = false
            else if(sign === -1 && max_length <= clip_radius) rescale = false
        }//while
        focus.scale = focus.scale - sign * 50
        projection.scale(focus.scale)
    }//if

    // //Test to compare stars that seem wronly matched
    // poly_center = chosen_stars.map(d => [...pixelPos(star_by_id[d].ra, star_by_id[d].dec, projection)])
    // // console.table(poly_center)
    // console.log(chosen_stars[4])

    //Get the clipping angle to clip to a circle in the next steps
    const clip_angle = projection
        .rotate([0,0])
        .invert([(width/2 + margin.left) + clip_radius*0.96, height/2 + margin.top])[0]
    projection.rotate(calcRotate(focus.center, cultures)) //Rotate back

    return [projection, clip_radius, clip_angle]

    ////////////////////// Helper functions //////////////////////

    //Orion's middle star: ra = 5.603559, dec = -1.20192
    //right ascension: 24h = 360 degrees -> 5.6h = 5.603559*360/24 = 84.05
    //declination is correct already? No, has to be multiplied by -1
    function calcRotate(center, type) { return [center[0] * (type === "all" ? 360/24 : -1), -1*center[1], 0] }

    //Calculate the maximum distance of all stars to the center point
    function getMaxLength() {
        let padding = 60 //Add onto the maximum to make sure the farthest star is somewhat inside the edge
        let poly_inverse = chosen_stars.map(d => {
            let pos = [...pixelPos(star_by_id[d].ra, star_by_id[d].dec, projection)]
            return [pos[0] - (width/2 + margin.left), pos[1] - (height/2 + margin.top)]
        })
        return Math.max(...poly_inverse.map(d => Math.sqrt(d[0]*d[0] + d[1]*d[1]))) + padding
    }//function getMaxLength
    
}//function setupStereographicProjection