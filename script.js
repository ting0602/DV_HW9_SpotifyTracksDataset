// Set up SVG dimensions and margins
var svg_width = 1300
var svg_height = 800
var margin = { top: 100, right: 200, bottom: 350, left: 150 };
var width = svg_width - margin.left - margin.right;
var height = svg_height - margin.top - margin.bottom;

// Initial configuration variables
var bar_width = 15
var grouping = "track_name"
var selected_group = "";
var descending = true;

// Initial filtering criteria
var popularity_upper = 100;
var popularity_lower = 20;
var data_upper = 100;
var data_lower = 0;
var data_overflow = false

// Initialize variables to track min and max tempo
var minTempo = Infinity;
var maxTempo = -Infinity;

// Features to show on the chart
const showFeature = ["popularity","danceability", "energy", "speechiness", "acousticness", "liveness", "valence", "tempo"];

// Color scale for button colors
const btnColorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(showFeature)

// HTML elements and their initial states
const groupingSelector = document.getElementById('grouping');
const sortingSelector = document.getElementById('sorting');
const widthSlider = document.getElementById("width-slider");
const popularitySelector = document.getElementById('popularityRange');
var isPopularityOn = popularitySelector.checked;
const dataSelector = document.getElementById('dataRange');
var isDataOn = dataSelector.checked;
const lowerThumb = document.getElementById('popularity-slider-lower');
const upperThumb = document.getElementById('popularity-slider-upper');
const minRange = document.getElementById('min-value');
const maxRange = document.getElementById('max-value');
const dataLowerThumb = document.getElementById('data-slider-lower');
const dataUpperThumb = document.getElementById('data-slider-upper');
const minDataInput = document.getElementById("min-data");
const maxDataInput = document.getElementById("max-data");

// Initial value for the bar width slider
widthSlider.value = bar_width;
minRange.textContent = "(20)";
maxRange.textContent = "(100)";

