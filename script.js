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
    });
});