///////////////////////////////////////////////////////////////////////////
//////////////////////// Draw constellations lines ////////////////////////
///////////////////////////////////////////////////////////////////////////

function drawConstellations(opts_general, opts) {
    
    let projection = opts_general.projection
    let star_by_id = opts.star_by_id
    let focus = opts_general.focus
    let chosen_star = star_by_id[focus.hip]
    let type = opts_general.type

    let total_width = opts_general.width + opts_general.margin.left + opts_general.margin.right
    let total_height = opts_general.height + opts_general.margin.top + opts_general.margin.bottom

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 1)

    //Set to the clipped circle
    if(type !== "multiple") clipToCircle(ctx, opts_general.width, opts_general.height, opts_general.margin, opts_general.clip_radius)

    ///////////// Get unique constellations /////////////

    //Get all the lines that are in these constellations
    let chosen_lines = opts.const_links.filter(d => opts.constellations.indexOf(d.const_id) > -1)

    ///////////// Draw nested lines /////////////

    // let line = d3.line()
    //     .curve(d3.curveNatural)
    //     .context(ctx)

    //Create a unique id per line-star pairing
    //Make sure it doesn't matter if the same combination of stars switches in s-t or t-s setting
    chosen_lines.forEach(d => { d.line_id = d.source < d.target ? d.source + "_" + d.target :  d.target + "_" + d.source })
    //Nest per line id
    let nested_lines = d3.nest()
        .key(d => d.line_id)
        .entries(chosen_lines)
    
    ctx.globalCompositeOperation = "screen"
    ctx.lineWidth = type === "small" ? 4 : 2
    ctx.lineWidth = ctx.lineWidth * (opts.constellations.length > 1 ? 2 : 1)
    ctx.globalAlpha = 0.7
    let offset = 0.95 * ctx.lineWidth

    //Draw the constellation lines
    nested_lines.forEach((d,j) => {
        //Skip constellations that are only 1 star
        if(d.values[0].source === d.values[0].target) return

        let num = d.values.length
        let s = star_by_id[d.values[0].source]
        let pos_s = pixelPos(s.ra, s.dec, projection)
        let t = star_by_id[d.values[0].target]
        let pos_t = pixelPos(t.ra, t.dec, projection)

        //Get the normal line
        //https://stackoverflow.com/questions/16417891
        //https://stackoverflow.com/questions/7469959
        //https://stackoverflow.com/questions/36667930
        let nx = -1 * (pos_t[1] - pos_s[1])
        let ny = pos_t[0] - pos_s[0]
        //Normalize the normal line
        let nl = Math.sqrt(nx*nx + ny*ny)
        nx = nx/nl
        ny = ny/nl

        //Draw each line
        d.values.forEach((l,i) => {
            //Calculate the actual dx & dy offset from the actual source & target star
            let increase
            if(num%2 === 1) increase = Math.ceil(i/2) * (i%2 === 0 ? 1 : -1)
            else increase = (Math.ceil((i+1)/2) - 0.5) * (i%2 === 0 ? -1 : 1)
            let dx = offset * nx * increase
            let dy = offset * ny * increase
            
            ctx.beginPath()
            // if(num > 11) {
            //     let data = [pos_s, [(pos_s[0] + dx + pos_t[0] + dx)/2, (pos_s[1] + dy + pos_t[1] + dy)/2], pos_t]
            //     line(data)
            // } else {
                ctx.moveTo(pos_s[0] + dx, pos_s[1] + dy)
                ctx.lineTo(pos_t[0] + dx, pos_t[1] + dy)
            // }//else
            ctx.strokeStyle = cultures[constellationCulture(l.const_id)].color 
            // color_scale_base(opts.color_scale_const(l.const_id))
            ctx.stroke()
            ctx.closePath()
        })//forEach lines
    })//forEach nested_lines

    ///////////// Clip away the constellation lines in a circle around each star /////////////
    //////////////////////////////// Draw donuts around stars ////////////////////////////////

    drawStarDonuts(ctx, projection, star_by_id, chosen_lines, opts.radius_scale, type) 

    ///////////// Draw ring around chosen star /////////////

    let pos = pixelPos(chosen_star.ra, chosen_star.dec, projection)

    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    ctx.strokeStyle = type === "small" ? "black" : "#fff"
    ctx.lineWidth = type === "small" ? 10 : type === "multiple" ? 6 : 4
    ctx.beginPath()
    ctx.arc(pos[0], pos[1], opts.radius_scale(chosen_star.mag) + (type === "small" ? 22 : type === "multiple" ? 18 : 13), 0, pi2)
    ctx.closePath()
    ctx.stroke()

    ///////////// Add proper name to chosen star /////////////

    if(type === "big" || type === "medium") {
        let r = opts.radius_scale(chosen_star.mag)
        ctx.fillStyle = "white"
        ctx.font = (type === "big" ? "22px " : "34px ") + font_family
        
        //Bottom-left position = default
        ctx.textBaseline = "top"
        ctx.textAlign = "end"
        let pos_x = pos[0] - r
        let pos_y = pos[1] + 15 + r
        if(focus.title_position === "top-left") {
            ctx.textBaseline = "bottom"
            ctx.textAlign = "end"
            pos_x = pos[0] - r
            pos_y = pos[1] - 18 - r
        } else if(focus.title_position === "top-right") {
            ctx.textBaseline = "bottom"
            ctx.textAlign = "start"
            pos_x = pos[0] + r
            pos_y = pos[1] - 18 - r
        } else if(focus.title_position === "bottom-right") {
            ctx.textBaseline = "top"
            ctx.textAlign = "start"
            pos_x = pos[0] + r
            pos_y = pos[1] + 15 + r
        }//else if

        ctx.fillText(chosen_star.proper, pos_x, pos_y)
    }//if

    return canvas
}//function drawConstellations

