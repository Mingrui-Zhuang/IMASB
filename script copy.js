document.addEventListener("DOMContentLoaded", function () {
    const dataFiles = ["data/1/WL1_clean.csv", "data/1/WL2_clean.csv", "data/1/WN_clean.csv", "data/1/WR_clean.csv"];
    const plots = ["plot1", "plot2", "plot3", "plot4"];
    const lineplots = ["plot-1", "plot-2", "plot-3", "plot-4"];
    const barPlots = ["bar1", "bar2", "bar3", "bar4"];
    const titles = ["WL1", "WL2", "WN", "WR"];

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const barMargin = { top: 20, right: 30, bottom: 40, left: 40 };
    const barWidth = 500 - barMargin.left - barMargin.right;
    const barHeight = 300 - barMargin.top - barMargin.bottom;

    const svgs = [];
    const xScales = [];
    const yScales = [];
    const lines = [];
    const paths = [];
    const dots = [];
    const tooltips = [];
    const hoverAreas = [];


    // Define xBar outside the d3.csv block
    const xBar = d3.scaleBand()
        .domain(dataFiles.map(file => file.split('/').pop().split('_')[0])) // Extract file names
        .range([0, barWidth])
        .padding(0.1);
        
    // ***************************** Initialize Single Line Plots *****************************

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

    // ***************************** Initialize Combined Plot *****************************

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

    // ***************************** Initialize Single Bar Chart *****************************

    barPlots.forEach((barPlotId, index) => {
        // Create the SVG element for the bar chart
        const barSvg = d3.select(`#${barPlotId}`)
            .append("svg")
            .attr("width", barWidth + barMargin.left + barMargin.right)
            .attr("height", barHeight + barMargin.top + barMargin.bottom)
            .append("g")
            .attr("transform", `translate(${barMargin.left},${barMargin.top})`);
    
        // Define xBar outside the d3.csv block
        const xBar = d3.scaleBand()
            .domain(dataFiles.map(file => file.split('/').pop().split('_')[0])) // Extract file names
            .range([0, barWidth])
            .padding(0.1);
    
        // Load the data for the bar chart
        d3.csv(dataFiles[index]).then(data => {
            // Extract the displacement values
            const barData = data.map(d => ({
                time: +d.time,
                displacement: +d.displacement
            }));
    
            const yBar = d3.scaleLinear()
                .domain([0, d3.max(barData, d => d.displacement)])
                .nice()
                .range([barHeight, 0]);

            // Add the x-axis to the bar chart
            barSvg.append("g")
                .attr("transform", `translate(0,${barHeight})`)
                .call(d3.axisBottom(xBar));

            // Add the y-axis to the bar chart
            barSvg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(yBar));

            // Store the barData for later use
            barSvg.datum(barData);
        });
    });

    // ***************************** Load data *****************************

    // const dataPromises = dataFiles.map(file => d3.csv(file));
    const dataPromises = dataFiles.map(file => d3.csv(file, d => ({
        time: +d.time,
        CoPx: +d.CoPx,
        CoPy: +d.CoPy,
        displacement: +d.displacement,
        Data1: +d.Data1,
        Data2: +d.Data2,
        Data3: +d.Data3,
        Data4: +d.Data4
    })));

    Promise.all(dataPromises).then(datasets => {
        console.log("Datasets loaded:", datasets); // Check if datasets are loaded correctly

        // **************************** Update the single plots ****************************

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

        // **************************** Update the combined plot ****************************
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

// **************************** Update the bar chart ****************************

            barPlots.forEach((barPlotId, index) => {
                const slider = d3.select(`#time-slider-${index + 1}`);
                const sliderValue = d3.select(`#slider-value-${index + 1}`);

                slider.on("input", function () {
                    const currentTime = +this.value;
                    sliderValue.text(`${currentTime / 100}s`);

                    // Select the bar chart SVG
                    const barSvg = d3.select(`#${barPlotId} svg g`);
                    const barData = barSvg.datum();

                    // Filter data based on the current time
                    const filteredData = barData.filter(d => d.time <= currentTime);
                    console.log(`Filtered data for bar plot ${barPlotId}:`, filteredData); // Check the filtered data

                    // Extract the latest data point for the bar chart
                    const latestData = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;

                    if (latestData) {
                        const barData = [
                            { file: 'WL1', value: latestData.displacement },
                            { file: 'WL2', value: latestData.displacement },
                            { file: 'WN', value: latestData.displacement },
                            { file: 'WR', value: latestData.displacement }
                        ];

                    // Update the y scale domain
                    const yBar = d3.scaleLinear()
                        .domain([0, d3.max(barData, d => d.value)])
                        .nice()
                        .range([barHeight, 0]);

                    // Update the bars
                    const bars = barSvg.selectAll(".bar")
                        .data(barData);

                    bars.enter()
                        .append("rect")
                        .attr("class", "bar")
                        .merge(bars)
                        .attr("x", d => xBar(d.file))
                        .attr("y", d => yBar(d.value))
                        .attr("width", xBar.bandwidth())
                        .attr("height", d => barHeight - yBar(d.value))
                        .attr("fill", "steelblue");

                    bars.exit().remove();

                    // Update the y-axis
                    barSvg.select(".y-axis")
                        .transition()
                        .duration(200)
                        .call(d3.axisLeft(yBar));
                }
            });
        });
    });
});