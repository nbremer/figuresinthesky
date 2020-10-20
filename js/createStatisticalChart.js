function createStatChartStars(map_id, stars) {

    ////////////////////////////// Set sizes ///////////////////////////////
    let total_width = document.getElementById("chart-" + map_id).offsetWidth - 2 * 20
    let margin = { left: 40, top: 60, right: 200, bottom: 50 }
    let width = total_width - margin.left - margin.right
    let total_height = Math.round(width * 0.8)
    let height = total_height - margin.top - margin.bottom

    ////////////////////////////// Create canvas ///////////////////////////////
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", "canvas-" + map_id)
        .attr("class", "canvas-circular")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)
    ctx.translate(margin.left, margin.top)

    ////////////////////////////// Create svg ///////////////////////////////
    const svg = d3.select("#chart-" + map_id).append("svg")
        .attr("id", "svg-" + map_id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ////////////////////////////// Create scales ///////////////////////////////
    const x_scale = d3.scaleLinear() //mag
        .domain([6.5, -1.5])
        .range([0, width])

    const y_scale = d3.scaleLinear() //number of constellations
        .domain([0, 35])
        .range([height, 0])

    const r_scale = d3.scaleSqrt()
        .domain([10, -15])
        .range([1, 5])
        .clamp(true)

    ////////////// Add voronoi hover //////////////
    const voronoi = d3.voronoi()
        .x(d => x_scale(d.mag))
        .y(d => y_scale(d.constellations))
    let diagram = voronoi(stars.filter(d => d.constellations > 0))
    
    let current_found = "betelgeuse"
    function moved() {
        let m = d3.mouse(this)
        let found = diagram.find(m[0], m[1], 20)
        if(found) {
            found = found.data
            if(current_found !== found) {
                current_found = found

                //Show the hover star
                hover_star
                    .attr("cx", x_scale(found.mag))
                    .attr("cy", y_scale(found.constellations))
                    .attr("r", r_scale(found.absmag))
                    .style("fill", found.col)
                hover_star_marker
                    .attr("cx", x_scale(found.mag))
                    .attr("cy", y_scale(found.constellations))
                    .attr("r", r_scale(found.absmag) + 4)
                hover_star_group.style("opacity", 1)

                //Adjust the text
                if(found.proper !== "") {
                    star_name.text("That's " + found.proper)
                    star_hip_id.text("HIP " + found.hip)
                } else {
                    star_name.text("That's HIP " + found.hip)
                    star_hip_id.text("")
                }//else
                star_const_name.text("Found in the area of " + found.const_name)
                //Reveal the info group in the bottom right
                info_group
                    .transition("fade").duration(100)
                    .style("opacity", 1)

            }//if
        } else {
            current_found = ""
            hover_star_group.style("opacity", 0)
            //Hide the info group in the bottom right
            info_group
                .transition("fade").duration(200)
                .style("opacity", 0)
        }//else
    }//function moved

    //Add rect that will capture the mouse event
    svg.append("rect")
        .attr("class", "hover-rect")
        .attr("x", -margin.left)
        .attr("y", -margin.top)
        .attr("width", total_width)
        .attr("height", total_height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", moved)

    //Create an info group to show on hover
    let info_group = svg.append("g")
        .attr("class", "info-group")
        .attr("transform", "translate(" + [width - 30, height - 70] + ")")
        .style("opacity", 0)

    let star_name = info_group.append("text")
        .attr("id", "info-group-star-name")
        .attr("class", "info-group-text")
        .attr("y", 0)
        .attr("dy", "0.35em")
        .text("That's Betelgeuse")

    let star_const_name = info_group.append("text")
        .attr("id", "info-group-star-const-name")
        .attr("class", "info-group-text")
        .attr("y", 24)
        .attr("dy", "0.35em")
        .text("Found in the area of Taurus")

    let star_hip_id = info_group.append("text")
        .attr("id", "info-group-star-hip-id")
        .attr("class", "info-group-text")
        .attr("y", 42)
        .attr("dy", "0.35em")
        .text("HIP 409913")

    ////////////// Add info section //////////////

    // svg.append("g").attr("class","note-group")
    //     .append("foreignObject").attr("id", "note-object")
    //     .attr("width", 160)
    //     .attr("height", 200)
    //     .attr("x", width + margin.right - 160 - 20)
    //     .attr("y", -margin.top)
    //     .append("xhtml:div").attr("id", "chart-stats-note-div")
    //     .html("NOTE | Star colors have been exaggerated for better visibility. The sizes of the stars are (not-linearly) scaled to the <i>actual brightness</i> of the stars (called absolute magnitude).")

    ////////////////////////////// Create color scale ///////////////////////////////
    var star_colors_yor = ["#F6E153", "#EFB605", "#F7980C", "#F2691B", "#E6330A", "#D3351D", "#AC3D5A", "#5A4D6E"]
    var star_temperatures_yor = [6510, 6000, 5000, 4000, 3000, 2000, 1000, 500]
    var color_scale_yor = chroma.scale(star_colors_yor)
        .domain(star_temperatures_yor)

    //To not get any green colors, make a separate color scale for blue
    var star_colors_blue = ["#111E85","#145AA3","#63A9C1", "#A5D1DD", "#d0f0f9"]
    var star_temperatures_blue = [30000, 20000, 10000, 8000, 6511]

    var color_scale_blue = chroma.scale(star_colors_blue)
        .domain(star_temperatures_blue)
        .mode('lch')
        .correctLightness()

    ////////////// Create circles //////////////

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "multiply"
    ctx.shadowBlur = 4

    stars.forEach(d => {
        if(d.constellations === 0 || d.mag > 6.5) return

        let x = x_scale(d.mag)
        let y = y_scale(d.constellations)
        let r = r_scale(d.absmag)

        d.col = "white"
        if(d.t_eff) {
            let color_scale = d.t_eff > 6510 ? color_scale_blue : color_scale_yor
            d.col = color_scale(d.t_eff)
        }//if
        ctx.fillStyle = d.col
        //Create a glow around each star
        ctx.shadowColor = d.col

        //Draw the circle
        ctx.beginPath()
        ctx.arc(x, y, r, 0, pi2)
        ctx.closePath()
        ctx.fill()
    })

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    ////////////// Create axes //////////////

    let x_axis = svg.append("g") //x scale - mag
        .attr("class", "axis x")
        .attr("transform", "translate(0 " + height + ")")
        .call(d3.axisBottom(x_scale)
            .ticks(10))
    x_axis.selectAll(".tick").remove()

    let y_axis = svg.append("g") //y scale - num constellations
        .attr("class", "axis y")
        .call(d3.axisLeft(y_scale).ticks(4))
    y_axis.selectAll("path").remove()

    ////////////// Create titles //////////////

    //Add x title
    x_axis.selectAll(".chart-stats-axis-title")
        .data(["Fainter stars","Brighter stars"])
        .enter().append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", (d,i) => width * (i === 0 ? 0.075 : 0.925) )
        .attr("y", 18)
        .style("text-anchor", "middle")
        .text(d => d)

    x_axis.append("text")
        .attr("class", "chart-stats-axis-note")
        .attr("x", width/2)
        .attr("y", 18)
        .style("text-anchor", "middle")
        .text("← how bright the star appears to us on Earth →")

    //Add y title
    y_axis.append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", -20)
        .attr("y", 10)
        .attr("text-anchor","start")
        .text("No. of")
    y_axis.append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", -20)
        .attr("y", 22)
        .attr("text-anchor","start")
        .text("constellations")

    ////////////// Add annotations //////////////

    const annotationData = [
        {
            className: "orion-note",
            note: {
                title: "Orion's belt",
                label: "The 3 stars that make up 'Orion's belt' are used in a constellation across most cultures. Some even more than once per culture", 
                wrap: 200 
            },
            data: {mag: 1.95, constellations: 32.3},
            type: d3.annotationCalloutCircle,
            dy: -1,
            dx: 80,
            subject: {
                radius: 45,
                radiusPadding: 5
            }
        },
        {
            className: "orion-note",
            note: {
                label: "Betelgeuse and Rigel, Orion's two bright corner stars", 
                wrap: 180,
                padding: 0
            },
            data: {mag: 0.315, constellations: 17.5},
            type: d3.annotationCalloutCircle,
            dy: -60,
            dx: 40,
            subject: {
                radius: 28,
                radiusPadding: 5
            }
        },
        // {
        //     className: "Aldebaran-note circle-hide",
        //     note: {
        //         label: "Aldebaran",
        //         padding: 0
        //     },
        //     data: {mag: 0.87, constellations: 23},
        //     type: d3.annotationCalloutCircle,
        //     dy: -20,
        //     dx: 20,
        //     subject: {
        //         radius: 8,
        //         radiusPadding: 0
        //     }
        // },
        {
            className: "Dubhe-note circle-hide",
            note: {
                label: "Dubhe",
                padding: 0
            },
            data: {mag: 1.81, constellations: 20},
            type: d3.annotationCalloutCircle,
            dy: -15,
            dx: 15,
            subject: {
                radius: 8,
                radiusPadding: 0
            }
        },
        {
            className: "sirius-note circle-hide",
            note: {
                title: "Sirius",
                label: "The brightest star isn't used in constellations often; perhaps it needed brighter companion stars",
                wrap: 160 
            },
            data: {mag: -1.44, constellations: 12.05},
            type: d3.annotationCalloutCircle,
            dy: -20,
            dx: 30,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {
                title: "Pleiades",
                label: "These 9 tightly packed stars are used in constellations more often than expected for their brightness. Most likely due to their ease of recognition", 
                wrap: 230 
            },
            data: {mag: 2.85, constellations: 19},
            type: d3.annotationCalloutCircle,
            dy: -75,
            dx: -40,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.76, constellations: 8},
            type: d3.annotationCalloutCircle,
            dy: -208,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.45, constellations: 8},
            type: d3.annotationCalloutCircle,
            dy: -208,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.05, constellations: 7},
            type: d3.annotationCalloutCircle,
            dy: -221,
            dx: -15,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 3.87, constellations: 9},
            type: d3.annotationCalloutCircle,
            dy: -195,
            dx: -80,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 4.3, constellations: 18},
            type: d3.annotationCalloutCircle,
            dy: -81,
            dx: -15,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 4.14, constellations: 20},
            type: d3.annotationCalloutCircle,
            dy: -55,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },

        {
            className: "pleiades-note",
            note: {label: ""},
            data: {mag: 3.67, constellations: 22},
            type: d3.annotationCalloutCircle,
            dy: -30,
            dx: -20,
            subject: {
                radius: 15,
                radiusPadding: 4
            }
        },
    ]

    //Set-up the annotation
    const makeAnnotations = d3.annotation()
        // .editMode(true)
        .accessors({
            x: d => x_scale(d.mag),
            y: d => y_scale(d.constellations)
        })
        .notePadding(3)
        .annotations(annotationData)

    //Create the annotation
    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)

    ////////////// Add hover star section //////////////

    let hover_star_group = svg.append("g")
        .attr("class", "hover-star-group")
        .style("pointer-events","none")
        // .style("opacity", 0)

    let hover_star = hover_star_group.append("circle")
        .attr("id", "hover-star")

    let hover_star_marker = hover_star_group.append("circle")
        .attr("id", "hover-star-marker")

}//function createStatChartStars