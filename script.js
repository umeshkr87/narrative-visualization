
const widthTotal = 600;
const heightTotal = 550;
const margin = {top: 100, right: 50, bottom: 25, left: 75};
const width = widthTotal - margin.right - margin.left;
const height = heightTotal - margin.top - margin.bottom;
const colors = ['#1f77b4','#ff7f0e','#d62728','#9467bd'];

// Declare svg related params 
let svg;
let data;
let xScale;
let yScale;

function filterRow(d) {
    if (d.Code !== "USA" && d.Code !== "CHN" && d.Code !== "OWID_WRL" && d.Code !== "GMB")
        return;
    let newRow = {}
    // Entity, Code, Year, Meat
    newRow.Entity = +d.Entity;
    newRow.Code = +d.Code;
    newRow.Year = +d.Year;
    newRow.Meat = +d.Meat;
    // if (newRow.Code === "USA")
    // console.log('JSON Stringify: ' + JSON.stringify(newRow));
    return newRow;
}

// svg = d3.select("#chart").append("svg");
async function initScene1() {
    
    try {
    
    // Create SVG element
    svg = d3.select("#chart")//.append("svg")
    .select("svg")
    .append("g")
    .attr("width", width)
    .attr("height",height)
    .attr("transform","translate("+margin.left+","+margin.top+")");

    svg.append("g")
            .attr("width", width)
            .attr("height", height);

    // Create group inside SVG
    g = svg.append("g")
     .attr("transform", `translate(${margin.left}, ${margin.top})`);

    data = await d3.csv('./data/meat-supply-per-person.csv');
    // console.log("Original Data Length: " + data.length);
    
    data = data.filter(filterRow);
    // console.log(" Filtered data: " + JSON.stringify(data));

    // Add scales
    xScale = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Year; }))
    .range([0, width]);

    yScale = d3.scaleLinear()
    .domain([0, 130])
    .range([height, 0]);

    // Add axes
    xAxis = svg.append("g")
                    .attr("transform","translate(0,"+height+")")
                    .call(d3.axisBottom(xScale).tickFormat(d3.format('.0f')));

    yAxis = svg.append("g")
    .call(d3.axisLeft(yScale));
    
    // Line Generator
    let lineGenerator = d3.line()
    .x(function(d) { 
        return xScale(d.Year);})
    .y(function(d) { 
        return yScale(d.Meat);})
    .curve(d3.curveMonotoneX)

    let nestedData = d3.nest()
    .key(function(d) {return d.Entity;})
    .entries(data);
    
    // console.log("Nested Data: " + JSON.stringify(nestedData));
    
    let lines = svg.append("g");

    lines.selectAll(".line")
            .data(nestedData)
            .enter()
            .append("g")
            .append("path")
            .attr("class", "line")
            .attr("d", function(d,i) {
            return lineGenerator(d.values);
            })
            .style("fill","none")
            .style("stroke", function(d,i) {
            return colors[i];
            })
            .style("opacity", .9)
            .style("stroke-width",2)
            .on("mouseover", function(d, i) {
            d3.select(this).style("stroke-width", 4)
            })
            .on("mouseout", function(d, i) {
            d3.select(this).style("stroke-width", 2)
            });


    lines.selectAll(".labels")
            .data(nestedData)
            .enter()
            .append("g")
            .append("text")
            .attr("x", function(d, i) {
            let horiz = d.values[d.values.length-1]["Year"];
            return xScale(horiz) + 5;
            })
            .attr("y", function(d, i) {
            let vert = d.values[d.values.length-1]["Meat"];
            return yScale(vert) + 10;
            })
            .attr("font-size", "15px")
            .text(function(d,i) {
            return(d.key);
            })
            .style("fill", function(d,i) {
            return colors[i];
            })
        .attr("opacity", 1);

    
        // Add x-axis label
        lines.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .text("Year");

        // Add y-axis label
        lines.append("text")
        .attr("class", "axis-label")
        .attr("x", -0.75 * height)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Meat Consumption Per Capita in Kilograms");

    const annotations = [
        {
        note: {
            label: "15X meat consumption increased with economic growth capared to 60's",
            title: ""
        },
        type: d3.annotationCalloutCircle,
        subject: {
            radius: 20,     
            radiusPadding: 0
        },
        color: ["grey"],
        x: 475,
        y: 335,
        dy: -80,
        dx: 80
        }
    ]

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
    .annotations(annotations)
    d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)

    } catch (error) {
        console.log('Error: ' + error);
    }
}

