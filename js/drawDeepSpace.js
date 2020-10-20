///////////////////////////////////////////////////////////////////////////
////////////////////// Create deep space base map /////////////////////////
///////////////////////////////////////////////////////////////////////////
function drawDeepSpace(opts_general, opts) {

    let type = opts_general.type
    let width = opts_general.width
    let height = opts_general.height
    let margin = opts_general.margin
    let projection = opts_general.projection

    let total_width = width + margin.left + margin.right
    let total_height = height + margin.top + margin.bottom

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 1)
    if(type !== "multiple") clipToCircle(ctx, width, height, margin, opts_general.clip_radius)

    ///////////// Dark blue background /////////////

    ctx.fillStyle = "#001540" // "#001133" //"#031845"
    ctx.fillRect(0, 0, total_width, total_height)

    ///////////// Create lighter blobs just because it looks interesting /////////////

    //Set-up density contour https://github.com/d3/d3-contour
    const contour = d3.contourDensity()
        .x(d => d.x)
        .y(d => d.y)
        .size([total_width, total_height])
        .cellSize(2)
        .thresholds([0.01, 0.05, 0.07, 0.08])
        .bandwidth(8)

    //Create the color scale for the lighter patches of deep space
    const colors_milky_way = ["#001b53", "#002269", "#002b82","#00339b"]
    const color_scale_seep_space = d3.scaleLinear().range(colors_milky_way)

    //Create the data to use for the density contour
    //It's spread roughly according to a sine wave
    let space_swirl_data = []
    const n = 1500
    const offset_x = d3.randomUniform(0.2, 0.8)() * width //https://github.com/d3/d3-random
    const offset_phi = Math.random() * pi2 //The starting point of the sine wave
    const offset_amp = d3.randomUniform(0.2, 0.5)() * height //The max height of the sine wave
    for(i = 0; i < n; i++) {
        let x = d3.randomNormal(offset_x, width*0.25)()
        let y = height/2 + offset_amp * Math.sin(pi2*0.15 + (pi2*0.7) * x/width + offset_phi) + d3.randomNormal(0, 100)()
        //Save in array
        space_swirl_data.push({ x: x, y: y})
    }//for i

    //Calculate the contours
    const space_swirl_contour = contour(space_swirl_data)
    // console.table(space_swirl_contour)
    //Base the colors on the final contour values
    color_scale_seep_space.domain(space_swirl_contour.map(d => d.value))
    //Plot the contours
    const path_contour = d3.geoPath().context(ctx)
    ctx.filter = 'blur(20px)'
    if(type === "multiple") ctx.globalAlpha = 0.6
    space_swirl_contour.forEach(d => {
            ctx.beginPath()
            path_contour(d)
            ctx.fillStyle = color_scale_seep_space(d.value)
            ctx.fill()
        })//forEach
    ctx.filter = 'blur(0px)'
    ctx.globalAlpha = 1
    

    ///////////// Graticule & Ecliptic lines /////////////

    const path = d3.geoPath()
        .projection(projection)
        .context(ctx)

    const stepMinor_dec = 10
    const stepMinor_ra = 10
    if(type === "big" || type === "medium") {
        //Create graticule lines
        const graticule = d3.geoGraticule().stepMinor([stepMinor_ra, stepMinor_dec])
        const grid = graticule()
        ctx.beginPath()
        path(grid)
        ctx.globalAlpha = 0.7
        ctx.lineWidth = type === "big" ? 0.75 : 1.25
        ctx.strokeStyle = '#5c5d79'
        ctx.stroke()
        ctx.closePath()
    }//if
    ctx.globalAlpha = 1

    //Create ecliptic circle
    const circle = d3.geoCircle()
    ctx.strokeStyle = "#6a6b8a"
    ctx.lineWidth = type === "multiple" ? 6 : 4
    ctx.setLineDash([2,3])
    ctx.beginPath()
    path(circle.center([90,90 - ecliptic_angle]).radius(90)())
    ctx.stroke()
    ctx.closePath()
    ctx.setLineDash([])

    ///////////////////////////////////////////////////////////////////////////
    //////////////////////// Draw graticule tick marks ////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //////////////// Find graticule - circle crossing positions ////////////////
    /////// It was Philippe Rivière (@fil) who came up with this solution //////

    if(type === "big" || type === "medium") {
        //Create a geoCircle that has a radius slightly smaller as the clipped one
        const clip_circle = circle.radius(opts.clip_angle).center(projection.rotate().map(d => -d)).precision(0.1)()
        //Take out the coordinates
        const poly = clip_circle.coordinates[0].slice()
        //Get the first to compare against in the loop
        let cur = poly[0]
        //Loop over all the points and see if it's a multiple of either the RA step in the x location or Declination in y location of each point. If yes, save in a new variable
        let graticule_ticks = []
        poly.forEach(function(p) {
            let step_dec = (Math.abs(Math.round(p[1])) >= 80) ? 90 : 10
            let step_ra = stepMinor_ra //1 hour is 15 degrees
            if (Math.floor(p[1] / step_dec) != Math.floor(cur[1] / step_dec)) {
                p.type = "dec"
                p.dec = Math.round(p[1])
                graticule_ticks.push(p)
            } else if (Math.floor(p[0] / step_ra) != Math.floor(cur[0] / step_ra)) {
                p.type = "ra"
                //RA should run from 0 to 360 degrees
                p.ra = Math.round(p[0])
                if(p.ra > 0) {
                    p.ra = 360 - p.ra
                } else if(p.ra < 0) {
                    p.ra = -1 * p.ra
                }//else
                graticule_ticks.push(p)
            }//else if
            cur = p
        })//forEach

        /////// Declination markings //////

        //Set font settings
        ctx.font = "13px " + font_family
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.fillStyle = "#9999bb"

        //Draw the declination tick marks
        graticule_ticks
            .forEach(d => {
                let pos = projection([d[0],d[1]])
                if(d.type === "dec") ctx.fillText(d.dec + "°", pos[0], pos[1])
            })

        /////// Right ascension markings //////

        //Draw the right ascension tick marks & use zodiac signs for the 12 "special" numbers
        // const img_size_original = 200
        const img_size = 18
        // ctx.font = "italic 8px " + font_family
        ctx.font = "9px " + font_family
        graticule_ticks
            .forEach(d => {
                let pos = projection([d[0],d[1]])
                if(d.type === "ra") {
                    if(opts.zodiac[d.ra]) {
                        ctx.globalAlpha = 0.7
                        ctx.drawImage(opts.zodiac[d.ra].img, pos[0] - img_size/2, pos[1] - img_size/2, img_size, img_size)
                    } else {
                        ctx.globalAlpha = 1
                        ctx.fillText(d.ra%30 + "°", pos[0], pos[1])
                    }//else
                }//if
            })//forEach
        ctx.globalAlpha = 1
    }//if

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Create outside markings ////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    ctx.restore()

    const radius_outer_circle = width/2 * 0.95 + (type === "big" ? 8 : 9)
    ctx.strokeStyle = "#031845"
    ctx.fillStyle = "#031845"

    /////// Draw top and bottom pointing arrow //////
    if(type === "big" || type === "medium") {
        drawArrow(ctx, radius_outer_circle, "N")
        drawArrow(ctx, radius_outer_circle, "S")
    }//if

    //Draw a North or South pointing arrow on the outside markings
    //So many lines of code >_<
    function drawArrow(ctx, r, direction) {

        const sign = (direction === "N" ? -1 : 1)

        const arrow_width = pi2 * 0.003
        const arrow_height = 20

        //Set stylings
        ctx.lineWidth = 1.5

        //Center of the visual
        let x_offset = width/2 + margin.left
        let y_offset = height/2 + margin.top

        //Calculate points of the triangle
        let x_left = r * Math.cos(sign * pi1_2 - arrow_width) + x_offset
        let y_left = r * Math.sin(sign * pi1_2 - arrow_width) + y_offset
        let x_top = (r + arrow_height) * Math.cos(sign * pi1_2) + x_offset
        let y_top = (r + arrow_height) * Math.sin(sign * pi1_2) + y_offset
        let x_bottom = r * Math.cos(sign * pi1_2) + x_offset
        let y_bottom = r * Math.sin(sign * pi1_2) + y_offset
        let x_right = r * Math.cos(sign * pi1_2 + arrow_width) + x_offset
        let y_right = r * Math.sin(sign * pi1_2 + arrow_width) + y_offset
        //Quadratic bezier curve points
        let x_c_offset =  Math.abs(x_bottom - x_left)*0.25
        let y_c = (y_bottom - y_top)/2 + y_top

        //Draw the outer triangle
        ctx.beginPath()
        ctx.moveTo(x_left, y_left)
        // ctx.quadraticCurveTo(x_bottom + sign * x_c_offset, y_c, x_top, y_top)
        ctx.lineTo(x_top, y_top)
        // ctx.quadraticCurveTo(x_bottom - sign * x_c_offset, y_c, x_right, y_right)
        ctx.lineTo(x_right, y_right)
        ctx.closePath()
        ctx.stroke()

        //Fill the inside on one half of the arrow
        ctx.beginPath()
        ctx.moveTo(x_left, y_left)
        // ctx.quadraticCurveTo(x_bottom + sign * x_c_offset, y_c, x_top, y_top)
        ctx.lineTo(x_top, y_top)
        ctx.lineTo(x_bottom, y_bottom)
        ctx.closePath()
        ctx.fill()

        //Place text on top
        ctx.font = (type === "big" ? "22px " : "28px ") + font_family
        ctx.textBaseline = (direction === "N" ? "bottom" : "top")
        ctx.textAlign = "center"
        ctx.fillStyle = "black"
        ctx.fillText(direction, x_top, y_top + sign * 3)

    }//function drawArrow

    ///////Draw dashed circle around map //////

    if(type === "big" | type === "medium") {
        let stroke_w = 6
        
        //Draw solid thick line
        ctx.lineWidth = stroke_w
        drawCircle(ctx, radius_outer_circle)

        //Take out smaller line to get double line effect
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = stroke_w/2
        drawCircle(ctx, radius_outer_circle)

        //Draw dashed line on top
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = stroke_w
        ctx.setLineDash([9.725,6])
        drawCircle(ctx, radius_outer_circle)
        ctx.setLineDash([])

        //Draw a canvas circle of a specific radius
        function drawCircle(ctx, r) {
            ctx.beginPath()
            ctx.arc(width/2 + margin.left, height/2 + margin.top, r, 0, pi2)
            ctx.closePath()
            ctx.stroke()
        }//function drawCircle
    }//if

    return canvas

} //function drawDeepSpace

