function createStraightSkyMapLayout(opts, focus_map, h, map_id) {

    let chosen_culture = focus_map.culture
    let lines_div = document.getElementById(map_id + "-lines")
    let data_image

    ////////////////////////////// Set sizes ///////////////////////////////

    let margin = { top: 0, right: 0, bottom: 0, left: 0}
    let height = h
    let focus = JSON.parse(JSON.stringify(focus_map)) //Create deep clone

    /////////////////////////// Set-up projections ////////////////////////////

    //Plate carrée projection, see also: https://astronomy.stackexchange.com/questions/24709/
    const projection = d3.geoEquirectangular()
        .scale(focus.scale)
        .precision(0.1)
        .translate([0, height/2])
        //.rotate([focus.center[0] * 360/24, -1 * focus.center[1], 0])

    let proj_min = projection([-180,0])[0]
    let proj_max = projection([180,0])[0]
    let proj_width = Math.round(proj_max - proj_min)
    let width = proj_width

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

    ////////////////////////////// Create Canvases ///////////////////////////////

    //Create the canvas that's exactly as wide as a full projection
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", `canvas-${map_id}`)
        .attr("class", "canvas-rectangular")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, width, height, 0)

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Create Sky maps /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    let opts_general = {
        chart_id: map_id,
        margin: margin,
        width: proj_width,
        height: height,
        offset_x: -proj_min,
        width_canvas: width,
        projection: projection,
        focus: focus,
        radius_scale: radius_scale,
        type_geo: "equirectangular"
    }

    let opts_lines = {
        chosen_culture: focus.culture,
        star_by_id: opts.star_by_id,
        const_links: opts.const_links
    }

    ///////////// Set mean-stars bars to good height /////////////

    const width_scale = d3.scaleLinear()
        .domain([0, 22])
        .range([0, 100])  

    d3.selectAll(".culture-info .culture-mean-stars")
        .transition().duration(750)
        .style("width", (d,i) => width_scale(cultures[culture_names[i]].mean_stars) + "%")

    ///////////// Initiate the hover movement effect /////////////
    rectangularMoveEffect(map_id) 

    ///////////// Set the culture div click event /////////////
    let culture_timeout = null
    if(map_id === "constellations") {
        d3.selectAll(".culture-info-wrapper")
            .on("click touchstart", function() {
                let el = d3.select(this).select(".culture-info")
                clearTimeout(culture_timeout)
                culture_timeout = setTimeout(() => { changeCulture(el) }, 250)
            })//on
    }//if

    function changeCulture(el) {
        //Get the new chosen culture
        chosen_culture = el.attr("id").replace("culture-","")

        //Update the title in the section above the sky map
        d3.selectAll(".chosen-culture-title")
            .style("color", cultures[chosen_culture].color)
            .html(toTitleCase(chosen_culture.replace(/_/g, ' ')))
        d3.select("#chosen-culture-number").html(cultures[chosen_culture].count)
        d3.select("#chosen-culture-average").html(roundHalf(cultures[chosen_culture].mean_stars))

        //Change the color of the top and bottom border through currentColor
        d3.select("#constellations-border-div").style("color", cultures[chosen_culture].color)

        //Set the colors of the culture info div
        setCultureDivColors(chosen_culture)

        setTimeout(() => {
            //Scroll to the original Orion chart
            document.querySelector("#section-constellations").scrollIntoView({
                behavior: "smooth",
                block: "center"
            })

            //Scroll to the Sky Map, but wait just a little to finish the croll
            setTimeout(() => {
                //Create a new layer with only the lines from that culture and apply that to the background image
                ctx.clearRect(0, 0, width, height)
                ctx.save()
                ctx.translate(-proj_min, 0)
                let canvas_lines = drawConstellationsSimple(opts_general, opts_lines, chosen_culture)
                ctx.drawImage(canvas_lines, proj_min, 0, proj_width, height)
                ctx.restore()
                data_image = canvas.node().toDataURL()
                lines_div.style.backgroundImage = `url(${data_image})`
            }, 500)
        }, 500)
    }//function changeCulture

}//createStraightSkyMapLayout

//////////////////////// Colors if the culture div elements ////////////////////////
function setCultureDivColors(chosen_culture) {
    d3.selectAll(".culture-info")
        .each(function () {
            let el = d3.select(this)
            let culture = el.attr("id").replace("culture-", "")
            let color = cultures[culture].color

            //Reset colors
            el.style("color", color) //So I can use CSS currentcolor
            el.transition("color").duration(0).style("background", null)
            el.selectAll(".culture-name, .culture-number, .culture-text, .culture-mean-stars-note, .culture-mean-stars")
                .classed("active", false)

            //Transition to the colors of the chosen culture
            if(culture === chosen_culture) {
                //Change the look of the chosen culture's block
                el.transition("color").duration(400)
                    .styleTween("background", () => {
                        let interpolate = d3.interpolateLab("#f7f7f7", color)
                        return function(t) {
                            return `-webkit-linear-gradient(left, ${color} -210%, ${interpolate(t)} 20%`
                        }//return
                    })
                el.selectAll(".culture-name, .culture-number, .culture-text, .culture-mean-stars-note, .culture-mean-stars")
                    .classed("active", true)
            }//if
        })//each
}//function setCultureDivColors

//////////////////////// Hover effect ////////////////////////
function rectangularMoveEffect(map_id) {
    let mouse_enter
    let mouse_pos = 0
    d3.select(`#section-${map_id}`).on("mouseover touchstart", function() {
        //Subtract the current value of the CSS variable from the mouse location, so eventually this will balance out in .withLatestFrom 
        mouse_enter = d3.mouse(this)[0] - mouse_pos
        // console.log(d3.mouse(this)[0], mouse_pos, mouse_enter)
    })
        
    //https://codepen.io/flibbon/pen/zojKQB
    //https://codepen.io/davidkpiano/pen/YNOoEK
    //https://css-tricks.com/animated-intro-rxjs/
    const section = document.getElementById(`section-${map_id}`)
    const mouse_move$ = Rx.Observable
        .fromEvent(section, "mousemove")
        .map(e => ({ x: e.clientX }) )
        // .map(e => { console.log(e.clientX); return { x: e.clientX } })
    const touch_move$ = Rx.Observable
        .fromEvent(section, 'touchmove')
        .map(e => ({ x: e.touches[0].clientX }))
    const move$ = Rx.Observable.merge(mouse_move$, touch_move$)

    const smooth_mouse$ = Rx.Observable
        .interval(0, Rx.Scheduler.animationFrame)
        // .withLatestFrom(mouse_move$, (tick, mouse) => mouse)
        // .withLatestFrom(mouse_move$, (tick, mouse) => ({ x : mouse.x - mouse_enter }) )
        .withLatestFrom(move$, (tick, mouse) => { 
            // console.log(mouse_enter) 
            return { x : round(mouse.x - mouse_enter,1)}  
        })
        .scan(lerp, {x: 0})

    function lerp(start, end) {
        // console.log(start, end)
        //Update position by 20% of the distance between position & target
        const rate = 0.02
        const dx = end.x - start.x
        return { x: round(start.x + dx * rate,1) }
    }//function lerp

    smooth_mouse$.subscribe(pos => {
        //Sometimes soon after page load, pos.x becomes NaN, so make sure it only ever returns a number
        if(!isNumeric(pos.x)) pos.x = 0
        mouse_pos = pos.x
        document.documentElement.style.setProperty(`--mouse-${map_id}-x`, round(pos.x, 1));
    })
    // RxCSS({ mouse: smooth_mouse$ })
}//function rectangularMoveEffect