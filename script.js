document.addEventListener("DOMContentLoaded", function () {
    const dataFiles = ["data/1/WL1_clean.csv", "data/1/WL2_clean.csv", "data/1/WN_clean.csv", "data/1/WR_clean.csv"];
    const plots = ["plot1", "plot2", "plot3", "plot4"];
    const lineplots = ["plot-1", "plot-2", "plot-3", "plot-4"];

    const titles = ["WL1", "WL2", "WN", "WR"];
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svgs = [];
    const xScales = [];
    const yScales = [];
    const lines = [];
    const paths = [];
    const dots = [];
    const tooltips = [];
    const hoverAreas = [];

    // Initialize the plots
    plots.forEach((plotId, index) => {
        const svg = d3.select(`#${plotId}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add the title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 9 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "bold")
            .text(titles[index]);

        const xScale = d3.scaleLinear().domain([-0.01, 0.01]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-0.02, 0.02]).range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.CoPx))
            .y(d => yScale(d.CoPy));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        const path = svg.append("path")
            .attr("class", "line")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const dot = svg.append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .style("opacity", 0);

        const hoverArea = svg.append("circle")
            .attr("class", "hover-area")
            .attr("r", 30) // Larger radius for the hover area
            .style("opacity", 0) // Make it invisible
            .style("pointer-events", "all"); // Ensure it can trigger events

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        svgs.push(svg);
        xScales.push(xScale);
        yScales.push(yScale);
        lines.push(line);
        paths.push(path);
        dots.push(dot);
        tooltips.push(tooltip);
        hoverAreas.push(hoverArea);
    });

    // Initialize the combined plots
    lineplots.forEach((plotId, index) => {
        const svg = d3.select(`#${plotId}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add the title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 9 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "bold")
            .text(titles[index]);

        const xScale = d3.scaleLinear().domain([-0.01, 0.01]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-0.02, 0.02]).range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.CoPx))
            .y(d => yScale(d.CoPy));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        const path = svg.append("path")
            .attr("class", "line")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const dot = svg.append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .style("opacity", 0);

        const hoverArea = svg.append("circle")
            .attr("class", "hover-area")
            .attr("r", 30) // Larger radius for the hover area
            .style("opacity", 0) // Make it invisible
            .style("pointer-events", "all"); // Ensure it can trigger events

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        svgs.push(svg);
        xScales.push(xScale);
        yScales.push(yScale);
        lines.push(line);
        paths.push(path);
        dots.push(dot);
        tooltips.push(tooltip);
        hoverAreas.push(hoverArea);
    });

    // Load the data for each plot
    const dataPromises = dataFiles.map(file => d3.csv(file));

    Promise.all(dataPromises).then(datasets => {
        console.log("Datasets loaded:", datasets); // Check if datasets are loaded correctly

        // Create separate sliders for each plot
        plots.forEach((plotId, index) => {
            const slider = d3.select(`#time-slider-${index + 1}`);
            const sliderValue = d3.select(`#slider-value-${index + 1}`);

            slider.on("input", function () {
                const currentTime = +this.value;
                sliderValue.text(`${currentTime / 100}s`);

                const data = datasets[index];

                const filteredData = data.filter(d => d.time <= currentTime);
                console.log(`Filtered data for plot ${plotId}:`, filteredData); // Check the filtered data

                // Update the line path
                paths[index].datum(filteredData)
                    .attr("d", lines[index]);

                // Calculate the max time for normalization
                const maxTime = d3.max(filteredData, d => +d.time);

                // Normalize time values to [0, 1]
                const normalizedData = filteredData.map(d => ({
                    ...d,
                    normalizedTime: +d.time / maxTime
                }));

                // Apply gradient effect based on time
                paths[index].attr("stroke", "none"); // Reset stroke
                svgs[index].selectAll(".line-segment").remove(); // Remove old segments

                // Draw line segments with color based on time
                for (let i = 1; i < normalizedData.length; i++) {
                    const segmentData = [normalizedData[i - 1], normalizedData[i]];
                    const segmentTime = (normalizedData[i].normalizedTime + normalizedData[i - 1].normalizedTime) / 2;

                    // Interpolate color based on normalized time
                    const color = d3.interpolateRgb("lightblue", "darkblue")(segmentTime);

                    svgs[index].append("path")
                        .datum(segmentData)
                        .attr("class", "line-segment")
                        .attr("d", lines[index])
                        .attr("stroke", color)
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                }

                // Update the dot position
                if (filteredData.length > 0) {
                    const lastDataPoint = filteredData[filteredData.length - 1];
                    const cx = xScales[index](lastDataPoint.CoPx);
                    const cy = yScales[index](lastDataPoint.CoPy);

                    if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
                        dots[index].datum(lastDataPoint)
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .style("opacity", 1)
                            .raise();

                        // Update the hover area position
                        hoverAreas[index].datum(lastDataPoint)
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .raise();

                    } else {
                        dots[index].style("opacity", 0);
                        hoverAreas[index].style("opacity", 0);
                    }
                } else {
                    dots[index].style("opacity", 0);
                    hoverAreas[index].style("opacity", 0);
                }

                // Remove old hover lines
                svgs[index].selectAll(".hover-line").remove();

                // Add tooltips to the dots
                hoverAreas[index].on("mouseover", function (event, d) {
                        const CoPx = parseFloat(d.CoPx).toFixed(5);
                        const CoPy = parseFloat(d.CoPy).toFixed(5);
                        const displacement = parseFloat(d.displacement).toFixed(5);

                        // Show the tooltip
                        tooltips[index].style("opacity", 1)
                            .html(`CoPx: ${CoPx}<br>CoPy: ${CoPy}<br>Displacement: ${displacement}`)
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY + 10}px`);

                        // Add hover lines
                        svgs[index].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[index](d.CoPx))
                            .attr("y1", yScales[index](d.CoPy))
                            .attr("x2", xScales[index](d.CoPx))
                            .attr("y2", height)
                            .attr("stroke", "#000");

                        svgs[index].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[index](d.CoPx))
                            .attr("y1", yScales[index](d.CoPy))
                            .attr("x2", 0)
                            .attr("y2", yScales[index](d.CoPy))
                            .attr("stroke", "#000");
                    })
                    .on("mouseout", function () {
                        tooltips[index].style("opacity", 0);
                        svgs[index].selectAll(".hover-line").remove();
                    });
            });
        });

        // Create a combined slider for the final slide
        const combinedSlider = d3.select("#time-slider-combined");
        const combinedSliderValue = d3.select("#slider-value-combined");

        combinedSlider.on("input", function () {
            const currentTime = +this.value;
            combinedSliderValue.text(`${currentTime / 100}s`);
        
            lineplots.forEach((plotId, index) => {
                const data = datasets[index];
        
                const filteredData = data.filter(d => d.time <= currentTime);
                console.log(`Filtered data for plot ${plotId}:`, filteredData); // Check the filtered data
        
                // Update the line path
                paths[index + plots.length].datum(filteredData)
                    .attr("d", lines[index + plots.length]);
        
                // Calculate the max time for normalization
                const maxTime = d3.max(filteredData, d => +d.time);
        
                // Normalize time values to [0, 1]
                const normalizedData = filteredData.map(d => ({
                    ...d,
                    normalizedTime: +d.time / maxTime
                }));
        
                // Apply gradient effect based on time
                paths[index + plots.length].attr("stroke", "none"); // Reset stroke
                svgs[index + plots.length].selectAll(".line-segment").remove(); // Remove old segments
        
                // Draw line segments with color based on time
                for (let i = 1; i < normalizedData.length; i++) {
                    const segmentData = [normalizedData[i - 1], normalizedData[i]];
                    const segmentTime = (normalizedData[i].normalizedTime + normalizedData[i - 1].normalizedTime) / 2;
        
                    // Interpolate color based on normalized time
                    const color = d3.interpolateRgb("lightblue", "darkblue")(segmentTime);
        
                    svgs[index + plots.length].append("path")
                        .datum(segmentData)
                        .attr("class", "line-segment")
                        .attr("d", lines[index + plots.length])
                        .attr("stroke", color)
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                }
        
                // Update the dot position
                if (filteredData.length > 0) {
                    const lastDataPoint = filteredData[filteredData.length - 1];
                    const cx = xScales[index + plots.length](lastDataPoint.CoPx);
                    const cy = yScales[index + plots.length](lastDataPoint.CoPy);
        
                    if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
                        dots[index + plots.length].datum(lastDataPoint)
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .style("opacity", 1)
                            .raise();
        
                        // Update the hover area position
                        hoverAreas[index + plots.length].datum(lastDataPoint)
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .raise();
        
                    } else {
                        dots[index + plots.length].style("opacity", 0);
                        hoverAreas[index + plots.length].style("opacity", 0);
                    }
                } else {
                    dots[index + plots.length].style("opacity", 0);
                    hoverAreas[index + plots.length].style("opacity", 0);
                }
        
                // Remove old hover lines
                svgs[index + plots.length].selectAll(".hover-line").remove();
        
                // Add tooltips to the dots
                hoverAreas[index + plots.length].on("mouseover", function (event, d) {
                        const CoPx = parseFloat(d.CoPx).toFixed(5);
                        const CoPy = parseFloat(d.CoPy).toFixed(5);
                        const displacement = parseFloat(d.displacement).toFixed(5);
        
                        // Show the tooltip
                        tooltips[index + plots.length].style("opacity", 1)
                            .html(`CoPx: ${CoPx}<br>CoPy: ${CoPy}<br>Displacement: ${displacement}`)
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY + 10}px`);
        
                        // Add hover lines
                        svgs[index + plots.length].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[index + plots.length](d.CoPx))
                            .attr("y1", yScales[index + plots.length](d.CoPy))
                            .attr("x2", xScales[index + plots.length](d.CoPx))
                            .attr("y2", height)
                            .attr("stroke", "#000");
        
                        svgs[index + plots.length].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[index + plots.length](d.CoPx))
                            .attr("y1", yScales[index + plots.length](d.CoPy))
                            .attr("x2", 0)
                            .attr("y2", yScales[index + plots.length](d.CoPy))
                            .attr("stroke", "#000");
                    })
                    .on("mouseout", function () {
                        tooltips[index + plots.length].style("opacity", 0);
                        svgs[index + plots.length].selectAll(".hover-line").remove();
                    });
            });
        });

    
    // Resize the plots when the window is resized
    // window.addEventListener('resize', resizePlots);

    // function resizePlots() {
    //     const plots = document.querySelectorAll('.plot');
    //     plots.forEach((plot, index) => {
    //         if (xScales[index] && yScales[index]) {
    //             const width = plot.clientWidth - margin.left - margin.right;
    //             const height = plot.clientHeight - margin.top - margin.bottom;

    //             // Update the SVG element dimensions
    //             d3.select(plot).select('svg')
    //                 .attr('width', width + margin.left + margin.right)
    //                 .attr('height', height + margin.top + margin.bottom);

    //             // Update the scales and axes
    //             xScales[index].range([0, width]);
    //             yScales[index].range([height, 0]);
    //             d3.select(plot).select('.x-axis').call(d3.axisBottom(xScales[index]));
    //             d3.select(plot).select('.y-axis').call(d3.axisLeft(yScales[index]));

    //             // Update the line path
    //             const data = paths[index].datum();
    //             if (data) {
    //                 paths[index].attr("d", lines[index](data));
    //             }

    //             // Update the dot position
    //             const lastDataPoint = dots[index].datum();
    //             if (lastDataPoint) {
    //                 const cx = xScales[index](lastDataPoint.CoPx);
    //                 const cy = yScales[index](lastDataPoint.CoPy);
    //                 dots[index].attr("cx", cx).attr("cy", cy);
    //                 hoverAreas[index].attr("cx", cx).attr("cy", cy);
    //             }
    //         }
    //     });
    // }

        //get each data
        const WL1 = datasets[0];
        const WL2 = datasets[1];
        const WN = datasets[2];
        const WR = datasets[3];

        //Last column
        const WL1_work = extractLastColumn(WL1);
        const WL2_work = extractLastColumn(WL2);
        const WN_work = extractLastColumn(WN);
        const WR_work = extractLastColumn(WR);

        //Second last column
        const WL1_dis = extractSecondLast(WL1);
        const WL2_dis = extractSecondLast(WL2);
        const WN_dis = extractSecondLast(WN);
        const WR_dis = extractSecondLast(WR);

        const maxValue = Math.max(...WN_dis);

        //important numbers for setting up the bar graph
        //Let idx be a parameter for the function.
        //data.slice(0,idx), if idx is 3, it means we are plotting the
        //first three data. Using location[idx] for the x location of data from 
        //left to right. w[idx] tells us the width of each bar.
        const data = [WL1_dis,WL2_dis,WN_dis,WR_dis];
        const location = [[170], [105, 275], [85, 200, 315], [73, 161, 249, 337]];
        const w = [100,60,40,30];
        let labels = ["WL1", "WL2", "WN", "WR"];

        const slider1 = document.getElementById('time-slider-1');
        const sliderValueDisplay1 = document.getElementById('slider-value-1');
        // console.log(slider);
        // console.log(sliderValueDisplay);

        //set up the dimension of bar
        let barwidth = 400;
        let barheight = 250;
        let upperspace = 30;
        let bottomspace = 30;
        let leftspace = 40;
        let rightspace = 20;
        
    

        createBarChart(1, 0);
        createBarChart(2, 0);
        createBarChart(3, 0);
        createBarChart(4, 0);

        slider1.addEventListener('input', function () {
            const index1 = parseInt(slider1.value); // Get the current index from the slider
            sliderValueDisplay1.textContent = `${index1}s`; // Show current slider value in seconds
            // Update the bar chart with the new value from WL1[index]
            createBarChart(1, index1-1);
            //updateBarChart(WL1_dis, index1-1, maxValue);//so it moves according to slider value
          });

        const slider2 = document.getElementById('time-slider-2');
        const sliderValueDisplay2 = document.getElementById('slider-value-2');

        slider2.addEventListener('input', function () {
            const index2 = parseInt(slider2.value); // Get the current index from the slider
            sliderValueDisplay2.textContent = `${index2}s`; // Show current slider value in seconds
            //console.log(index1);
            //console.log(WL1_dis[index1-1]);

            // Update the bar chart with the new value from WL1[index]
            createBarChart(2, index2-1);
          });

        const slider3 = document.getElementById('time-slider-3');
        const sliderValueDisplay3 = document.getElementById('slider-value-3');
  
        slider3.addEventListener('input', function () {
            const index3 = parseInt(slider3.value); // Get the current index from the slider
            sliderValueDisplay3.textContent = `${index3}s`; // Show current slider value in seconds
            //console.log(index1);
            //console.log(WL1_dis[index1-1]);
  
            // Update the bar chart with the new value from WL1[index]
            createBarChart(3, index3-1);

        const slider4 = document.getElementById('time-slider-4');
        const sliderValueDisplay4 = document.getElementById('slider-value-4');
      
        slider4.addEventListener('input', function () {
            const index4 = parseInt(slider4.value); // Get the current index from the slider
            sliderValueDisplay4.textContent = `${index4}s`; // Show current slider value in seconds

      
            // Update the bar chart with the new value from WL1[index]
            createBarChart(4, index4-1);
            });
        });
  




        //choice means choosing slider, idx means oen of the 6000 values.
        function createBarChart(choice, idx){
            const barChartContainer = d3.select(`#bar${choice}`);

            //Remove any existing bars
            barChartContainer.selectAll('*').remove();

            // Set up the SVG container
            const svg = barChartContainer.append("svg")
                .attr("width", barwidth) // Width of the chart (you can adjust it)
                .attr("height", barheight); // Height of the chart

            //slice the data based on idx to get the first 'choice' elements
            const selectedData = data.slice(0,choice);
            const selectedLocations = location[choice - 1];//get the locations of each bar
            const selectedWidths = w[choice - 1];//get the width of corresponding number of bars

            selectedData.forEach((dataSet, i) => {
                svg.append('rect')
                    .attr('class', `bar-${i}`)
                    .attr('x', selectedLocations[i]) //use corresponding location
                    .attr('y',barheight - scaleHeight(dataSet[idx],maxValue)-bottomspace)// - bottomspace) //select y location
                    .attr('width', selectedWidths)
                    .attr('height', scaleHeight(dataSet[idx],maxValue))
                    .attr('fill', getBarColor(i));
                //console.log(scaleHeight(dataSet[idx],maxValue));
                //console.log(selectedWidths[i]);

            });
            createYAxisLabels(svg, maxValue);
            // Create the X-axis
            createXAxisLabels(svg, choice); // Create X-axis without scaling, based on categories
        }

        function scaleHeight(value, max) {
            return (value / max) * (barheight-upperspace-bottomspace); // Scale the height of the bar relative to the max value
        }
        // Function to get the color for each bar (based on its dataset)
        function getBarColor(j) {
            const colors = [
                "rgba(0, 0, 0, 0.6)", // For WL1
                "rgba(22, 50, 50, 0.6)", // For WL2
                "rgba(50, 50, 50, 0.6)", // For WN
                "rgba(255, 255, 255, 0.6)" // For WR
            ];
            return colors[j]; // Use the color corresponding to the dataset
        }

        //   // Function to create Y-axis labels
        function createYAxisLabels(svg, maxValue) {
            const yTicks = 10; // Number of ticks for the y-axis

            const yScale = d3.scaleLinear()
            .domain([0.0, maxValue])
            .range([barheight-bottomspace, upperspace]);

            // Create Y-axis labels with ticks
            const yAxis = d3.axisLeft(yScale).ticks(yTicks);

            // Append the y-axis labels
            svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${leftspace}, 0)`) // Position the axis on the left of the bars
            .call(yAxis);
                
            // Add the Y-axis label
            svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)") // Rotate the label to be vertical
            .attr("y", 10) // Position the label
            .attr("x", -barheight / 2) // Adjust this to position the label along the Y-axis
            .style("text-anchor", "middle") // Center the label horizontally
            .style("font-size", "12px")
            .text("Displacement");
        }

        function createXAxisLabels(svg, idx){
            const arr = labels.slice(0,idx)
            const xScale = d3.scaleBand()
                .domain(arr) //categories
                .range([leftspace, barwidth]) //range of labels
                .padding(0.1); //padding between bars

            const xAxis = d3.axisBottom(xScale);

            // Append the X-axis to the SVG
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${barheight-bottomspace})`) // Position X-axis at the bottom of the chart
                .call(xAxis);

            // Add X-axis label
            svg.append("text")
                .attr("class", "x-axis-label")
                .attr("transform", `translate(${(barwidth+leftspace)/2}, ${barheight-5})`)
                .style("text-anchor", "middle")
                .text("Environment")
                .style("font-size", "12px");  // Adjust font size
        }
    });





    //Get the last columns from dataset
    const extractLastColumn = (data) => {
        // Iterate through each row and retrieve the value of the last column
        return data.map(row => {
            // Get the last key of the row, which corresponds to the last column
            const lastColumnKey = Object.keys(row)[Object.keys(row).length - 1];
            return row[lastColumnKey]; //Return the value of last column
        })
    }
    //Get the second last columns from dataset
    const extractSecondLast = (data) => {
        // Iterate through each row and retrieve the value of the second last column
        return data.map(row => {
            // Get the last key of the row, which corresponds to the second last column
            const secondLast = Object.keys(row)[Object.keys(row).length - 2];
            return row[secondLast]; //Return the value of last column
        })
    }
});