let selectedYear;

const countryContinent = new Map();
function filterRowForScene2(d) {
    
    if (d.Continent != '') {
        countryContinent.set(d.Entity, d.Continent);
    }
        
    if (selectedYear == d.Year && d.GDPPerCapita > 0 && d.MeatQty > 0 && d.Code !== '') {
        let dataRow = {}
    // Entity, Code, Year, Meat
        dataRow.Entity = d.Entity;
        dataRow.Code = d.Code;
        dataRow.Year = d.Year;
        dataRow.MeatQty = d.MeatQty;
        dataRow.GDPPerCapita = d.GDPPerCapita;
        dataRow.Continent = d.Continent;
        // if (dataRow.Code === "USA")
        //     console.log('JSON Stringify: ' + JSON.stringify(d));
        return dataRow;
    }
}

async function initScene2(year) {

    selectedYear = year;
    // console.log('Year: ' + year);
    try {
        
        // Create SVG element
        svg = d3.select("#chart")
        .select("svg")
        .append("g")
        .attr("width", width+margin.left+margin.right)
        .attr("height",height+margin.top+margin.bottom+80)
        .attr("transform","translate("+margin.left+","+margin.top+")");
       
        data = await d3.csv('./data/meat-consumption-vs-gdp-per-capita.csv');
        // console.log("Original Data Length: " + data.length);
        
        data = data.filter(filterRowForScene2);
        // console.log("Filtered row size " + data.length);
        // console.log("Continent: " + data.Continent);
    
        // Add scales
        xScale = d3.scaleLinear()
        .domain([1000, 60000])
        .range([0, width]);

        yScale = d3.scaleLinear()
        .domain([0, 140])
        .range([height, 0]);
    
        // Add Axes
        xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(5));

        yAxis = svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5));
        
        // console.log('country:continent' + JSON.stringify(countryContinent));

        var colors = d3.scaleOrdinal()
                        .domain(['Asia', 'Africa', 'Europe', 'North America', 'Oceania', 'South America'])
                        .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']);
        
        var legend = d3.legendColor()
                        .scale(colors);

        svg.append("g")
        .attr("transform", "translate(500,300)")
        .call(legend);
                    

        var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        // Create circles for each data point
        svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.GDPPerCapita); })
        .attr("cy", function(d) { return yScale(d.MeatQty); })
        .attr("r", 4)
        .style("fill", function (d) {
                return colors(countryContinent.get(d.Entity));
            })
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                    .duration('100')
                    .attr("r", 7);
            div.transition()
                    .duration(100)
                    .style("opacity", 1);
            div .html(
                "<b>Country:</b>&emsp;"+d.Entity+"<br/><b>Continent:</b>&emsp;"+
                countryContinent.get(d.Entity) +
                "<br/><b>Meat consumed per capita per year:</b>&emsp;" + d3.format(".2f") (d.MeatQty)+" kg<br/><b>GDP per capita:</b>&emsp;$"
                    + d3.format(".2f")(d.GDPPerCapita))
            .style("background",  colors(countryContinent.get(d.Entity)))
            .style("left", "100px")             
            .style("top", "600px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('200')
                .attr("r", 4);
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
        });

        // Add x-axis label
        svg.append('g').append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .text("GDP Per Capita in USD");

        // Add y-axis label
        svg.append('g').append("text")
        .attr("class", "axis-label")
        .attr("x", -0.75 * height)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Meat Consumption in Kilograms");

    } catch (error) {
        console.log('Error: ' + error);
    }
}

function updateSlider(value) {
    document.getElementById('rangeValue').innerHTML = value;
    d3.selectAll("circle").remove();
    // console.log('Removed chart ');
    initScene2(value);
    // console.log('After calling initScene2');
}

let pieData = [];
let filteredPieData = [];

