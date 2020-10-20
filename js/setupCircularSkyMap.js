///////////////////////////////////////////////////////////////////////////
//////////////////////// Set-up circular star maps ////////////////////////
///////////////////////////////////////////////////////////////////////////

function createCircularBaseMap(opts_data, focus_star, chosen_const, type) {

    const stars = opts_data.stars
    const star_by_id = opts_data.star_by_id
    const const_links = opts_data.const_links
    const const_per_star = opts_data.const_per_star
    let canvas_space, canvas_stars, canvas_lines

    let focus = JSON.parse(JSON.stringify(focus_star)) //Create deep clone

    const margin = basemap_margin
    const width = basemap_size
    const height = basemap_size

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Set-up projections ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //Get the projection variables
    const [projection, clip_radius, clip_angle] = setupStereographicProjection(width, height, margin, focus, chosen_const, const_per_star, star_by_id)
   
    //Radius of the stars
    const radius_scale = d3.scalePow()
        .exponent(0.7)
        .domain([-2, 6, 11])
        .range([9, 0.5, 0.1].map(d => {
            const focus_scale = d3.scaleLinear()
                .domain([300, 2600])
                .range([0.6, 1.5])
            return d * focus_scale(focus.scale)
        }))

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Draw star maps //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    let opts_general = {
        margin: margin,
        width: width,
        height: height,
        projection: projection,
        focus: focus,
        type: type,
        type_geo: "stereographic",
        clip_radius: clip_radius
    }

    /////////////////////// Draw deep space base map ////////////////////////
    if(type === "big" || type === "multiple" || type === "medium") {
        let opts_space = {
            zodiac: opts_data.zodiac,
            clip_angle: clip_angle
        }
        canvas_space = drawDeepSpace(opts_general, opts_space)
        // ctx.drawImage(canvas_space, 0, 0, total_width, total_height)
    }//if

    /////////////////////// Draw stars ////////////////////////
    if(type === "big" || type === "multiple" || type === "medium") {
        let opts_stars = {
            stars: stars,
            radius_scale: radius_scale
        }
        canvas_stars = drawStars(opts_general, opts_stars) 
        // ctx.drawImage(canvas_stars, 0, 0, total_width, total_height)
    }//if

    /////////////////////// Draw constellations ////////////////////////
    let opts_lines = {
        radius_scale: radius_scale,
        constellations: chosen_const,
        star_by_id: star_by_id,
        const_links: const_links,
    }
    canvas_lines = drawConstellations(opts_general, opts_lines)
    // ctx.drawImage(canvas_lines, 0, 0, total_width, total_height)

    return {canvas_space: canvas_space, canvas_stars: canvas_stars, canvas_lines: canvas_lines}

}//function createCircularBaseMap

///////////////////////////////////////////////////////////////////////////
//////////////////////// Sky map helper functions /////////////////////////
///////////////////////////////////////////////////////////////////////////

////////////////// Create the standard sky map with background, stars and lines //////////////////
function drawMap(opts_data, canvas, ctx, focus, chosen_const, loc, type) {
    //Request the deep space, stars and constellation-lines offscreen canvases
    const basemap = createCircularBaseMap(opts_data, focus, chosen_const, type)
    //Draw them to the on-screen canvas
    ctx.clearRect(0, 0, canvas.width || canvas.node().width, canvas.height || canvas.node().height)
    if(basemap.canvas_space) ctx.drawImage(basemap.canvas_space, loc.x, loc.y, loc.width, loc.height)
    if(basemap.canvas_stars) ctx.drawImage(basemap.canvas_stars, loc.x, loc.y, loc.width, loc.height)
    ctx.drawImage(basemap.canvas_lines, loc.x, loc.y, loc.width, loc.height)

    //Fade out the "hiding-rect" in the circular sky map
    d3.selectAll(".chart-circular-hide-group")
        .transition("fade").duration(900).delay(1000)
        .style("opacity", 0)
}//function drawMap

////////////////// Clip the canvas image to the circle //////////////////
function clipToCircle(ctx, width, height, margin, clip_radius) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(width/2 + margin.left, height/2 + margin.top, clip_radius, 0, pi2)
    ctx.closePath()
    ctx.clip()
}//function clipToCircle