///////////////////////////////////////////////////////////////////////////
//////////////////////// Simple constellation lines ///////////////////////
///////////////////////////////////////////////////////////////////////////

function drawConstellationsSimple(opts_general, opts, chosen_culture) {
    
    let projection = opts_general.projection
    let chart_id = opts_general.chart_id

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, opts_general.width, opts_general.height, 1, opts_general.offset_x)

    //Get unique constellations
    let chosen_lines = opts.const_links.filter(d => d.const_culture === chosen_culture)

    ///////////// Create path functions /////////////

    //Set-up path creating function
    const path = d3.geoPath()
        .projection(projection)
        .context(ctx)

    const path_svg = d3.geoPath()
        .projection(projection)

    ///////////// Draw lines /////////////
    ctx.globalCompositeOperation = "screen"
    ctx.lineWidth = chart_id === "header" ? 1 : 1.5
    ctx.globalAlpha = chart_id === "header" ? 0.8 : 1
    ctx.strokeStyle = chart_id === "header" ? "#4c4c4c" : cultures[chosen_culture].color 

    //Draw the constellation lines
    ctx.beginPath()
    chosen_lines.forEach(d => {
        let s = opts.star_by_id[d.source]
        let t = opts.star_by_id[d.target]
        let line_string = {type: "LineString", 
                           coordinates: [[-s.ra * (360/24), s.dec], 
                                         [-t.ra * (360/24), t.dec]]}
        let line = path_svg(line_string)
        //If the path exists of multiple line segments, use the "great arc" method
        //Otherwise draw straight lines
        if(line.split("M").length - 1 >= 2) path(line_string)
        else {
            let pos_s = pixelPos(s.ra, s.dec, projection)
            let pos_t = pixelPos(t.ra, t.dec, projection)
            ctx.moveTo(pos_s[0], pos_s[1])
            ctx.lineTo(pos_t[0], pos_t[1])
        }//else
    })
    ctx.stroke()
    ctx.closePath()

    ///////////// Clip away the constellation lines in a circle around each star /////////////
    //////////////////////////////// Draw donuts around stars ////////////////////////////////

    if(chart_id !== "header") drawStarDonuts(ctx, projection, opts.star_by_id, chosen_lines, opts_general.radius_scale, opts_general.type_geo)
        
    return canvas
    
}//drawConstellationsSimple

///////////////////////////////////////////////////////////////////////////
///////////// Draw small donuts around each constellation star ////////////
///////////////////////////////////////////////////////////////////////////

function drawStarDonuts(ctx, projection, star_by_id, chosen_lines, radius_scale, type) {

    //Get all the unique stars in the lines
    let chosen_stars = [...new Set([...chosen_lines.map(d => d.source), ...chosen_lines.map(d => d.target)])]

    ///////////// Clip away the constellation lines in a circle around each star /////////////

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "destination-out"
    
    chosen_stars.forEach(d => {
        //Get the star's info and location
        let star = star_by_id[d]
        let pos = pixelPos(star.ra, star.dec, projection)

        //Donut size settings
        // let inner = innerRad(star.mag)
        let outer = outerRad(star.mag)

        //Move the canvas to center on the star
        ctx.save()
        ctx.translate(...pos)

        //Take out the lines underneath the star
        ctx.beginPath()
        ctx.arc(0, 0, outer-1, 0, pi2)
        ctx.fill()
        ctx.closePath()

        //Restore canvas to original position
        ctx.restore()
    })//forEach chosen_stars

    ///////////// Draw donuts around stars /////////////

    ctx.globalCompositeOperation = "source-over"

    if(type === "big" || type === "medium") {
        ctx.shadowBlur = 5
        ctx.shadowColor = "#001540"
    }//if

    let arc = d3.arc().context(ctx)
    let pie = d3.pie().value(1).sort(null)

    //Loop over all the stars and draw a small donut chart around it to show how many constellations use that star
    chosen_stars.forEach(d => {
        //Get the star's info and location
        let star = star_by_id[d]
        let pos = pixelPos(star.ra, star.dec, projection)
        //What cultures is this star connected to
        let s_star = chosen_lines.filter(s => s.source === d)
        let t_star = chosen_lines.filter(s => s.target === d)
        //Get the unique id's of these constellations
        let const_ids = [...new Set([...s_star, ...t_star].map(d => d.const_id))].sort()

        //Donut size settings
        let inner = innerRad(star.mag)
        let outer = outerRad(star.mag)
        let corner = (outer - inner) * 0.5
        let pad = (const_ids.length > 10 ? 0.07 : (type === "equirectangular" ? 1.5 : 3) / Math.sqrt(inner*inner + outer*outer))

        //Create the data for the donut chart
        let arcs = pie(const_ids)

        //Move the canvas to center on the star
        ctx.save()
        ctx.translate(...pos)

        //Draw the donut chart around the star
        arcs.forEach(a => {
            ctx.fillStyle = cultures[constellationCulture(a.data)].color
            //color_scale_base(opts.color_scale_const(a.data))
            ctx.beginPath()
            arc
                //Make sure the padding is the same distance, no matter how large the circle
                .padAngle(pad) 
                .innerRadius(inner)
                .outerRadius(outer)
                .cornerRadius(corner)
                (a)
            ctx.closePath()
            ctx.fill()
        })//forEach

        //Restore canvas to original position
        ctx.restore()
    })//forEach chosen_stars

    ///////////// Helper function /////////////
    function innerRad(mag) { return radius_scale(mag) + (type === "equirectangular" ? 1.5 : 5) }
    function outerRad(mag) { return radius_scale(mag) + (type === "equirectangular" ? 3 : (type === "small" ? 12 : 8)) }
    
}//function drawStarDonuts