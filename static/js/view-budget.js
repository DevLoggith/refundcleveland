(function () {

    // Retrieve and format data
    let data = JSON.parse(document.getElementById('json_data').textContent);

    // Temporarily remove "other" category from data object
    let other_category;
    data.fund_structure.forEach(function (category, i) {
        if (category.name === "Administration, Law, and Other") {
            other_category = data.fund_structure[i];
            data.fund_structure.splice(i, 1);
        } else {
            // Optional: Remove line item totals
            // since they are no longer needed
            data.fund_structure[i].children.forEach(function (line_item) {
                delete line_item.total;
            });
        }
    });

    data = sort_desc_by_percentage(data);

    // Re-add "other" category to end of data object
    data.fund_structure.push(other_category);

    let categories = data.fund_structure;

    const MULTIPLIER = 2,  // add height to bars
        SHIFT = 2,  // bar height when data is $0
        margin = {top: 0, right: 0, bottom: 0, left: 0},
        height = 215 - margin.top - margin.bottom + SHIFT,
        colors = get_bar_colors();

    // Select container div
    let container_div = d3.select("#budget_visualization");

    // Select all .bar_wrap divs
    let bar_divs = container_div.append("div").attr("class", "bars").selectAll("svg")
        .data(categories)
        .enter()
        .append("div")
        .attr("class", "bar_wrap");

    // Add SVG element to each .bar_wrap div
    let svgs = d3.selectAll(bar_divs).append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", "100%")
        .attr("y", 0);

    // Add bars to SVG
    let bars = svgs.append("rect")
        .attr("class", "bar")
        .attr("width", "100%")
        .attr("height", d => (100 * MULTIPLIER) + SHIFT)
        .attr("y", d => height - (100 * MULTIPLIER) - SHIFT)
        .attr("x", 0)
        .attr("fill", (d, i) => colors[i % colors.length]);

    // Animate in bars on load
    bars.transition()
        .attr("height", d => (d.user_percentage * MULTIPLIER) + SHIFT)
        .attr("y", d => height - (d.user_percentage * MULTIPLIER) - SHIFT)
        //.delay((d, i) => 200 + i * 100)
        .delay((d, i) => 200)
        .duration(1500)
        .ease(d3.easeCubicOut);

    // Add text elements to SVG to display bar totals
    let bar_totals = svgs.append("text").style("opacity", 0);
    // let bar_totals_dollars = svgs.append("text").style("opacity", 0);

    // Animate in bar totals on load
    bar_totals.html(d => Math.round(d.user_percentage) + "%")
        .transition()
        .attr("y", d => height - (d.user_percentage * MULTIPLIER) - SHIFT - 10)
        .style("opacity", 1)
        .delay((d, i) => 200)
        .duration(1500)
        .ease(d3.easeCubicOut);

    // Display line items below each bar
    bar_divs.append("div")
        .html(function (d, i) {
            content = `<p class="category_name">${d.name}</p>`;
            content += `<a class="category_details">See Details</a>`
            content += `<div class="modal" id="cat${i}">`;
            content += `<div class="modal-content"><span class="close" id="close${i}">&times;</span>`

            content += `<strong><p>${d.name}</p></strong>`;

            if (d.children) {
                content += "<ul>";
                d.children.forEach(function (subdept, index) {
                    content += `<li>${subdept.name}</li>`;

                })
                content += "</ul>";
            }
            content += `</div></div>`

            return content;
        })
        .attr("y", height + margin.bottom);

})();
