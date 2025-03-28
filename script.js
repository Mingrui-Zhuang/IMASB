// ******************************************** Global Variable ****************************************************
let selectedSubject = '1';

const dataFiles = ["data/1/WN_clean.csv", "data/1/WR_clean.csv", "data/1/WL1_clean.csv", "data/1/WL2_clean.csv"];
const plots = ["plot1", "plot2", "plot3", "plot4"];
const lineplots = ["plot-1", "plot-2", "plot-3", "plot-4"];
const audioSources = [null, "./excerpts/unmodified.wav", "./excerpts/modulated_0.1Hz.wav", "./excerpts/modulated_0.25Hz.wav"];

const titles = ["WN", "WR", "WL1", "WL2"];
const margin = { top: 20, right: 30, bottom: 30, left: 60 };
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
// ******************************************** Nagivation ****************************************************
function moveToNextSlide() {
    pauseCurrentSlideSliders();
    const slides = document.querySelectorAll('.slide');
    let currentSlide = Array.from(slides).findIndex(slide => slide.style.display !== 'none');
    slides[currentSlide].style.opacity = 0;
    setTimeout(() => {
        slides[currentSlide].style.display = 'none';
        let nextSlide = (currentSlide + 1) % slides.length;
        slides[nextSlide].style.display = 'block';
        setTimeout(() => {
            slides[nextSlide].style.opacity = 1;
        }, 50); // Small delay

        // Check if the next slide is the last one
        if (nextSlide === slides.length - 1) {
            document.getElementById('nextBtn').style.display = 'none';
            document.removeEventListener('wheel', handleWheelEvent);
        }
    }, 200); // Duration of the fade-out effect
}

function moveToPreviousSlide() {
    pauseCurrentSlideSliders();
    const slides = document.querySelectorAll('.slide');
    let currentSlide = Array.from(slides).findIndex(slide => slide.style.display !== 'none');
    if (currentSlide === 0){ return; }  // handle going from first slide to last slide

    slides[currentSlide].style.opacity = 0;
    setTimeout(() => {
        slides[currentSlide].style.display = 'none';
        let previousSlide = (currentSlide - 1 + slides.length) % slides.length;
        slides[previousSlide].style.display = 'block';
        setTimeout(() => {
            slides[previousSlide].style.opacity = 1;
        }, 50); // Small delay

        // Show the next button again if it was hidden
        document.getElementById('nextBtn').style.display = 'block';
        document.addEventListener('wheel', handleWheelEvent);
    }, 200); // Duration of the fade-out effect
}

document.getElementById('nextBtn').addEventListener('click', function() {
    moveToNextSlide();
});

let isScrolling = false;

function handleWheelEvent(event) {
    // handle nextBtn come back
    const slides = document.querySelectorAll('.slide');
    let currentSlide = Array.from(slides).findIndex(slide => slide.style.display !== 'none');
    if (currentSlide === 2){ document.querySelector('#nextBtn').style.opacity = 100; } 

    if (isScrolling) return;
    isScrolling = true;
    if (event.deltaY > 0) {
        moveToNextSlide();
    } else if (event.deltaY < 0) {
        moveToPreviousSlide();
    }
    setTimeout(() => {
        isScrolling = false;
    }, 2000); // Adjust the timeout duration as needed
}
document.addEventListener('wheel', handleWheelEvent);

// Initialize the first slide to be visible
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.style.display = index === 0 ? 'block' : 'none';
        slide.style.transition = 'opacity 0.5s'; // Add transition for smooth fade effect
        slide.style.opacity = index === 0 ? 1 : 0;
    });
});

function animateDialogue(dialogue) {
    const fullText = dialogue.textContent.trim();
    dialogue.textContent = "";
    const words = fullText.split(" ");
    let delay = 0;
    words.forEach(word => {
        const span = document.createElement("span");
        span.textContent = word + " "; // include a trailing space
        span.style.opacity = 0;
        dialogue.appendChild(span);
        setTimeout(() => {
            span.style.transition = "opacity 0.5s";
            span.style.opacity = 1;
        }, delay);
        delay += 200; // Adjust delay per word if desired 200
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Animate the dialogue on the first hook slide immediately (if desired)
    const slideMinus2 = document.getElementById("slide-2");
    if(slideMinus2) {
        const dialogue = slideMinus2.querySelector(".dialogue");
        if(dialogue) {
            animateDialogue(dialogue);
        }
    }

    // Set up IntersectionObserver for other full-page slides (e.g., slide -1)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const dialogue = entry.target.querySelector(".dialogue");
                if(dialogue) {
                    animateDialogue(dialogue);
                    // Unobserve if you want the animation to run only once.
                    obs.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.5 });
    
    // Observe slide -1 (or all full-page slides if needed)
    const slideMinus1 = document.getElementById("slide-1");
    if (slideMinus1) {
        observer.observe(slideMinus1);
    }
});



