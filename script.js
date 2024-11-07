const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// Define symbols for unique property keys
const BASE_TEMP = Symbol("baseTemp");
const HEAT_VALUES = Symbol("heatValues");

const appState = {
  [BASE_TEMP]: null,
  [HEAT_VALUES]: [],
};

// Scales for the chart
const chartScales = {
  yScale: null,
  xScale: null,
};

// Axes for the chart
const chartAxes = {
  xAxis: null,
  yAxis: null,
};

// Dimensions for the SVG canvas
const canvasDimensions = {
  width: 1200,
  height: 600,
  padding: 50,
};

const svgCanvas = d3.select("svg");
const tooltip = d3.select("#tooltip");

// Function to set up the SVG canvas dimensions
const setupCanvas = () => {
  svgCanvas.attr("width", canvasDimensions.width);
  svgCanvas.attr("height", canvasDimensions.height);
};

// Function to generate the scales for the chart
const generateChartScales = () => {
  let minYear = d3.min(appState[HEAT_VALUES], (item) => {
    return item["year"];
  });
  let maxYear = d3.max(appState[HEAT_VALUES], (item) => {
    return item["year"];
  });

  chartScales.xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([
      canvasDimensions.padding,
      canvasDimensions.width - canvasDimensions.padding,
    ]);

  chartScales.yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([
      canvasDimensions.padding,
      canvasDimensions.height - canvasDimensions.padding,
    ]);
};

// Function to draw the cells for the chart
const drawCells = () => {
  svgCanvas
    .selectAll("rect")
    .data(appState[HEAT_VALUES])
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      let variance = item["variance"];
      if (variance <= -1) {
        return "SteelBlue";
      } else if (variance <= 0) {
        return "LightSteelBlue";
      } else if (variance <= 1) {
        return "Orange";
      } else {
        return "Crimson";
      }
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      return item["month"] - 1;
    })
    .attr("data-temp", (item) => {
      return appState[BASE_TEMP] + item["variance"];
    })
    .attr("height", (item) => {
      return (canvasDimensions.height - 2 * canvasDimensions.padding) / 12;
    })
    .attr("y", (item) => {
      return chartScales.yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0));
    })
    .attr("width", (item) => {
      let minYear = d3.min(appState[HEAT_VALUES], (item) => {
        return item["year"];
      });

      let maxYear = d3.max(appState[HEAT_VALUES], (item) => {
        return item["year"];
      });

      let yearCount = maxYear - minYear;

      return (
        (canvasDimensions.width - 2 * canvasDimensions.padding) / yearCount
      );
    })
    .attr("x", (item) => {
      return chartScales.xScale(item["year"]);
    })
    .on("mouseover", (item) => {
      tooltip.transition().style("visibility", "visible");

      let monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      tooltip.text(
        item["year"] +
          " " +
          monthNames[item["month"] - 1] +
          " : " +
          item["variance"]
      );

      tooltip.attr("data-year", item["year"]);
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

// Function to generate the axes for the chart
const generateAxis = () => {
  let xAxis = d3.axisBottom(chartScales.xScale).tickFormat(d3.format("d"));

  let yAxis = d3.axisLeft(chartScales.yScale).tickFormat(d3.timeFormat("%B"));

  svgCanvas
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr(
      "transform",
      "translate(0, " +
        (canvasDimensions.height - canvasDimensions.padding) +
        ")"
    );

  svgCanvas
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + canvasDimensions.padding + ", 0)");
};

// Event listener to run when the DOM content is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Content loaded");
  const response = await fetch(dataUrl);
  const data = await response.json();

  appState[BASE_TEMP] = data.baseTemperature;
  appState[HEAT_VALUES] = data.monthlyVariance;

  console.log({ data: appState[HEAT_VALUES] });

  setupCanvas();
  generateChartScales();
  drawCells();
  generateAxis();
});
