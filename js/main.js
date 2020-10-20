///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Constants ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

let sf //Scale factor of canvas
let pixel_ratio
const font_family = "Glass Antiqua"

const pi1_2 = Math.PI / 2
const pi = Math.PI
const pi2 = Math.PI * 2
const ecliptic_angle = 23.44 //The angle the tilted Earth makes with the plane or rotation around the Sun, in degrees

const basemap_margin = {
    left: 50,
    top: 50,
    right: 50,
    bottom: 50
}
const basemap_size = 800
const basemap_total_size = basemap_size + basemap_margin.left + basemap_margin.right
const size_factor = basemap_size / basemap_total_size

const orion_m = 20
const orion_size = 920
let current_orion_map = "Betelgeuse"

///////////// Culture data /////////////

//All cultures and their colors
const cultures = []
cultures["arabic"] = {culture: "arabic", color: "#EFB605", count: 49, mean_stars: 10.96}
cultures["arabic_moon_stations"] = {culture: "arabic_moon_stations", color: "#EBAF02", count: 28, mean_stars: 3.43}
cultures["aztec"] = {culture: "aztec", color: "#E8A400", count: 5, mean_stars: 8.4}
cultures["belarusian"] = {culture: "belarusian", color: "#E69201", count: 20, mean_stars: 5.95}
cultures["boorong"] = {culture: "boorong", color: "#E47607", count: 28, mean_stars: 7.93}
cultures["chinese"] = {culture: "chinese", color: "#E45311", count: 318, mean_stars: 4.46}
cultures["dakota"] = {culture: "dakota", color: "#E3301C", count: 13, mean_stars: 8.39}
cultures["egyptian"] = {culture: "egyptian", color: "#DF1428", count: 28, mean_stars: 9}
cultures["hawaiian_starlines"] = {culture: "hawaiian_starlines", color: "#D80533", count: 13, mean_stars: 6.85}
cultures["indian"] = {culture: "indian", color: "#CE003D", count: 28, mean_stars: 2.68}
cultures["inuit"] = {culture: "inuit", color: "#C30048", count: 11, mean_stars: 3.73}
cultures["japanese_moon_stations"] = {culture: "japanese_moon_stations", color: "#B80452", count: 28, mean_stars: 4.79}
cultures["kamilaroi"] = {culture: "kamilaroi", color: "#AC0C5E", count: 13, mean_stars: 1}
cultures["korean"] = {culture: "korean", color: "#9F166A", count: 272, mean_stars: 4.46}
cultures["macedonian"] = {culture: "macedonian", color: "#932278", count: 19, mean_stars: 3.95}
cultures["maori"] = {culture: "maori", color: "#852F87", count: 6, mean_stars: 5.33}
cultures["mongolian"] = {culture: "mongolian", color: "#763C95", count: 4, mean_stars: 6.25}
cultures["navajo"] = {culture: "navajo", color: "#644AA0", count: 8, mean_stars: 15.75}
cultures["norse"] = {culture: "norse", color: "#4F56A6", count: 6, mean_stars: 5.83}
cultures["ojibwe"] = {culture: "ojibwe", color: "#3963A7", count: 10, mean_stars: 9.6}
cultures["romanian"] = {culture: "romanian", color: "#2570A2", count: 39, mean_stars: 9.41}
cultures["sami"] = {culture: "sami", color: "#148097", count: 10, mean_stars: 3.3}
cultures["sardinian"] = {culture: "sardinian", color: "#0A9087", count: 11, mean_stars: 6.45}
cultures["siberian"] = {culture: "siberian", color: "#099E77", count: 3, mean_stars: 6.67}
cultures["tongan"] = {culture: "tongan", color: "#17AA69", count: 11, mean_stars: 4.27}
cultures["tukano"] = {culture: "tukano", color: "#31B15F", count: 11, mean_stars: 16.91}
cultures["tupi"] = {culture: "tupi", color: "#55B558", count: 7, mean_stars: 21.57}
cultures["western"] = {culture: "western", color: "#7EB852", count: 88, mean_stars: 7.90}

//Create array with all culture names
let culture_names = d3.keys(cultures)
// for(culture in cultures) culture_names.push(culture)

