/////////////////////////////////////////////////////////////////////
///////////////////////////// CONSTANTS /////////////////////////////
/////////////////////////////////////////////////////////////////////

const pi1_2 = Math.PI / 2
const pi = Math.PI
const pi2 = Math.PI * 2

const basemap_size = 1600
const width = basemap_size
const height = basemap_size
const margin = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}

let focus = {
    hip: 27989,
    proper: "Betelgeuse",
    title_position: "bottom-left",
    center: [5.603559, 3.20192], //ra in hours dec in degrees
    scale: 1950,
}

const background_mode = "dark"
const blending = background_mode === "dark" ? "screen" : "multiply"

//////////////////////////// Culture data ///////////////////////////

//All cultures and their colors
const cultures = []
cultures["arabic"] = { culture: "arabic", color: "#EFB605", count: 49, mean_stars: 10.96 }
cultures["arabic_moon_stations"] = { culture: "arabic_moon_stations", color: "#EBAF02", count: 28, mean_stars: 3.43 }
cultures["aztec"] = { culture: "aztec", color: "#E8A400", count: 5, mean_stars: 8.4 }
cultures["belarusian"] = { culture: "belarusian", color: "#E69201", count: 20, mean_stars: 5.95 }
cultures["boorong"] = { culture: "boorong", color: "#E47607", count: 28, mean_stars: 7.93 }
cultures["chinese"] = { culture: "chinese", color: "#E45311", count: 318, mean_stars: 4.46 }
cultures["dakota"] = { culture: "dakota", color: "#E3301C", count: 13, mean_stars: 8.39 }
cultures["egyptian"] = { culture: "egyptian", color: "#DF1428", count: 28, mean_stars: 9 }
cultures["hawaiian_starlines"] = { culture: "hawaiian_starlines", color: "#D80533", count: 13, mean_stars: 6.85 }
cultures["indian"] = { culture: "indian", color: "#CE003D", count: 28, mean_stars: 2.68 }
cultures["inuit"] = { culture: "inuit", color: "#C30048", count: 11, mean_stars: 3.73 }
cultures["japanese_moon_stations"] = { culture: "japanese_moon_stations", color: "#B80452", count: 28, mean_stars: 4.79 }
cultures["kamilaroi"] = { culture: "kamilaroi", color: "#AC0C5E", count: 13, mean_stars: 1 }
cultures["korean"] = { culture: "korean", color: "#9F166A", count: 272, mean_stars: 4.46 }
cultures["macedonian"] = { culture: "macedonian", color: "#932278", count: 19, mean_stars: 3.95 }
cultures["maori"] = { culture: "maori", color: "#852F87", count: 6, mean_stars: 5.33 }
cultures["mongolian"] = { culture: "mongolian", color: "#763C95", count: 4, mean_stars: 6.25 }
cultures["navajo"] = { culture: "navajo", color: "#644AA0", count: 8, mean_stars: 15.75 }
cultures["norse"] = { culture: "norse", color: "#4F56A6", count: 6, mean_stars: 5.83 }
cultures["ojibwe"] = { culture: "ojibwe", color: "#3963A7", count: 10, mean_stars: 9.6 }
cultures["romanian"] = { culture: "romanian", color: "#2570A2", count: 39, mean_stars: 9.41 }
cultures["sami"] = { culture: "sami", color: "#148097", count: 10, mean_stars: 3.3 }
cultures["sardinian"] = { culture: "sardinian", color: "#0A9087", count: 11, mean_stars: 6.45 }
cultures["siberian"] = { culture: "siberian", color: "#099E77", count: 3, mean_stars: 6.67 }
cultures["tongan"] = { culture: "tongan", color: "#17AA69", count: 11, mean_stars: 4.27 }
cultures["tukano"] = { culture: "tukano", color: "#31B15F", count: 11, mean_stars: 16.91 }
cultures["tupi"] = { culture: "tupi", color: "#55B558", count: 7, mean_stars: 21.57 }
cultures["western"] = { culture: "western", color: "#7EB852", count: 88, mean_stars: 7.90 }

/////////////////////////////////////////////////////////////////////
//////////////////////////// Create SVG /////////////////////////////
/////////////////////////////////////////////////////////////////////
const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", background_mode === "dark" ? "#001540" : "white")

const g = svg.append("g")

///////////////////////// Create glow filter ////////////////////////

//Container for the gradients
const defs = svg.append("defs")
//Filter for the outside glow
let filter = defs.append("filter")
    .attr("id","glow")
    .attr("width", "300%")
    .attr("x", "-100%")
    .attr("height", "300%")
    .attr("y", "-100%")

filter.append("feGaussianBlur")
    .attr("class", "blur")
    .attr("stdDeviation","3.5")
    .attr("result","coloredBlur")

