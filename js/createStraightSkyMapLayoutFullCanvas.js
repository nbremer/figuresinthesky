let w_factor

function createStraightSkyMapLayoutFullCanvas(opts, focus_map, w, w_increase, h, map_id, type) {

    let chosen_culture = focus_map.culture
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

    ////////////////////////////// Set sizes ///////////////////////////////

    // let width = w * w_increase
    let width = proj_width //to get exactly 1
    //The offset needed because the canvas is bigger than the screen
    w_factor = (width - w)/2

    ////////////////////////////// Create Canvases ///////////////////////////////

    //Create the canvas
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", `canvas-${map_id}`)
        .attr("class", "canvas-rectangular")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, width, height, 0)

    if(map_id !== "header") canvas.style("color", cultures[chosen_culture].color)

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

    /////////////////////// Deep space base map ////////////////////////
    let canvas_space = drawDeepSpaceSimple(opts_general)

    /////////////////////// Constellations ////////////////////////
    let opts_lines = {
        chosen_culture: focus.culture,
        star_by_id: opts.star_by_id,
        const_links: opts.const_links
    }
    let canvas_lines = drawConstellationsSimple(opts_general, opts_lines, chosen_culture)

    /////////////////////// Stars ////////////////////////
    let opts_stars = {
        stars: opts.stars,
        radius_scale: radius_scale
    }
    let canvas_stars = drawStars(opts_general, opts_stars) 

    //////////// Fill up the entire width with duplicating versions ////////////
    function fillEntireCanvas(ctx, canvas_space, canvas_lines, canvas_stars, proj_min, proj_width, height, width) {
        let offset = proj_min
        ctx.save()
        ctx.translate(-proj_min, 0)
        while(offset - proj_width < width/2) {
            ctx.drawImage(canvas_space, proj_min, 0, proj_width, height)
            ctx.drawImage(canvas_lines, proj_min, 0, proj_width, height)
            ctx.drawImage(canvas_stars, proj_min, 0, proj_width, height)
            ctx.translate(proj_width, 0)
            offset += proj_width
        }//while
        ctx.restore()
    }//function fillEntireCanvas

    fillEntireCanvas(ctx, canvas_space, canvas_lines, canvas_stars, proj_min, proj_width, height, width)

    ///////////// Initiate the hover movement effect /////////////
    // rectangularMoveEffect(map_id, "canvas") 

    ///////////// Set the culture div click event /////////////
    if(map_id === "constellations") {
        d3.selectAll(".culture-info-wrapper")
            .on("click", function() {
                let el = d3.select(this).select(".culture-info")
                //Get the new chosen culture
                chosen_culture = el.attr("id").replace("culture-","")

                //Update the title
                // d3.select("#chosen-culture-number").html(cultures[chosen_culture].count)
                d3.selectAll(".chosen-culture-title")
                    .style("color", cultures[chosen_culture].color)
                    .html(toTitleCase(chosen_culture.replace(/_/g, ' ')))

                //Create a new layer with only the lines from that culture
                let canvas_lines = drawConstellationsSimple(opts_general, opts_lines, chosen_culture)
                //Fill up the entire canvas with this culture
                fillEntireCanvas(ctx, canvas_space, canvas_lines, canvas_stars, proj_min, proj_width, height, width)

                //Change the color of the top and bottom border through currentColor
                d3.select("#canvas-constellations").style("color", cultures[chosen_culture].color)

                //Set the colors of the culture info div
                setCultureDivColors(chosen_culture)
            })//on
    }//if

    ///////////// Set the rectangle resize function /////////////
    let current_width = window.innerWidth
    let resizeTimer
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(function() {
            //Only resize if the width is changed
            if(window.innerWidth !== current_width) {
                //Update several widths
                current_width = window.innerWidth
                width = window.innerWidth * w_increase
                w_factor = (width - window.innerWidth)/2
                opts_general.width_canvas = width
                crispyCanvas(canvas, ctx, width, height, 0)
                //Fill the new canvas from start to finish
                fillEntireCanvas(ctx, canvas_space, canvas_lines, canvas_stars, proj_min, proj_width, height, width)
            }//if  
        }, 250)//setTimeout
    })//on resize

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
            el.selectAll(".culture-name, .culture-number, .culture-text")
                .classed("active", false)

            //Transition to the colors of the chosen culture
            if(culture === chosen_culture) {
                //Change the look of the chosen culture's block
                el.transition("color").duration(700)
                    .styleTween("background", () => {
                        let interpolate = d3.interpolateLab("#f7f7f7", color)
                        return function(t) {
                            return `-webkit-linear-gradient(left, ${color} -250%, ${interpolate(t)} 20%`
                        }//return
                    })
                el.selectAll(".culture-name, .culture-number, .culture-text")
                    .classed("active", true)
            }//if
        })//each
}//function setCultureDivColors

//////////////////////// Hover effect ////////////////////////
function rectangularMoveEffect(map_id, type) {
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
        // .withLatestFrom(mouse_move$, (tick, mouse) => ({ x : Math.min(Math.max(mouse.x - mouse_enter, -(w_factor-1)), w_factor-1) }) )
        .withLatestFrom(move$, (tick, mouse) => { 
            // console.log(mouse_enter) 
            if(type === "image") return { x : mouse.x - mouse_enter}  
            else return { x : Math.min(Math.max(mouse.x - mouse_enter, -(w_factor-1)), w_factor-1) } 
        })
        .scan(lerp, {x: 0})

    function lerp(start, end) {
        // console.log(start, end)
        //Update position by 20% of the distance between position & target
        const rate = 0.02
        const dx = end.x - start.x
        return { x: start.x + dx * rate }
    }//function lerp

    smooth_mouse$.subscribe(pos => {
        mouse_pos = pos.x
        document.documentElement.style.setProperty(`--mouse-${map_id}-x`, pos.x);
    })
    // RxCSS({ mouse: smooth_mouse$ })
}//function rectangularMoveEffect