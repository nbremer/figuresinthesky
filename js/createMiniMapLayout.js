function createSmallMultipleLayout(opts_data, draw_type) {
    let focus = []

    ////////////////////////////// List of stars ///////////////////////////////

    focus.push({
        hip: 60718,
        proper: "Acrux",
        note: "Located in the Southern Cross constellation, quite near the South Pole",
        title_position: "bottom-left",
        center: [12.443311, -60],
        scale: 6000,
        small_multiple: true,
    })

    focus.push({
        hip: 21421,
        proper: "Aldebaran",
        title_position: "top-left",
        note: "Part of Taurus, this star is used most often across cultures after Orion's 'belt'",
        center: [4.5, 18],
        scale: 6000,
        small_multiple: true,
    })

    focus.push({
        hip: 76267,
        proper: "Alphekka",
        title_position: "bottom-right",
        note: "A great number of things are seen in this half circular 'Corona Borealis'",
        center: [15.7,29],
        scale: 3800,
        small_multiple: true,
    })

    // //Really not
    // focus.push({
    //     hip: 109268,
    //     proper: "Alnair",
    //     title_position: "top-left",
    //     note: "Test",
    //     center: [22.1, -47],
    //     scale: 2800,
    //     small_multiple: true,
    // })

    //Really not
    focus.push({
        hip: 97649,
        proper: "Altair",
        title_position: "top-left",
        note: "This star is easiest to find as the bottom of the 'Summer Triangle'",
        center: [19.8, 8.9],
        scale: 2800,
        small_multiple: true,
    })

    focus.push({
        hip: 35904,
        proper: "Aludra",
        title_position: "bottom-right",
        note: "This far-away star shines more than 176,000 times brighter than the Sun",
        center: [6.9, -27],
        scale: 1900,
        small_multiple: true,
    })

    focus.push({
        hip: 17847,
        proper: "Atlas",
        title_position: "top-left",
        note: "Part of the Pleiades, a tightly packed 'star cluster' of 9 relatively bright stars",
        center: [3.8, 24],
        scale: 15000,
        small_multiple: true,
    })

    focus.push({
        hip: 80763,
        proper: "Antares",
        title_position: "top-left",
        note: "A distinctly red star that is known by many cultures as The Heart",
        center: [16.75, -33],
        scale: 2100,
        small_multiple: true,
    })

    // //Really not
    // focus.push({
    //     hip: 69673,
    //     proper: "Arcturus",
    //     title_position: "bottom-right",
    //     note: "Often used as a single star 'constellation'",
    //     center: [14.3, 31],
    //     scale: 1900,
    //     small_multiple: true,
    // })

    focus.push({
        hip: 27989,
        proper: "Betelgeuse",
        title_position: "bottom-left",
        note: "The red super-giant star of Orion's shoulder",
        center: [5.603559, 3.20192],
        scale: 1950,
        small_multiple: false,
    })

    focus.push({
        hip: 30438,
        proper: "Canopus",
        title_position: "bottom-right",
        note: "The second brightest star, but no clear shape appears across cultures",
        center: [7.8, -49],
        scale: 1700,
        small_multiple: true,
    })

    focus.push({
        hip: 24608,
        proper: "Capella",
        title_position: "top-left",
        note: "Interestingly known as 'the Goat star' across several cultures",
        center: [5.5, 39],
        scale: 2400,
        small_multiple: true,
    })

    focus.push({
        hip: 102098,
        proper: "Deneb",
        title_position: "top-right",
        note: "Meaning 'tail', it belongs to both the Swan & the Summer Triangle",
        center: [20.37047, 40.25668],
        scale: 1700,
        small_multiple: true,
    })

    focus.push({
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        note: "Found in the Big Dipper, which belongs to the Big Bear",
        center: [12.3, 56],
        scale: 2200,
        small_multiple: false,
    })

    // focus.push({
    //     hip: 113368,
    //     proper: "Fomalhaut",
    //     title_position: "top-left",
    //     note: "Meaning 'mouth of the whale', it's part of the zodiac constellation Pisces",
    //     center: [22.5,-20],
    //     scale: 1900,
    //     small_multiple: true,
    // })

    // //Really not
    // focus.push({
    //     hip: 90185,
    //     proper: "KausAustralis",
    //     title_position: "top-left",
    //     note: "Test",
    //     center: [18.4, -30],
    //     scale: 2200,
    //     small_multiple: true,
    // })

    focus.push({
        hip: 15863,
        proper: "Mirphak",
        title_position: "top-left",
        note: "Ascribed to fascinating animal shapes, such as a puma, deer, elk and bird",
        center: [3.4, 50],
        scale: 3000,
        small_multiple: true,
    })

    focus.push({
        hip: 11767, 
        proper: "Polaris",
        note: "The famous North (Pole) star and part of the Little Dipper (and Ursa Minor)",
        title_position: "bottom-right",
        center: [12, 85],
        scale: 2200,
        small_multiple: true,
    })

    focus.push({
        hip: 37826,
        proper: "Pollux",
        title_position: "bottom-left",
        note: "The 'heavenly twins' (together with Castor) and the zodiac sign of Gemini",
        center: [7.1, 25],
        scale: 2400,
        small_multiple: true,
    })

    focus.push({
        hip: 49669,
        proper: "Regulus",
        title_position: "top-right",
        note: "The brightest star (actually 4 stars together) of the zodiac Leo, the Lion",
        center: [10.6,19],
        scale: 2000,
        small_multiple: true,
    })

    focus.push({
        hip: 32349,
        proper: "Sirius",
        title_position: "top-right",
        note: "The brightest star of the night sky, part of the Large Dog",
        center: [6.752481, -21],
        scale: 2600,
        small_multiple: false,
    })

    //Really not
    focus.push({
        hip: 65474,
        proper: "Spica",
        title_position: "bottom-left",
        note: "Derived from 'the virgin's ear' in Latin, it's part of the zodiac constellation Virgo",
        center: [13.419883, -4],
        scale: 1200,
        small_multiple: true,
    })

    ////////////////////////////// Draw small multiples ///////////////////////////////

    let m = 0
    let size = 170

    //Loop over each star and draw the mini map
    focus
        .filter(d => d.small_multiple)
        .forEach((d,i) => {
            let p_name = d.proper.toLowerCase()
            let chart_id = "div-" + p_name
            //Create a div to put this in
            const chart_group = d3.select("#chart-container-small-multiple").append("div")
                .datum(d)
                .attr("id", chart_id)
                .attr("class", "div-group-small-multiple")
                //.style("color", colors[i])
                .on("click", d => smallMapClick(d, opts_data))

            //Add star's title on top
            chart_group.append("p")
                .attr("class", "small-multiple-chart-title")
                .html(d.proper)
            //Add note about the star/constellation
            chart_group.append("p")
                .attr("class", "small-multiple-chart-sub-title red")
                .html(d.note)

            if(draw_type === "image") {
                //Add image of small multiple
                chart_group.append("div")
                    .attr("id", "div-small-multiple-" + p_name)
                    .attr("class", "div-small-multiple")
                    .style("width", size + "px")
                    .style("height", size + "px")
                    .style("background-image", `url("img/small-multiple/small-multiple-${p_name}-2x-min.png")`)
            } else {
                //Draw the canvas instead
                createMap(opts_data, m, size, size, "#" + chart_id, d, "multiple")
            }//else
        })//forEach

    ////////////////////////////// Clickable text ///////////////////////////////

    //Make some texts in the body copy clickable
    focus.forEach(d => {
        d3.selectAll(`.${d.proper.toLowerCase()}-click`)
            .on("click", () => smallMapClick(focus.filter(s => s.proper === d.proper)[0], opts_data))
    })

}//function createSmallMultipleLayout