let selctedCountry;
function filterPieChartData(d) {
    // console.log('In filter SELECTEDCOUNTRY: ' + selctedCountry);
    if (d.Year !== 2020 && d.Entity !== selctedCountry) {
        return;
    }
    // Entity,Code,Year,MeatPoultry,MeatBeef,MeatSheepAndGoat,MeatPig,MeatOther,FishAndSeafood
    pieData = [   {label: 'Beef', value: d.MeatBeef},
        {label: 'Sheep and Goat', value: d.MeatSheepAndGoat},
        {label: 'Pig Meat', value: d.MeatPig},
        {label: 'Fish and Seafood', value: d.MeatOther},
        {label: 'Poultry', value: d.MeatPoultry},
        {label: 'Other Meat', value: d.FishAndSeafood}
    ];
    
    // if (d.Code === 'USA' || d.Code === 'JPN')
    // console.log('JSON Stringify: ' + JSON.stringify(pieData) + ' ' + d.Entity);
}



async function initScene3(country) {
    selctedCountry = country;
    // console.log('Country Name: ' + country);
    var width = 530;
    var height = 530;
    var radius = Math.min(width, height) / 3;
    var donutWidth = 75; //This is the size of the in the pie

    var colors = d3.scaleOrdinal()
            .domain(['Beef', 'Sheep and Goat', 'Pig Meat', 'Fish and Seafood', 'Poultry', 'Other Meat'])
            .range(['#d62728', '#ff7f0e', '#1f77b4', '#2ca02c', '#9467bd', '#8c564b']);
    
    var data = await d3.csv('./data/per-capita-meat-type.csv');
    // console.log('Original data length ' + data.length);
    data.filter(filterPieChartData);
    // console.log('Filtered data length ' + JSON.stringify(pieData));
    var svg = d3.select('#chart')
     .append('svg')
     .attr('width', width)
     .attr('height', height)
     .append('g')
     .attr('transform', 'translate(' + (width / 3) + ',' + (height / 3) + ')');
    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);
    var pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);
    var path = svg.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return colors(d.data.label);
        })
        .attr('transform', 'translate(' + 75 + ',' + 75 + ')');

    var legendRectSize = 10;
    var legendSpacing = 7;
    var legend = svg.selectAll('.legend') //the legend and placement
    .data(colors.domain())
    .enter()
    .append('g')
    .attr('class', 'circle-legend')
    .attr('transform', function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = height * colors.domain().length / 2;
        var horz = -2 * legendRectSize + 40;
        var vert = i * height - offset + 80;
        return 'translate(' + horz + ',' + vert + ')';
    });
    legend.append('circle')
    .style('fill', colors)
    .style('stroke', colors)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', '.4rem');
    legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function (d) {
        return d;
    });

    var pietooltip = d3.select('#chart')                              
          .append('div')                                              
          .attr('class', 'pietooltip');  

          pietooltip.append('div')                                           
          .attr('class', 'label');                                      
             
          pietooltip.append('div')                                          
          .attr('class', 'value');

    var totalConsumption = 0;
    pieData.forEach(d => totalConsumption = parseFloat(totalConsumption) + parseFloat(d.value));
    // console.log('totalConsumption: ' + totalConsumption);

    path.on('mouseover', function(d) {                                     
        pietooltip.select('.label').html("Total: " + d3.format('.2f') (totalConsumption)+" kg<br>"+d.data.label+": ");                
        pietooltip.select('.value').html(d3.format('.2f') (d.value) +" kg");
        pietooltip.style('display', 'block')                  
      });                                                           
      
      path.on('mouseout', function() {                             
        pietooltip.style('display', 'none');                           
      }); 
      path.on('mousemove', function(d) {                            
        pietooltip.style('top', (d3.event.pageY) + 'px')          
          .style('left', (d3.event.pageX) + 'px');             
      }); 
    
}

// <div>
    //  <button id="everyone">Everyone surveyed</button>
    //  <button id="women">Only women surveyed</button>
    //  <button id="men">Only men surveyed</button>
    // </div>



window.onload = function () {
    // console.log('In onload function')
    var select = document.getElementById("country");
    var countries = ['Afghanistan', 'Albania', 'Algeria', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', "Cote d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia and Montenegro', 'Sierra Leone', 'Slovakia', 'Slovenia', 'Solomon Islands', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Suriname', 'Sweden', 'Switzerland', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'World','Yemen', 'Zambia', 'Zimbabwe'];
    for(var i = 0; i < 168 ; ++i) {
        var option = document.createElement('option');
        option.text = option.value = countries[167-i];
        select.add(option, 0);
    }
    initScene3('United States');
};

function updatePieChart() {
    d3.selectAll('svg').remove();
    d3.select('pietooltip').remove();
    var country = document.getElementById("country").value;
    // console.log('Country selected: ' + country);
    initScene3(country);
}