let feMerge = filter.append("feMerge")
feMerge.append("feMergeNode").attr("in","coloredBlur")
feMerge.append("feMergeNode").attr("in","SourceGraphic")
    
/////////////////////////////////////////////////////////////////////
//////////////////////////// Load data //////////////////////////////
/////////////////////////////////////////////////////////////////////

d3.queue()
    .defer(d3.csv, "../data/stars.csv")
    .defer(d3.csv, "../data/constellation_links.csv")
    .defer(d3.csv, "../data/constellations_per_star.csv")
    .await(dataLoaded)

function dataLoaded() {
    //Put loaded data into the variables
    let [error, stars, const_links, const_per_star] = [...arguments]
    if (error) throw error

    stars.forEach(d => {
        d.hip = +d.hip
        d.ra = +d.ra
        d.dec = +d.dec
        d.mag = +d.mag
        d.absmag = +d.absmag
        d.t_eff = +d.t_eff
        d.constellations = +d.constellations
    })//forEach

    const_links.forEach(d => {
        d.source = +d.source
        d.target = +d.target
    })//forEach

    const_per_star.forEach(d => {
        d.star_id = +d.star_id
    })//forEach

    let star_by_id = {}
    stars.forEach(d => {
        star_by_id[d.hip] = d
    })//forEach

    /////////////////// Get unique constellations ///////////////////
    let chosen_star = star_by_id[focus.hip]

    //Get all of the constellations that include the chosen star
    let constellations = const_per_star
        .filter(d => d.star_id === focus.hip)
        .map(d => d.const_id)
        .sort()
    
    //Create the central image of all constellations that use the chosen star
    let chosen_const = constellations

    //Get all the lines that are in these constellations
    let chosen_lines = const_links.filter(d => constellations.indexOf(d.const_id) > -1)

    //Create a unique id per line-star pairing
    //Make sure it doesn't matter if the same combination of stars switches in s-t or t-s setting
    chosen_lines.forEach(d => { d.line_id = d.source < d.target ? d.source + "_" + d.target :  d.target + "_" + d.source })

    ////////////////////// Set-up projections ///////////////////////

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
        
    ////////////////////////// Draw visual //////////////////////////

    drawConstellations(g, projection, chosen_lines, star_by_id)

    drawStarDonuts(g, projection, star_by_id, chosen_lines, radius_scale) 

    drawStars(g, defs, stars, width, height, projection, radius_scale, background_mode === "dark" ? "glow" : "simple")

    ////////////////// Draw ring around chosen star /////////////////

    const pos_chosen = pixelPos(chosen_star.ra, chosen_star.dec, projection)

    g.append("circle")
        .attr("cx", pos_chosen[0])
        .attr("cy", pos_chosen[1])
        .attr("r", radius_scale(chosen_star.mag) + 13)
        .style("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", 4)

}//function dataLoaded

/////////////////////////////////////////////////////////////////////
///////////////////////////// Draw stars ////////////////////////////
/////////////////////////////////////////////////////////////////////
function drawStars(g, defs, stars, width, height, projection, radius_scale, type = "glow") {

    //Colors of the stars based on their effective temperature
    //https://gka.github.io/chroma.js/
    const star_colors = ["#9db4ff","#aabfff","#cad8ff","#fbf8ff","#fff4e8","#ffddb4","#ffbd6f","#f84235","#AC3D5A","#5A4D6E"]
    const star_temperatures = [30000,20000,8500,6800,5600,4500,3000,2000,1000,500]
    const star_color_scale = chroma
        .scale(star_colors)
        .domain(star_temperatures)

    ///////////// Draw stars /////////////

    let star_group = g.append("g").attr("class", "stars")

    //Draw the stars
    stars.forEach((d,i) => {
        //Get pixel coordinates on the screen
        let pos = pixelPos(d.ra, d.dec, projection)

        //If this star falls outside of the map, don't plot
        if(pos[0] < 0 || pos[0] > width || pos[1] < 0 || pos[1] > height) return

        //Star dependant settings
        let r = radius_scale(d.mag) //Math.pow(1.2, 5 - d.mag)
        let col = d.t_eff ? star_color_scale(d.t_eff) : "white"

        if(type === "glow") {
            //Radial gradient
            let gradient_star = defs.append("radialGradient")
                .attr("id", `gradient-${i}`)
                .attr("r", "55%")

            //Append the color stops
            gradient_star.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", chroma(col).brighten(1))
            gradient_star.append("stop")
                .attr("offset", "60%")
                .attr("stop-color", col)
            gradient_star.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", chroma(col).saturate(3).darken(1))
        }//if

        star_group.append("circle")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", r)
            .style("fill", type === "glow" ? `url(#gradient-${i})` : col)
            .style("filter", type === "glow" ? "url(#glow)" : "none")
            .style("mix-blend-mode", blending)
    })//forEach

}//function drawStars