///////////////////////////////////////////////////////////////////////////
///////////////// Create minimal milky way space base map /////////////////
///////////////////////////////////////////////////////////////////////////

function drawDeepSpaceSimple(opts_general) {
    
    let width = opts_general.width
    let height = opts_general.height

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, width, height, 1)

    ///////////// Dark blue background /////////////

    ctx.fillStyle = "#001540" // "#001133" //"#031845"
    ctx.fillRect(0, 0, width, height)

    ///////////// Create lighter blobs just because it looks interesting /////////////

    //Set-up density contour https://github.com/d3/d3-contour
    const contour = d3.contourDensity()
        .x(d => d.x)
        .y(d => d.y)
        .size([width, height])
        .cellSize(2)
        .thresholds([0.01, 0.05, 0.07, 0.08])
        .bandwidth(8)

    //Create the color scale for the lighter patches of deep space
    const colors_milky_way = ["#001b53", "#002269", "#002b82","#00339b"]
    const color_scale_seep_space = d3.scaleLinear().range(colors_milky_way)

    //Create the data to use for the density contour that represents the Milky Way
    let space_swirl_data = []
    const n = 2000
    const offset_amp = 0.6 * height //The max height of the sine wave
    let x_random = d3.randomNormal(width*0.5, width*0.20)
    for(i = 0; i < n; i++) {
        let x = x_random()
        let y = height/2 + offset_amp * Math.cos(pi2*0.1 + pi2 * x/width) + d3.randomNormal(0, 60)()
        // ctx.beginPath()
        // ctx.arc(x, y, 3, 0, pi2)
        // ctx.fillStyle = "hotpink"
        // ctx.fill()
        //Save in array
        space_swirl_data.push({ x: x, y: y})
    }//for i

    //Calculate the contours
    const space_swirl_contour = contour(space_swirl_data)
    // console.table(space_swirl_contour)
    //Base the colors on the final contour values
    color_scale_seep_space.domain(space_swirl_contour.map(d => d.value))
    //Plot the contours
    const path_contour = d3.geoPath().context(ctx)

    ctx.filter = 'blur(20px)'
    space_swirl_contour.forEach(d => {
            ctx.beginPath()
            path_contour(d)
            ctx.fillStyle = color_scale_seep_space(d.value)
            ctx.fill()
        })//forEach
    ctx.filter = 'blur(0px)'

    return canvas

}//function drawDeepSpaceSimple