function setupStarMaps(stars, star_by_id, const_links, const_names, const_per_star, zodiac) {

    let chosen_culture

    //Create one variable that has all the (unchangeable data)
    let opts_data = {
        stars: stars,
        star_by_id: star_by_id,
        const_links: const_links,
        const_names: const_names,
        const_per_star: const_per_star,
        zodiac: zodiac
    }

    ////////////////////////// Header sky map //////////////////////////
    let focus_header = {
        culture: "western",
        center: [0, 0],
        scale: 250,
    }

    //Add the mouseover move effect to the background image divs
    rectangularMoveEffect("header","image") 

    ////////////////////////// Orion mini circles //////////////////////////
    let focus_betelgeuse = {
        hip: 27989,
        proper: "Betelgeuse",
        title_position: "bottom-left",
        center: [5.603559, 3.20192], //ra in hours dec in degrees
        scale: 1950,
    }

    ////////////////////////// Sirius medium map //////////////////////////
    let focus_sirius = {
        hip: 32349,
        proper: "Sirius",
        title_position: "top-right",
        center: [6.752481, -21], //ra in hours dec in degrees
        scale: 2600,
    }

    //Attach click event to the correct div
    d3.select("#chart-sirius")
        .on("click", () => { smallMapClick(focus_sirius, opts_data) })

    ////////////////////////// Big Dipper medium map //////////////////////////
    let focus_big_dipper = {
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        center: [12.3, 56],
        scale: 2200,
    }

    //Attach click event to the correct div
    d3.select("#chart-big-dipper")
        .on("click", () => { smallMapClick(focus_big_dipper, opts_data) })

    ////////////////////////// Small multiple charts //////////////////////////
    createSmallMultipleLayout(opts_data, "image")

    ////////////////////////// Statistical charts //////////////////////////
    createStatChartStars("stats-stars", stars)

    ////////////////////////// Culture rectangular sky map //////////////////////////
    chosen_culture = "hawaiian_starlines"
    let focus_culture = {
        culture: chosen_culture,
        center: [0, 0],
        scale: 250,
    }

    //Set the colors on the culture divs
    setCultureDivColors(chosen_culture)

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Run all the functions //////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    function breathableConcat() {
        return breathe.chain()   // creates a breathable chain
            // .then(() => {
            //     //Create the Sky Map behind the header - no longer needed, image is loaded
            //     //The full canvas version - no longer needed, image is loaded
            //     createStraightSkyMapLayoutFullCanvas(opts_data, focus_header, window.innerWidth, 1.5, 500, "header")
            // })
            .then(() => {
                //Create Orion's big circular layout
                createCentralCircleLayout(opts_data, focus_betelgeuse, orion_m, orion_size, orion_size, "orion")
            })
            // .then(() => {
            //     //Create Sirius's medium sky map - no longer needed, final result is image
            //     createMap(opts_data, 0, 500, 500, "#chart-sirius", focus_sirius, "medium")
            // })
            // .then(() => {
            //     //Create the Big Dipper's medium sky map - no longer needed, final result is image
            //     createMap(opts_data, 0, 500, 500, "#chart-big-dipper", focus_big_dipper, "medium")
            // })
            // .then(() => {
            //     //Doesn't actually create canvases, only loads final png images now
            //     createSmallMultipleLayout(opts_data, "canvas")
            // })
            // .then(() => {
            //     //Create the scatterplot
            //     createStatChartStars("stats-stars", stars)
            // })
            .then(() => {
                //Create the general full Sky Map visual - now creates only the lines and uses that as a background image
                createStraightSkyMapLayout(opts_data, focus_culture, 650, "constellations")
                // //The full canvas version
                // createStraightSkyMapLayoutFullCanvas(opts_data, focus_culture, window.innerWidth, 1.5, 650, "constellations")
            })
    }//function breathableConcat

    setTimeout(breathableConcat,500)

}//function setupStarMaps

////////////////// Return projected coordinates //////////////////
function pixelPos(ra, dec, projection) { return projection([-ra * (360/24), dec]) }

////////////////// Get the base constellation name from the id //////////////////
function constellationCulture(s) {
    let n = s.indexOf("-")
    s = s.substring(0, n != -1 ? n : s.length)
    return s
}//function constellationCulture

////////////////// Returns the Capitalized culture of the constellation //////////////////
function constellationCultureCap(s) {
    let n = constellationCulture(s)
    //Replace _ by space
    n = n.replace(/_/g, ' ')
    //Capitalize first letter
    n = n.charAt(0).toUpperCase() + n.slice(1)
    return n
}//function constellationCultureCap

///////////////////////////////////////////////////////////////////////////
//////////////////////// General helper functions /////////////////////////
///////////////////////////////////////////////////////////////////////////

////////////////// Retina non-blurry canvas //////////////////
function crispyCanvas(canvas, ctx, total_width, total_height, offscreen, offset_x) {
    pixel_ratio = (!pixel_ratio ? getPixelRatio(ctx) : pixel_ratio)
    sf = Math.min(2, pixel_ratio) //no more than 2
    if(screen.width < 500) sf = 1 //for small devices, 1 is enough
    
    if(!offscreen) {
        canvas
            .attr("width", sf * total_width)
            .attr("height", sf * total_height)
            .style("width", total_width + "px")
            .style("height", total_height + "px")
    } else {
        canvas.width = sf * total_width
        canvas.height = sf * total_height
    }//else
    ctx.scale(sf, sf)
    if(offset_x) ctx.translate(offset_x, 0)
}//function crispyCanvas

////////////////// Find the device pixel ratio //////////////////
function getPixelRatio(ctx) {
    //From https://www.html5rocks.com/en/tutorials/canvas/hidpi/
    let devicePixelRatio = window.devicePixelRatio || 1
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1
    let ratio = devicePixelRatio / backingStoreRatio
    return ratio
}//function getPixelRatio

////////////////// Capitalize first letter of each word //////////////////
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}//toTitleCase

////////////////// Round to decimal //////////////////
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
}//function round

function roundHalf(num) { return Math.round(num*2)/2 }

////////////////// Check for number //////////////////
function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n) }