function Education() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'Canadian Education';
    this.subname = '(pie chart)';

    // Each visualisation must have a unique ID with no specia characters.
    this.id = 'level-of-education';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // preload the data, called automatically by the gallery when a visualisation is added
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/education/Canada.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.select = createSelect(); // create dropdown menu in DOM
        this.select.position(400, height - 50); // place dropdown at x, y on canvas
        this.select.style('font-size', '20px');
        this.select.style('color', 'navy');
        this.select.style('background-color', 'lavender');
        this.select.style('text-align', 'center');
        // fill the dropdown options with all geography values
        var geographies = this.data.columns; // one geography per column
        for (let i = 1; i < geographies.length; i++) { // index 0 is education levels
            this.select.option(geographies[i]); // each dropdown value
        }
    };

    this.destroy = function() {
        this.select.remove(); // dropdown menue
    };

    // Create a new pie chart object, from pie-chart.js
    this.pie = new PieChart(width * 0.35, height / 2, 500); // x, y, diameter

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Get the value of the geography we're interested in from the select item.
        var geography = this.select.value(); // from dropdown menu

        // Get the column of raw data for geography.
        var col = this.data.getColumn(geography); // data from loadTable

        // Convert all data strings to numbers.
        col = stringsToNumbers(col);

        // Copy the row labels from the table (the first item of each row).
        var labels = this.data.getColumn(0); // from loadTable; column 0

        // Colour to use for each category.
        var colours = ['#000080', '#800000', '#006400', '#FF1493', '#8B008B', '#FF8C00'];

        // Make a title.
        var title = 'Level of education for: ' + geography;

        // Draw the pie chart based on data from above
        this.pie.draw(col, labels, colours, title);
    };
}