// *********************************************Initialize Slider Buttons*********************************************
function setupSliderButtons(sliderId, sliderValueId, audioIndex) {
    const slider = document.getElementById(sliderId);
    const sliderValueDisplay = document.getElementById(sliderValueId);
    const container = slider.parentNode;

    // Initialize custom properties
    slider.playIntervalId = null;
    slider.isPlaying = false;
    slider.isDragging = false;

    // Create an Audio object
    let audio = null;
    if (audioSources[audioIndex]) {
        audio = new Audio(audioSources[audioIndex]);
    }
    slider.audio = audio;

    slider.addEventListener("input", function () {
        sliderValueDisplay.textContent = (this.value / 100) + "s";
    });
    // Mark the start of a drag
    slider.addEventListener("mousedown", function () {
        slider.isDragging = true;
    });
    // On mouse release, update the audio's currentTime
    slider.addEventListener("mouseup", function () {
        slider.isDragging = false;
        if (slider.audio) {
            slider.audio.currentTime = this.value / 100;
            // Resume playing if needed:
            if (!slider.audio.paused) {
                slider.audio.play();
            }
        }
    });
    // Update the slider based on audio playback when not dragging
    if (slider.audio) {
        slider.audio.addEventListener("timeupdate", function () {
            if (!slider.isDragging) {
                slider.value = slider.audio.currentTime * 100;
                sliderValueDisplay.textContent = slider.audio.currentTime.toFixed(2) + "s";
            }
        });
    }

    // Speed
    const speedSelect = document.createElement("select");
    const speeds = [0.1, 0.5, 1, 1.5, 2, 5];
    speeds.forEach(speed => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = speed + "x";
        if (speed === 1) {
            option.selected = true; // Default speed is 1x
        }
        speedSelect.appendChild(option);
    });
    container.appendChild(speedSelect);
    speedSelect.addEventListener("change", function() {
        if (slider.audio) {
            slider.audio.playbackRate = parseFloat(this.value) || 1;
        }
    });

    // Create Play button
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶️";
    playBtn.classList.add("play-pause-btn", "play-button");
    container.insertBefore(playBtn, slider);

    // Create Pause button
    const pauseBtn = document.createElement("button");
    pauseBtn.textContent = "⏸️";
    pauseBtn.classList.add("play-pause-btn", "pause-button");
    container.insertBefore(pauseBtn, slider);

    // Create Rewind button
    const rewindBtn = document.createElement("button");
    rewindBtn.textContent = "⏪️";
    rewindBtn.classList.add("play-pause-btn", "rewind-button");
    container.insertBefore(rewindBtn, slider);

    // PLAY
    playBtn.addEventListener("click", function() {
        if (slider.isPlaying) return;  // Already playing
        slider.isPlaying = true;
        const step = 10;
        slider.playIntervalId = setInterval(() => {
            let currentValue = parseInt(slider.value, 10);
            // const playbackRate = slider.audio ? slider.audio.playbackRate : 1;
            const playbackRate = slider.audio ? slider.audio.playbackRate : (parseFloat(speedSelect.value) || 1);
            if (currentValue < slider.max) {
                currentValue += step * playbackRate;
                slider.value = currentValue;
                sliderValueDisplay.textContent = (currentValue / 100) + "s";
                slider.dispatchEvent(new Event("input"));
            } else {
                clearInterval(slider.playIntervalId);
                slider.isPlaying = false;
            }
        }, 100);
        if (slider.audio) {
            // Sync the audio's currentTime to the slider value
            slider.audio.currentTime = slider.value / 100;
            slider.audio.playbackRate = parseFloat(speedSelect.value) || 1;
            slider.audio.play();
        }
    });

    // PAUSE
    pauseBtn.addEventListener("click", function() {
        if (!slider.isPlaying) return;
        clearInterval(slider.playIntervalId);
        slider.isPlaying = false;
        if (slider.audio) {slider.audio.pause();}
    });

    // REWIND: Reset the slider back to the beginning
    rewindBtn.addEventListener("click", function() {
        // Stop the play interval if it's running
        if (slider.isPlaying) {
            clearInterval(slider.playIntervalId);
            slider.isPlaying = false;
        }
        // Reset slider value and display
        slider.value = slider.min;
        sliderValueDisplay.textContent = "0s";
        slider.dispatchEvent(new Event("input"));
        if (slider.audio) {
            slider.audio.currentTime = 0;
            slider.audio.pause();
        }
    });
}

function pauseCurrentSlideSliders() {
    // Find the currently visible slide
    const currentSlide = Array.from(document.querySelectorAll('.slide'))
                              .find(slide => slide.style.display !== 'none');
    if (!currentSlide) return;

    // Find all slider elements in the current slide
    const sliders = currentSlide.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        if (slider.isPlaying) {
            clearInterval(slider.playIntervalId);
            slider.isPlaying = false;
        }
        if (slider.audio) {
            slider.audio.pause();
        }
    });
}