/////////////////////////////////////////////////////////////////////
///////////////////// Draw constellations lines /////////////////////
/////////////////////////////////////////////////////////////////////
function drawConstellations(g, projection, chosen_lines, star_by_id) {
   
    let constellation_group = g.append("g").attr("class", "constellations")

    const line_width = 4
    let offset = 0.95 * line_width

    //Nest per line id
    let nested_lines = d3.nest()
        .key(d => d.line_id)
        .entries(chosen_lines)
    
    ///////////// Draw nested lines /////////////

    //Draw the constellation lines
    nested_lines.forEach(d => {
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
            
            constellation_group.append("path")
                .attr("d", `M${pos_s[0] + dx},${pos_s[1] + dy} L ${pos_t[0] + dx},${pos_t[1] + dy}`)
                .style("stroke", cultures[constellationCulture(l.const_id)].color)
                .style("stroke-width", line_width)
                .style("fill", "none")
                .style("opacity", 0.7)
                .style("mix-blend-mode", blending)
        })//forEach lines
    })//forEach nested_lines

}//function drawConstellations

/////////////////////////////////////////////////////////////////////
////////// Draw small donuts around each constellation star /////////
/////////////////////////////////////////////////////////////////////
function drawStarDonuts(g, projection, star_by_id, chosen_lines, radius_scale) {

    let donut_group = g.append("g").attr("class", "donuts")
    let donuts_background = donut_group.append("g").attr("class", "donuts-background")
    let donuts = donut_group.append("g").attr("class", "donuts")

    //Get all the unique stars in the lines
    let chosen_stars = [...new Set([...chosen_lines.map(d => d.source), ...chosen_lines.map(d => d.target)])]

    let arc = d3.arc()
    let pie = d3.pie().value(1).sort(null)

    ///////// Draw background circles to block out the lines ////////
    donuts_background.selectAll(".donut-background")
        .data(chosen_stars)
        .enter().append("circle")
        .attr("class", "donut-backgrounds")
        .attr("r", s => outerRad(star_by_id[s].mag) - 1)
        .style("fill", background_mode === "dark" ? "#001540" : "white")
        .each(function(d) {
            let el = d3.select(this)

            //Get the star's info and location
            let star = star_by_id[d]
            let pos = pixelPos(star.ra, star.dec, projection)
            el.attr("transform", `translate(${pos[0]},${pos[1]})`)  
        })//each

    //////////////////// Draw donuts around stars ///////////////////
    donuts.selectAll(".donuts")
        .data(chosen_stars)
        .enter().append("g")
        .attr("class", "donuts")
        .each(function(d) {
            let el = d3.select(this)

            //Get the star's info and location
            let star = star_by_id[d]
            let pos = pixelPos(star.ra, star.dec, projection)
            el.attr("transform", `translate(${pos[0]},${pos[1]})`)

            //What cultures is this star connected to
            let s_star = chosen_lines.filter(s => s.source === d)
            let t_star = chosen_lines.filter(s => s.target === d)
            //Get the unique id's of these constellations
            let const_ids = [...new Set([...s_star, ...t_star].map(d => d.const_id))].sort()

            //Donut size settings
            let inner = innerRad(star.mag)
            let outer = outerRad(star.mag)
            let corner = (outer - inner) * 0.5
            let pad = (const_ids.length > 10 ? 0.07 : 3 / Math.sqrt(inner*inner + outer*outer))

            //Draw the donut chart
            el.selectAll(".donut-piece")
                .data(pie(const_ids))
                .enter().append("path")
                .attr("class", "donut-piece")
                .style("fill", a => cultures[constellationCulture(a.data)].color)
                .attr("d", arc
                    .padAngle(pad) 
                    .innerRadius(inner)
                    .outerRadius(outer)
                    .cornerRadius(corner))
                .style("mix-blend-mode", blending)
        })//each

    //////////////////////// Helper function ////////////////////////
    function innerRad(mag) { return radius_scale(mag) + 5 }
    function outerRad(mag) { return radius_scale(mag) + 8 }
    
}//function drawStarDonuts

/////////////////////////////////////////////////////////////////////
////////////////////////// HELPER FUNCTIONS /////////////////////////
/////////////////////////////////////////////////////////////////////

//////////////////// Return projected coordinates ///////////////////
function pixelPos(ra, dec, projection) { return projection([-ra * (360/24), dec]) }

//////////// Get the base constellation name from the id ////////////
function constellationCulture(s) {
    let n = s.indexOf("-")
    s = s.substring(0, n != -1 ? n : s.length)
    return s
}//function constellationCulture