// Load data
d3.csv("http://vis.lab.djosix.com:2023/data/spotify_tracks.csv").then(function(data) {
        // Merge data based on track_id    
        const mergedData = Object.values(
        data.reduce((acc, curr) => {
            const key = curr.track_id;

            // Update min and max tempo
            const tempo = +curr.tempo;
            if (tempo < minTempo) {
                if (tempo != 0) {
                    minTempo = tempo;
                }
            }
            if (tempo > maxTempo) {
                maxTempo = tempo;
            }

            if (!acc[key]) {
                acc[key] = { ...curr };
                acc[key].track_genre = [curr.track_genre];
            } else {
                acc[key].track_genre.push(curr.track_genre);
            }
        
            return acc;
        }, {})
    );

    // Event listeners
    // Grouping selector
    groupingSelector.addEventListener('change', function() {
        grouping = groupingSelector.value
        updateBar() 
    });

    // Sorting selector
    sortingSelector.addEventListener('change', function() {
        var value = sortingSelector.value
        if (value == "descending") {
            descending = true
        } else {
            descending = false
        }
        updateBar() 
    });

    // Popularity range selector
    popularitySelector.addEventListener('change', function() {
        isPopularityOn = popularitySelector.checked;
        updateBar() 
    });

    // Data range selector
    dataSelector.addEventListener('change', function() {
        isDataOn = dataSelector.checked;
        updateBar() 
    });

    // Bar width slider
    widthSlider.addEventListener("input", function() {
        bar_width = +widthSlider.value;
        updateBar() 
    });


    // Popularity range sliders
    lowerThumb.addEventListener('input', function() {
        updateRange(lowerThumb.value, upperThumb.value);
    });

    upperThumb.addEventListener('input', function() {
        updateRange(lowerThumb.value, upperThumb.value);
    });


    // Data range inputs
    minDataInput.addEventListener('input', function() {
        updateDataRange(+minDataInput.value, +maxDataInput.value);
    });
    
    maxDataInput.addEventListener('input', function() {
        updateDataRange(+minDataInput.value, +maxDataInput.value);
    });


    function updateRange(lowerValue, upperValue) {
        // Update UI with the provided range values
        minRange.textContent = `(${lowerValue})`;
        maxRange.textContent = `(${upperValue})`;

        // Set global variables within valid bounds based on user input
        popularity_lower = Math.min(+lowerValue, +upperValue);
        popularity_upper = Math.max(+lowerValue, +upperValue);

        // Trigger chart update if popularity filtering is enabled
        if (isPopularityOn) {
            updateBar();
        }

    }

    function updateDataRange(lowerValue, upperValue) {
        // Ensure valid bounds for the data range
        min_value = Math.max(Math.min(+lowerValue, +upperValue), 0)
        max_value = Math.min(Math.max(+lowerValue, +upperValue), 89740)
        // Set global variables based on user input
        data_lower = min_value;
        data_upper = max_value;

        // Trigger chart update if data filtering is enabled
        if (isDataOn) {
            updateBar();
        }

        // Update corresponding input values on the UI
        if (lowerValue >= 0 && lowerValue <= 89740 && upperValue >= 0 && upperValue <= 89740) {
            minDataInput.value = lowerValue
            maxDataInput.value = upperValue
        } else {
            minDataInput.value = min_value
            maxDataInput.value = max_value
        }
    }

    // Initial update
    updateBar() 


    /*** Functions ***/
    // Updates the bar chart based on user-selected filters and options.
    function updateBar() {
        var filter_data = mergedData

        // Apply data range filtering if enabled
        if (isDataOn) {
            filter_data = filter_data.slice(data_lower, data_upper);
        }

        // Apply popularity range filtering if enabled
        if (isPopularityOn) {
            filter_data = filter_data.filter(d => +d.popularity >= popularity_lower && +d.popularity <= popularity_upper);
        }

        // Sort the filtered data by popularity in descending order
        filter_data = filter_data.sort((a, b) => d3.descending(a.popularity, b.popularity))
       
        // Handle data overflow and limit the displayed data points
        if (filter_data.length > 500) {
            data_overflow = true
            if (descending) {
                filter_data = filter_data.slice(0, 500)
            } else {
                filter_data = filter_data.slice(-500)
            }
        } else {
            data_overflow = false
        }

        // Initialize SVG size
        d3.select("svg").remove();

        // Group data based on selected grouping option
        var averagePopularityData = ""
        if (grouping === "album_name") {
            averagePopularityData = d3.rollup(
                filter_data,
                group => ({
                    popularity: d3.mean(group, d => +d.popularity).toFixed(1),
                    count: group.length,
                }),
                d => d.album_name
            );
            selected_group = d3.group(filter_data, (d) => d.album_name);

        } else if (grouping === "track_name") {
            averagePopularityData = d3.rollup(
                filter_data,
                group => ({
                    popularity: d3.mean(group, d => +d.popularity).toFixed(1),
                    count: group.length,
                }),
                d => d.track_name
            );
            selected_group = d3.group(filter_data, (d) => d.track_name);
        } else if (grouping === "artists") {
            averagePopularityData = d3.rollup(
                filter_data,
                group => ({
                    popularity: d3.mean(group, d => +d.popularity).toFixed(1),
                    count: group.length,
                }),
                d => d.artists
            );
            selected_group = d3.group(filter_data, (d) => d.artists);
        }

        var selected_data = averagePopularityData

        // Calculate maximum count
        const maxCount = d3.max(Array.from(selected_data.values()), d => d.count);

        // Initialize color scale based on data count
        var colorScale = d3.scaleSequential((t) => d3.rgb(155, 173, 255).darker(t))
            .domain([1, maxCount]);

        // Sorting data by avg popularity
        const sortedData = Array.from(selected_data.entries()).sort((a, b) => b[1].popularity - a[1].popularity);
        
        // Calculate maximum popularity for y-axis scale
        const maxAveragePopularity = d3.max(Array.from(selected_data.values()), d => +d.popularity);

        var chart_width = Math.max(sortedData.length * bar_width, width)
        
        // Init SVG
        const svg = d3.select("body")
            .append("svg")
            .attr("width", chart_width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Display hint based on conditions
        var hintHtml = ""
        if (data_overflow) {
            hintHtml = "<b>Due to the large number of data, only the first 500 data are displayed. (sorting by popularity)<br>It is recommended to modify the range options.</b>"
        }
        if (filter_data.length == 0) {
            hintHtml = "<b>No data meets the restrictions.<br>It is recommended to modify the range options.</b>"
        }
        
        const hintText = svg.append("foreignObject")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("width", chart_width)
            .attr("height", 40)
            .append("xhtml:div")
            .style("height", "20px")
            .html(hintHtml);

        // Create a group for bars
        const barGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .style("width", chart_width);

        // Create x-axis scale based on data ordering
        var xScale
        if (descending) {
            xScale = d3.scaleBand()
                .domain(sortedData.map(d => d[0]))
                .range([0, chart_width])
                .padding(0.1);
        } else {
            xScale = d3.scaleBand()
                .domain(sortedData.map(d => d[0]))
                .range([chart_width, 0])
                .padding(0.1);
        }

        // Create y-axis scale based on maximum popularity
        const yScale = d3.scaleLinear()
            .domain([-1, maxAveragePopularity])
            .range([height, 0]);

        // Draw bars with transition effect
        barGroup.selectAll(".bar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1].popularity))
            // .attr("y",  height)
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[1].popularity))
            // .attr("height", 0)
            .attr("fill", d => colorScale(d[1].count))
            .style("opacity", 0)
            .on("click", (event, d) => showPopup(d))
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5);

                showTooltip(d);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                hideTooltip();
            })
            .transition()
            .duration(500)
            .style("opacity", 1);
            // .attr("y", d => yScale(d[1].popularity))
            // .attr("height", d => height - yScale(d[1].popularity));
            
        // Draw x and y-axis
        barGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        barGroup.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale)
            .ticks(10)
            .tickFormat(d => d >= 0 ? d : "")
        );


        // Draw legend
        const legendContainer = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${(margin.left/2) }, ${margin.top})`)

        var ticks_num = colorScale.ticks(Math.min(maxCount, 15))

        // Legend rect
        const legendRects = legendContainer.selectAll("rect")
            .data(ticks_num.filter(d => Number.isInteger(+d)))
            .enter()
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("y", (d, i) => i * 16)
            .style("fill", d => colorScale(d));

        // Legend text
        const legendTexts = legendContainer.selectAll("text")
            .data(ticks_num.filter(d => Number.isInteger(+d)))
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 16 + 12)
            .text(d => d)
            .style("font-size", "12px");

    }

    // Displays a popup with detailed information when a bar is clicked.
    function showPopup(data) {
        // Create a window
        d3.select(".popup").remove();
        const popup = d3.select("body").append("div")
            .attr("class", "popup")
            .style("position", "fixed")
            .style("top", "0")  // 設置 margin-top 為 300px
            .style("left", "0")
            .style("width", "100%")
            .style("height", "100%")
            .style("background-color", "rgba(255, 255, 255, 0.9)")
            .style("display", "flex")
            .style("flex-direction", "column") 
            .style("padding", "20px")
            .style("overflow-y", "auto");
    
        // Button to close the popup
        const closeButton = popup.append("button")
            .attr("class", "popup-close btn btn-danger")
            .style("align-self", "flex-end")
            .text("✖")
            .on("click", function () {
                // Remove the popup
                d3.select(this.parentNode).remove();
            });
    
        const info_data = selected_group.get(data[0])
    
        // Add buttons to toggle the visibility of the chart areas
        const buttonsContainer = popup.append("div")
            .attr("class", "buttons-container")
            .style("display", "flex")
            .style("flex-wrap", "wrap");
    
        const toggleButtons = buttonsContainer.selectAll(".toggle-button")
            .data(info_data)
            .enter()
            .append("button")
            .attr("class", "toggle-button btn btn-primary btn-sm")
            .attr("data-bs-toggle", "collapse")
            .attr("data-bs-target", d => `#chartArea-${d.track_id}`)
            .text(d => `${d.track_name} (${d.popularity})`)
            .style("width", "150px")
            .style("margin", "5px");
    
        // Add click event handling
        toggleButtons.on("click", function () {
            // Toggle the "active" class
            d3.select(this).classed("active", !d3.select(this).classed("active"));
        });
    
        // Create chart areas within the popup for each item in info_data
        const chartAreas = popup.selectAll(".chart-area")
            .data(info_data)
            .enter()
            .append("div")
            .attr("class", "chart-area collapse")
            .attr("id", d => `chartArea-${d.track_id}`)
            .style("margin-top", "25px")
            .style("background-color", "rgb(233, 236, 239)")
            .each(function(d) {
            // Create a container for the chart
            const chartContainer = d3.select(this).append("div")
                .attr("class", "chart-container")
                .text(d => d.track_name)
                .html(d => `<b>${d.track_name}</b><br>Album: ${d.album_name}<br>Artist(s): ${d.artists}<br>`)
                .style("padding", "20px");

            // Add a button to open the track link on Spotify
            chartContainer.append("div")
                .attr("class", "btn btn-danger btn-sm rounded-circle m-2")
                .text("▶︎")
                .on("click", function() {
                    // Set the link to be opened
                    const trackLink = `https://open.spotify.com/track/${d.track_id}`;
                    window.open(trackLink, '_blank');
                });
            
            // Add information about the track
            chartContainer.append("div")
                .style("font-size", "14px")
                .html(function(d) {
                    const totalSeconds = Math.floor(+d["duration_ms"] / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    if (+d["mode"] == 1) {
                        return `● Mode: Major<br>● Track length: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}<br>● Time signature: ${d["time_signature"]}<br>● Genre: ${d["track_genre"]}`;
                    }
            
                    return `● Mode: Minor<br>● Track length: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}<br>● Time signature: ${d["time_signature"]}<br>● Genre: ${d["track_genre"]}`;
                });
            
            // Add progress bars for each feature
            const progressBars = chartContainer.selectAll(".progress")
                .data(showFeature)
                .enter()
                .append("div")
                .attr("class", "progress");
                
            progressBars.append("div")
                .attr("class", "progress-bar")
                .attr("role", "progressbar")
                .style("width", "0%")
                .style("background-color",  feature => btnColorScale(feature))
                .attr("aria-valuenow", function(feature) {
                    if (feature == "popularity") {
                        return d[feature]
                    } else if (feature == "tempo") {
                        return ((d[feature] - minTempo) / maxTempo) * 100
                    } else {
                        return d[feature] * 100
                    }
                })
                .attr("aria-valuemin", "0")
                .attr("aria-valuemax", "100")
                .style("margin", "3px")
                .style("font-size", "8px")
                .text(function(feature) {
                    if (feature == "popularity") {
                        return `${d[feature]}%`
                    } else if (feature == "tempo") {
                        return `${(((d[feature] - minTempo) / maxTempo) * 100).toFixed(1)}%`
                    } else {
                        return `${(d[feature] * 100).toFixed(1)}%`
                    }
                })

            $(this)
            .on("shown.bs.collapse", function () {
                // Execute animation when expanded
                progressBars.select(".progress-bar")
                    .transition()
                    .duration(500)
                    .style("width", function(feature) {
                        if (feature == "popularity") {
                            return `${d[feature]}%`
                        } else if (feature == "tempo") {
                            return `${(((d[feature] - minTempo) / maxTempo) * 100).toFixed(1)}%`
                        } else {
                            return `${d[feature] * 100}%`
                        }
                    });
            });

            progressBars.append("div")
                .attr("class", "progress-text")
                .style("width", "200px") 
                .text(function(feature) {
                    if ((d[feature] * 100) < 1) {
                        if (feature == "tempo" && d[feature] == 0) {
                            return `${feature} (None)`
                        }
                        return `${feature} (${d[feature]}%)`
                    }
                    return `${feature}`
                });

        });
    }   

    // Show Tooltip
    function showTooltip(d) {
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200)
            .style("opacity", 1) // Fade in
        var context = selected_group.get(d[0])
        var tooltipHTML = `<b>Class: ${d[0]}<br>Avg Popularity: ${(d[1].popularity)}<br></b>`

        for (let i = 0; i < Math.min(context.length, 5); i++) {
            tooltipHTML += `● ${context[i].track_name} - Popularity: ${context[i].popularity}<br>`;
        }

        // If there are more than five items, add a message
        if (context.length > 5) {
            const remainingItems = context.length - 5;
            tooltipHTML += `<b><i>Click to view ${remainingItems} more items</i></b>`;
        }
        tooltip.html(tooltipHTML);
    }
    // Hide Tooltip
    function hideTooltip() {
        d3.select("#tooltip").transition().duration(500).style("opacity", 0) // Fade out
    }
}).catch(error => {
    console.error("Error loading data:", error);
});