function createMap(opts_data, m, w, h, container_id, focus, type) {
    ////////////////////////////// Set sizes ///////////////////////////////
    let margin = { left: m, top: m, right: m, bottom: m }
    let width = w
    let height = h
    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    ////////////////////////////// Create canvas ///////////////////////////////
    const canvas = d3.select(container_id).append("canvas")
        .attr("id", "canvas-" + type + "-" + focus.proper.toLowerCase())
        .attr("class", "canvas-circular canvas-small-multiple")
        .datum(focus)
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)

    ////////////////////////////// Create sky map ///////////////////////////////

    //Get all of the constellations that include the chosen star
    let constellations = opts_data.const_per_star
        .filter(d => d.star_id === focus.hip)
        .map(d => d.const_id)
        .sort()

    let chosen_const = constellations
    let location = {
        x: margin.left,
        y: margin.top,
        width: width,
        height: height
    }

    ////////////////////////////// Possible down-scaling for anti-alias ///////////////////////////////

    //Downscale in steps
    if(type === "multiple" && sf < 2) {
        // Get the original constellation line canvas
        const basemap = createCircularBaseMap(opts_data, focus, chosen_const, type)
        let new_size = basemap_total_size / 2
        let new_canvas = drawToTemp(basemap, new_size, "origin")

        new_size = new_size / 2
        ctx.drawImage(new_canvas, location.x, location.y, location.width, location.height)

        //Down-scaling in steps to reduce anti-aliasing
        //Based on https://stackoverflow.com/a/17862644/2586314
        function drawToTemp(canvas, size) {
            let canvas_temp = document.createElement('canvas') //offscreen canvas
            let ctx_temp = canvas_temp.getContext('2d')
            canvas_temp.width = size
            canvas_temp.height = size
            ctx_temp.drawImage(canvas.canvas_space, 0, 0, canvas_temp.width, canvas_temp.height)
            ctx_temp.drawImage(canvas.canvas_stars, 0, 0, canvas_temp.width, canvas_temp.height)
            ctx_temp.drawImage(canvas.canvas_lines, 0, 0, canvas_temp.width, canvas_temp.height)

            return canvas_temp
        }//function drawToTemp
    } else {
        drawMap(opts_data, canvas, ctx, focus, chosen_const, location, type)
    }//else

    ////////////////////////////// Add interactivity ///////////////////////////////

    //Make it clickable
    canvas.on("click", d => smallMapClick(d, opts_data))

}//function createMap