// ******************************************** Plots ****************************************************
document.addEventListener("DOMContentLoaded", function () {

// *********************************************Initialize Single Line Plots*********************************************

    plots.forEach((plotId, index) => {
        const svg = d3.select(`#${plotId}`)
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add the background image
        svg.append("image")
            .attr("xlink:href", "Foot.png") // Replace with the path to your image
            .attr("x", 376)
            .attr("y", -18)
            .attr("width", 50)
            .attr("height", 50)
        
        // Add the title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "bold")
            .text(titles[index]);

        const xScale = d3.scaleLinear().domain([-0.01, 0.01]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-0.02, 0.02]).range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.CoPx))
            .y(d => yScale(d.CoPy));

        // Add x-zero line
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(0))
            .attr("x2", width)
            .attr("y2", yScale(0))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Add y-zero line
        svg.append("line")
            .attr("x1", xScale(0))
            .attr("y1", 0)
            .attr("x2", xScale(0))
            .attr("y2", height)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("fill", "#000")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", margin.bottom + 10)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("CoPx (meter)");

        svg.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("fill", "#000")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("CoPy (meter)");

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
            .attr("r", 10) // Larger radius for the hover area
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

// *********************************************Initialize Combined Line Plots*********************************************

    lineplots.forEach((plotId, index) => {
        const svg = d3.select(`#${plotId}`)
            .append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add the title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "bold")
            .text(titles[index]);

        const xScale = d3.scaleLinear().domain([-0.01, 0.01]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-0.02, 0.02]).range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.CoPx))
            .y(d => yScale(d.CoPy));

            // Add x-zero line
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(0))
            .attr("x2", width)
            .attr("y2", yScale(0))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Add y-zero line
        svg.append("line")
            .attr("x1", xScale(0))
            .attr("y1", 0)
            .attr("x2", xScale(0))
            .attr("y2", height)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("fill", "#000")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", margin.bottom + 10)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("CoPx (m)");

        svg.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("fill", "#000")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("CoPy (m)");

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
        // console.log("Datasets loaded:", datasets); // Check if datasets are loaded correctly

        // *********************************************Single Line Plot*********************************************
        plots.forEach((plotId, index) => {
            const slider = d3.select(`#time-slider-${index + 1}`);
            const sliderValue = d3.select(`#slider-value-${index + 1}`);

            slider.on("input", function () {
                const currentTime = +this.value;
                sliderValue.text(`${currentTime / 100}s`);
                if (slider.audio) {
                    slider.audio.currentTime = currentTime / 100;
                }

                const data = datasets[index];

                const filteredData = data.filter(d => d.time <= currentTime);
                // console.log(`Filtered data for plot ${plotId}:`, filteredData); // Check the filtered data

                // If no data or time=0, explicitly clear everything and exit early
                if (filteredData.length === 0 || currentTime === 0) {
                    // Clear the main path
                    paths[index].datum([]).attr("d", null);
                    // Remove any line segments
                    svgs[index].selectAll(".line-segment").remove();
                    // Hide dot & hover area
                    dots[index].style("opacity", 0);
                    hoverAreas[index]
                    .style("opacity", 0)
                    .attr("r", 0)
                    .style("pointer-events", "none");
                    // Remove old hover lines
                    svgs[index].selectAll(".hover-line").remove();
                    return; // Skip the rest of the logic
                }

                // Update the line path
                // paths[index].datum(filteredData)
                //     .attr("d", lines[index]);

                // Calculate the max time for normalization
                const maxTime = d3.max(filteredData, d => +d.time);

                // Normalize time values to [0, 1]
                const normalizedData = filteredData.map(d => ({
                    ...d,
                    normalizedTime: +d.time / maxTime
                }));

                // Apply gradient effect based on time
                // paths[index].attr("stroke", "none"); // Reset stroke
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
                        .attr("r", 30)
                        .style("pointer-events", "all")
                        .style("opacity", 0)
                        .raise();

                } else {
                    dots[index].style("opacity", 0);
                    hoverAreas[index]
                    .style("opacity", 0)
                    .attr("r", 0)
                    .style("pointer-events", "none");
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
                            .style("left", `${event.pageX + 5}px`)
                            .style("top", `${event.pageY + 5}px`);

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

        // *********************************************COMBINED Line Plot*********************************************
        // Create a combined slider for the final slide
        const combinedSlider = d3.select("#time-slider-combined");
        const combinedSliderValue = d3.select("#slider-value-combined");

        combinedSlider.on("input", function () {
            const currentTime = +this.value;
            combinedSliderValue.text(`${currentTime / 100}s`);
        
            lineplots.forEach((plotId, index) => {
                const offsetIndex = index + plots.length;
                const data = datasets[index];
        
                const filteredData = data.filter(d => d.time <= currentTime);
                // console.log(`Filtered data for plot ${plotId}:`, filteredData); // Check the filtered data
        
                // Early exit if no data or time=0
                if (filteredData.length === 0 || currentTime === 0) {
                    // Clear the main path
                    // paths[offsetIndex].datum([]).attr("d", null);

                    // Remove any leftover line segments
                    svgs[offsetIndex].selectAll(".line-segment").remove();

                    // Hide the dot & hover area
                    dots[offsetIndex].style("opacity", 0);
                    hoverAreas[offsetIndex]
                    .style("opacity", 0)
                    .attr("r", 0)
                    .style("pointer-events", "none");

                    // Remove old hover lines
                    svgs[offsetIndex].selectAll(".hover-line").remove();

                    // Skip the rest of the logic for this plot
                    return;
                }
        
                // Update the line path
                // paths[offsetIndex].datum(filteredData)
                //     .attr("d", lines[offsetIndex]);
        
                // Calculate the max time for normalization
                const maxTime = d3.max(filteredData, d => +d.time);
        
                // Normalize time values to [0, 1]
                const normalizedData = filteredData.map(d => ({
                    ...d,
                    normalizedTime: +d.time / maxTime
                }));
        
                // Apply gradient effect based on time
                // paths[offsetIndex].attr("stroke", "none"); // Reset stroke
                svgs[offsetIndex].selectAll(".line-segment").remove(); // Remove old segments
        
                // Draw line segments with color based on time
                for (let i = 1; i < normalizedData.length; i++) {
                    const segmentData = [normalizedData[i - 1], normalizedData[i]];
                    const segmentTime = (normalizedData[i].normalizedTime + normalizedData[i - 1].normalizedTime) / 2;
        
                    // Interpolate color based on normalized time
                    const color = d3.interpolateRgb("lightblue", "darkblue")(segmentTime);
        
                    svgs[offsetIndex].append("path")
                        .datum(segmentData)
                        .attr("class", "line-segment")
                        .attr("d", lines[offsetIndex])
                        .attr("stroke", color)
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                }
        
                // Update the dot position
                const lastDataPoint = filteredData[filteredData.length - 1];
                const cx = xScales[offsetIndex](lastDataPoint.CoPx);
                const cy = yScales[offsetIndex](lastDataPoint.CoPy);
    
                if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
                    dots[offsetIndex].datum(lastDataPoint)
                        .attr("cx", cx)
                        .attr("cy", cy)
                        .style("opacity", 1)
                        .raise();
    
                    // Update the hover area position
                    hoverAreas[offsetIndex].datum(lastDataPoint)
                        .attr("cx", cx)
                        .attr("cy", cy)
                        .attr("r", 30)
                        .style("pointer-events", "all")
                        .style("opacity", 0)
                        .raise();
    
                } else {
                    dots[offsetIndex].style("opacity", 0);
                    hoverAreas[offsetIndex]
                    .style("opacity", 0)
                    .attr("r", 0)
                    .style("pointer-events", "none");
                }
        
                // Remove old hover lines
                svgs[offsetIndex].selectAll(".hover-line").remove();
        
                // Add tooltips to the dots
                hoverAreas[offsetIndex]
                    .on("mouseover", function (event, d) {
                        const CoPx = parseFloat(d.CoPx).toFixed(5);
                        const CoPy = parseFloat(d.CoPy).toFixed(5);
                        const displacement = parseFloat(d.displacement).toFixed(5);
        
                        // Show the tooltip
                        tooltips[offsetIndex].style("opacity", 1)
                            .html(`CoPx: ${CoPx}<br>CoPy: ${CoPy}<br>Displacement: ${displacement}`)
                            .style("left", `${event.pageX + 5}px`)
                            .style("top", `${event.pageY + 5}px`);
        
                        // Add hover lines
                        svgs[offsetIndex].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[offsetIndex](d.CoPx))
                            .attr("y1", yScales[offsetIndex](d.CoPy))
                            .attr("x2", xScales[offsetIndex](d.CoPx))
                            .attr("y2", height)
                            .attr("stroke", "#000");
        
                        svgs[offsetIndex].append("line")
                            .attr("class", "hover-line")
                            .attr("x1", xScales[offsetIndex](d.CoPx))
                            .attr("y1", yScales[offsetIndex](d.CoPy))
                            .attr("x2", 0)
                            .attr("y2", yScales[offsetIndex](d.CoPy))
                            .attr("stroke", "#000");
                    })
                    .on("mouseout", function () {
                        tooltips[offsetIndex].style("opacity", 0);
                        svgs[offsetIndex].selectAll(".hover-line").remove();
                    });
            });
        });

// *********************************************Initialize Bar Plots*********************************************
        //get each data
        const WN = datasets[0];
        const WR = datasets[1];
        const WL1 = datasets[2];
        const WL2 = datasets[3];
 
        //Last column
        const WN_work = extractLastColumn(WN);
        const WR_work = extractLastColumn(WR);
        const WL1_work = extractLastColumn(WL1);
        const WL2_work = extractLastColumn(WL2);

        //Second last column
        const WN_dis = extractSecondLast(WN);
        const WR_dis = extractSecondLast(WR);
        const WL1_dis = extractSecondLast(WL1);
        const WL2_dis = extractSecondLast(WL2);

        const maxValue = Math.max(...WL1_dis); //measure the largest displacement value of four datasets
        const maxForce = Math.max(...WL1_work); //measuer the largest 

        //important numbers for setting up the bar graph
        //Let idx be a parameter for the function.
        //data.slice(0,idx), if idx is 3, it means we are plotting the
        //first three data. Using location[idx] for the x location of data from 
        //left to right. w[idx] tells us the width of each bar.
        const data1 = [WN_dis,WR_dis,WL1_dis,WL2_dis];
        const data2 = [WN_work, WR_work, WL1_work, WL2_work];
        const location = [[170], [105, 275], [85, 200, 315], [73, 161, 249, 337]];
        const w = [100,60,40,30];
        let labels = ["WN", "WR", "WL1", "WL2"];
        // console.log(slider);
        // console.log(sliderValueDisplay);

        //set up the dimension of bar
        const barMargin = { top: 20, right: 30, bottom: 40, left: 50 };
        const barWidth = 470 - barMargin.left - barMargin.right;
        const barHeight = 310 - barMargin.top - barMargin.bottom;
        //creating displacement graph
        createBarChart(data1, 1, 0, 'bar');
        createBarChart(data1, 2, 0, 'bar');
        createBarChart(data1, 3, 0, 'bar');
        createBarChart(data1, 4, 0, 'bar');
        //create final bar chart
        createBarChart(data1, 5, 0, 'bar');
        //create force graph
        createBarChart(data2, 1, 0, 'forceBar');
        createBarChart(data2, 2, 0, 'forceBar');
        createBarChart(data2, 3, 0, 'forceBar');
        createBarChart(data2, 4, 0, 'forceBar');
        //create final bar chart
        createBarChart(data2, 5, 0, 'forceBar');

        // Initialize sliders
        setupSlider(data1, 'time-slider-1', 'slider-value-1', 1, 'bar');
        setupSlider(data1, 'time-slider-2', 'slider-value-2', 2, 'bar');
        setupSlider(data1, 'time-slider-3', 'slider-value-3', 3, 'bar');
        setupSlider(data1, 'time-slider-4', 'slider-value-4', 4, 'bar');
        //Final slider
        setupSlider(data1, 'time-slider-combined', 'slider-value-combined', 5, 'bar');

        // Initialize sliders
        setupSlider(data2, 'time-slider-1', 'slider-value-1', 1, 'forceBar');
        setupSlider(data2, 'time-slider-2', 'slider-value-2', 2, 'forceBar');
        setupSlider(data2, 'time-slider-3', 'slider-value-3', 3, 'forceBar');
        setupSlider(data2, 'time-slider-4', 'slider-value-4', 4, 'forceBar');
        //Final slider
        setupSlider(data2, 'time-slider-combined', 'slider-value-combined', 5, 'forceBar');
  
        function setupSlider(data,sliderId, sliderValueDisplayId, chartIndex, name) {
            const slider = document.getElementById(sliderId);
            const sliderValueDisplay = document.getElementById(sliderValueDisplayId);
    
            slider.addEventListener('input', function () {
                const index = parseInt(slider.value); // Get the current index from the slider
                const currentTimeSec = +this.value / 100;
                sliderValueDisplay.textContent = `${currentTimeSec}s`; // Show current slider value in seconds
                // Update the bar chart with the new value from WL1[index]
                const safeIndex = Math.max(0, index - 1);
                createBarChart(data, chartIndex, safeIndex, name);
            });
        }

        //choice means choosing slider, idx means one of the 6000 values.
        function createBarChart(data, choice, idx, name){
            let slide5 = false;
            // console.log(`${name + choice}`);
            const barChartContainer = d3.select(`#${name+choice}`);
            //for final slider
            if (choice === 5){
                choice = 4;
                slide5 = true;
            }

            //Remove any existing bars
            barChartContainer.selectAll('*').remove();

            // Set up the SVG container
            const svg = barChartContainer.append("svg")
                // .attr("width", barWidth) // Width of the chart
                // .attr("height", barHeight); // Height of the chart
                .attr("viewBox", `0 0 ${barWidth + margin.left + margin.right} ${barHeight + margin.top + margin.bottom}`)
                .attr("preserveAspectRatio", "xMidYMid meet")

            //slice the data based on idx to get the first 'choice' elements
            //console.log(data);
            const selectedData = data.slice(0,choice);
            const selectedLocations = location[choice - 1];//get the locations of each bar
            const selectedWidths = w[choice - 1];//get the width of corresponding number of bars
            if (name === 'bar'){
                selectedData.forEach((dataSet, i) => {
                    svg.append('rect')
                        .attr('class', `bar-${i}`)
                        .attr('x', selectedLocations[i]) //use corresponding location
                        .attr('y',barHeight - scaleHeight(dataSet[idx],maxValue)-barMargin.bottom)// - bottom) //select y location
                        .attr('width', selectedWidths)
                        .attr('height', scaleHeight(dataSet[idx],maxValue))
                        .attr('fill', getBarColor(i));
                    //console.log(scaleHeight(dataSet[idx],maxValue));
                    //console.log(selectedWidths[i]);
                    if (i === choice - 1){ //add current
                        svg.append('text')
                        .attr('x', selectedLocations[i]+selectedWidths/2) // Center the text on top and center of the bar
                        .attr('y', barHeight - scaleHeight(dataSet[idx],maxValue)-barMargin.bottom - 5) // 10px above the top of the bar
                        .attr('text-anchor', 'middle') // Center the text horizontally
                        .attr('fill', getBarColor(i)) // Text color
                        .attr('font-size', '13px') // Set the font size to 5px
                        .attr('font-weight', 'bold') // Make the text bold
                        .attr('font-family', 'Arial, Helvetica, sans-serif')  // List of fallback fonts
                        .text(slide5? `${Math.round(dataSet[idx]*10000)/10000}`:`Current: ${Math.round(dataSet[idx]*10000)/10000}`); // Display the value
                    }
                    else{
                        svg.append('text')
                        .attr('x', selectedLocations[i]+selectedWidths/2) // Center the text on top and center of the bar
                        .attr('y', barHeight - scaleHeight(dataSet[idx],maxValue)-barMargin.bottom - 5) // 10px above the top of the bar
                        .attr('text-anchor', 'middle') // Center the text horizontally
                        .attr('fill', getBarColor(i)) // Text color
                        .attr('font-size', '12px') // Set the font size to 5px
                        .text(Math.round(dataSet[idx]*10000)/10000); // Display the value
                    }

                });
                createYAxisLabels(svg, maxValue, 'displacement (m)'); //create unique y-label
                createXAxisLabels(svg, choice, 'displacement (m)'); //create unqiue x-label
            }
            else if (name === 'forceBar'){
                selectedData.forEach((dataSet, i) => {
                    svg.append('rect')
                        .attr('class', `bar-${i}`)
                        .attr('x', selectedLocations[i]) //use corresponding location
                        .attr('y',barHeight - scaleHeight(dataSet[idx],maxForce)-barMargin.bottom)// - bottom) //select y location
                        .attr('width', selectedWidths)
                        .attr('height', scaleHeight(dataSet[idx],maxForce))
                        .attr('fill', getBarColor(i));
                    //console.log(scaleHeight(dataSet[idx],maxValue));
                    //console.log(selectedWidths[i]);
                    if (i === choice - 1){ //add current
                        svg.append('text')
                        .attr('x', selectedLocations[i]+selectedWidths/2) // Center the text on top and center of the bar
                        .attr('y', barHeight - scaleHeight(dataSet[idx],maxForce)-barMargin.bottom - 5) // 10px above the top of the bar
                        .attr('text-anchor', 'middle') // Center the text horizontally
                        .attr('fill', getBarColor(i)) // Text color
                        .attr('font-size', '13px') // Set the font size to 5px
                        .attr('font-weight', 'bold') // Make the text bold
                        .attr('font-family', 'Arial, Helvetica, sans-serif')  // List of fallback fonts
                        .text(slide5? `${Math.round(dataSet[idx]*100)/100}`:`Current: ${Math.round(dataSet[idx]*100)/100}`); // Display the value
                    }
                    else{
                        svg.append('text')
                        .attr('x', selectedLocations[i]+selectedWidths/2) // Center the text on top and center of the bar
                        .attr('y', barHeight - scaleHeight(dataSet[idx],maxForce)-barMargin.bottom - 5) // 10px above the top of the bar
                        .attr('text-anchor', 'middle') // Center the text horizontally
                        .attr('fill', getBarColor(i)) // Text color
                        .attr('font-size', '12px') // Set the font size to 5px
                        .text(Math.round(dataSet[idx]*100)/100); // Display the value
                    }

                });
                createYAxisLabels(svg, maxForce, 'Torque (m*N)'); //create unique y-label 
                createXAxisLabels(svg, choice, 'Torque (m*N)'); //create unique x-label               
            }
            //createYAxisLabels(svg, maxValue);
            // Create the X-axis
            //createXAxisLabels(svg, choice); // Create X-axis without scaling, based on categories
        }

        function scaleHeight(value, max) {
            return (value / max) * (barHeight-barMargin.top-barMargin.bottom); // Scale the height of the bar relative to the max value
        }

        // Function to get the color for each bar (based on its dataset)
        function getBarColor(j) {
            const colors = [
                "#FF5733", // For WL1
                "#FF8D1A", // For WL2
                "#FFC300", // For WN
                "#FF5733"  // For WR
            ];
            return colors[j]; // Use the color corresponding to the dataset
        }

        //   // Function to create Y-axis labels
        function createYAxisLabels(svg, maxValue, yname) {
            const yTicks = 8; // Number of ticks for the y-axis

            const yScale = d3.scaleLinear()
            .domain([0.0, maxValue])
            .range([barHeight-barMargin.bottom, barMargin.top]);

            // Create Y-axis labels with ticks
            const yAxis = d3.axisLeft(yScale).ticks(yTicks);

            // Append the y-axis labels
            svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${barMargin.left}, 0)`) // Position the axis on the left of the bars
            .call(yAxis);
                
            // Add the Y-axis label
            svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)") // Rotate the label to be vertical
            .attr("y", 20) // Position the label
            .attr("x", -barHeight / 2) // Adjust this to position the label along the Y-axis
            .style("text-anchor", "middle") // Center the label horizontally
            .style("font-size", "12px")
            .text(`${yname}`);
        }

        function createXAxisLabels(svg, idx, dt){
            const arr = labels.slice(0,idx)
            const xScale = d3.scaleBand()
                .domain(arr) //categories
                .range([barMargin.left, barWidth]) //range of labels
                .padding(0.1); //padding between bars

            const xAxis = d3.axisBottom(xScale);

            // Append the X-axis to the SVG
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${barHeight-barMargin.bottom})`) // Position X-axis at the bottom of the chart
                .call(xAxis);

            if (dt === 'Torque (m*N)'){ //create unique torque label
            // Add X-axis label
                svg.append("text")
                    .attr("class", "axis-label")
                    .attr("transform", `translate(${(barWidth+barMargin.left)/2}, ${barHeight-10})`)
                    .style("text-anchor", "middle")
                    .text("Accumulated Torque")
                    .style("font-size", "12px");  // Adjust font size
            }

            else if (dt === 'displacement (m)'){ //create unqiue displacement label
            // Add X-axis label
            svg.append("text")
                .attr("class", "axis-label")
                .attr("transform", `translate(${(barWidth+barMargin.left)/2}, ${barHeight-10})`)
                .style("text-anchor", "middle")
                .text("Traveled Distance")
                .style("font-size", "12px");  // Adjust font size
            }
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


setupSliderButtons("time-slider-1", "slider-value-1", 0);
setupSliderButtons("time-slider-2", "slider-value-2", 1);
setupSliderButtons("time-slider-3", "slider-value-3", 2);
setupSliderButtons("time-slider-4", "slider-value-4", 3);
setupSliderButtons("time-slider-combined", "slider-value-combined", 1);

// ------------------------------------- Subject Selection -----------------------------------------
const container = document.getElementById('main-content');

container.querySelectorAll('button').forEach(button => {
    button.addEventListener('click',(event)=>{
        if (event.target.attr === 'selectedSubject'){ return;}
        else{
            const container = document.getElementById('main-content');
            container.querySelectorAll('button').forEach(button => {
                button.setAttribute('class', 'choiceBtn');
            });

            event.target.setAttribute('class','selectedSubject');

            selectedSubject = event.target.textContent.slice(-1);
            const linePlotDataFiles = [`data/1/${selectedSubject}WL1.csv`, `data/1/${selectedSubject}WL2.csv`, `data/1/${selectedSubject}WN.csv`, `data/1/${selectedSubject}WR.csv`];
            const dataPromises = linePlotDataFiles.map(file => d3.csv(file));
            
            Promise.all(dataPromises).then(datasets => {
                // console.log("Datasets loaded:", datasets); // Check if datasets are loaded correctly

                // *********************************************COMBINED Line Plot*********************************************
                // Create a combined slider for the final slide
                const combinedSlider = d3.select("#time-slider-combined");
                const combinedSliderValue = d3.select("#slider-value-combined");

                const timeToSwitch = combinedSlider.property("valueAsNumber");

                combinedSlider.on("input", function () {
                    const currentTime = +this.value;
                    combinedSliderValue.text(`${currentTime / 100}s`);
                
                    lineplots.forEach((plotId, index) => {
                        const offsetIndex = index + plots.length;
                        const data = datasets[index];
                
                        const filteredData = data.filter(d => d.time <= currentTime);
                        // console.log(`Filtered data for plot ${plotId}:`, filteredData); // Check the filtered data
                
                        // Early exit if no data or time=0
                        if (filteredData.length === 0 || currentTime === 0) {
                            // Remove any leftover line segments
                            svgs[offsetIndex].selectAll(".line-segment").remove();

                            // Hide the dot & hover area
                            dots[offsetIndex].style("opacity", 0);
                            hoverAreas[offsetIndex]
                            .style("opacity", 0)
                            .attr("r", 0)
                            .style("pointer-events", "none");

                            // Remove old hover lines
                            svgs[offsetIndex].selectAll(".hover-line").remove();

                            // Skip the rest of the logic for this plot
                            return;
                        }
                
                        // Calculate the max time for normalization
                        const maxTime = d3.max(filteredData, d => +d.time);
                
                        // Normalize time values to [0, 1]
                        const normalizedData = filteredData.map(d => ({
                            ...d,
                            normalizedTime: +d.time / maxTime
                        }));
                
                        // Apply gradient effect based on time
                        svgs[offsetIndex].selectAll(".line-segment").remove(); // Remove old segments
                
                        // Draw line segments with color based on time
                        for (let i = 1; i < normalizedData.length; i++) {
                            const segmentData = [normalizedData[i - 1], normalizedData[i]];
                            const segmentTime = (normalizedData[i].normalizedTime + normalizedData[i - 1].normalizedTime) / 2;
                
                            // Interpolate color based on normalized time
                            const color = d3.interpolateRgb("lightblue", "darkblue")(segmentTime);
                
                            svgs[offsetIndex].append("path")
                                .datum(segmentData)
                                .attr("class", "line-segment")
                                .attr("d", lines[offsetIndex])
                                .attr("stroke", color)
                                .attr("stroke-width", 2)
                                .attr("fill", "none");
                        }
                
                        // Update the dot position
                        const lastDataPoint = filteredData[filteredData.length - 1];
                        const cx = xScales[offsetIndex](lastDataPoint.CoPx);
                        const cy = yScales[offsetIndex](lastDataPoint.CoPy);
            
                        if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
                            dots[offsetIndex].datum(lastDataPoint)
                                .attr("cx", cx)
                                .attr("cy", cy)
                                .style("opacity", 1)
                                .raise();
            
                            // Update the hover area position
                            hoverAreas[offsetIndex].datum(lastDataPoint)
                                .attr("cx", cx)
                                .attr("cy", cy)
                                .attr("r", 30)
                                .style("opacity", 0)
                                .style("pointer-events", "all")
                                .raise();
            
                        } else {
                            dots[offsetIndex].style("opacity", 0);
                            hoverAreas[offsetIndex]
                            .style("opacity", 0)
                            .attr("r", 0)
                            .style("pointer-events", "none");
                        }
                
                        // Remove old hover lines
                        svgs[offsetIndex].selectAll(".hover-line").remove();
                
                        // Add tooltips to the dots
                        hoverAreas[offsetIndex]
                            .on("mouseover", function (event, d) {
                                const CoPx = parseFloat(d.CoPx).toFixed(5);
                                const CoPy = parseFloat(d.CoPy).toFixed(5);
                                const displacement = parseFloat(d.displacement).toFixed(5);
                
                                // Show the tooltip
                                tooltips[offsetIndex].style("opacity", 1)
                                    .html(`CoPx: ${CoPx}<br>CoPy: ${CoPy}<br>Displacement: ${displacement}`)
                                    .style("left", `${event.pageX + 5}px`)
                                    .style("top", `${event.pageY + 5}px`);
                
                                // Add hover lines
                                svgs[offsetIndex].append("line")
                                    .attr("class", "hover-line")
                                    .attr("x1", xScales[offsetIndex](d.CoPx))
                                    .attr("y1", yScales[offsetIndex](d.CoPy))
                                    .attr("x2", xScales[offsetIndex](d.CoPx))
                                    .attr("y2", height)
                                    .attr("stroke", "#000");
                
                                svgs[offsetIndex].append("line")
                                    .attr("class", "hover-line")
                                    .attr("x1", xScales[offsetIndex](d.CoPx))
                                    .attr("y1", yScales[offsetIndex](d.CoPy))
                                    .attr("x2", 0)
                                    .attr("y2", yScales[offsetIndex](d.CoPy))
                                    .attr("stroke", "#000");
                            })
                            .on("mouseout", function () {
                                tooltips[offsetIndex].style("opacity", 0);
                                svgs[offsetIndex].selectAll(".hover-line").remove();
                            });
                    });
                });

                combinedSlider.property("valueAsNumber", timeToSwitch);
                combinedSlider.dispatch("input");
            });
        }
    });
});

// Function to show the info box
function showInfo() {
    document.getElementById('infoBox').style.display = 'block';
}

// Function to close the info box
function closeInfo() {
    document.getElementById('infoBox').style.display = 'none';
}