//When clicking on this div, the visual scrolls to Orion and changes the map there to show the chosen star
function smallMapClick(d, opts_data) {
    // //Scroll to the original Orion chart
    // document.querySelector("#section-chart-orion").scrollIntoView({
    //     behavior: "smooth",
    //     block: "center"
    // })
    // const section = document.getElementById("section-chart-orion")
    // window.scrollBy({
    //     top: section.getBoundingClientRect().top - 20, 
    //     left: 0, 
    //     behavior: "smooth"
    // })

    //Show the modal
    simple_modal.open("#chart-modal")

    //Don't do anything else if the person clicked the same star twice
    if(d.proper === current_orion_map) return
    current_orion_map = d.proper

    // d3.select("#betelgeuse-note").style("display", d.proper === "Betelgeuse" ? "none" : "inline")

    //Fade in the group to hide the map and remove some elements from the base map
    let map_id = "modal"
    d3.selectAll(`#canvas-${map_id}, #canvas-mini-${map_id}, #svg-${map_id} .chart-circular-title-group, #svg-${map_id} .chart-circular-mini-map-group`).remove()
    const fade_group = d3.select(`#svg-${map_id} .chart-circular-hide-group`).style("opacity", 1)
    fade_group.select(".chart-circular-text-name").text(d.proper)
    fade_group.select(".chart-circular-text-culture").text("")

    //Create the new layout, but wait a bit for the pop-up to have appeared
    setTimeout(() => {
        let size_decrease_scale = d3.scaleLinear()
            .domain([6,23])
            .range([110,40])
        let num_const = opts_data.const_per_star.filter(s => s.star_id === d.hip).length
        let scale_factor = Math.min(1, (window.innerHeight - size_decrease_scale(num_const)) / orion_size)
        let new_size = orion_size * scale_factor
        let new_m = orion_m * scale_factor

        //Portrait screens
        if(window.innerHeight > window.innerWidth) {
            d3.select("#section-chart-modal")
                .style("height","auto")
                .style("max-width", "100%")
                .style("margin-left", 20 + "px")
                .style("margin-right", 20 + "px")
                .style("margin-top", 40 + "px")
                .style("margin-bottom", 40 + "px")
        }//if

        createCentralCircleLayout(opts_data, d, new_m, new_size, new_size, map_id)
        // createCentralCircleLayout(opts_data, d, orion_m, orion_size, orion_size, map_id)
    }, 200)
    
}//function smallMapClick