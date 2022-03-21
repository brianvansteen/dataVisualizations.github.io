function UKFoodOpinions() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'UK Food Opinions';
    this.subname = 'Doughnut chart with values';

    // Each visualisation must have a unique ID with no specia characters.
    this.id = 'uk-food';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/ukfood.csv', 'csv', 'header',
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
        this.select.position(width / 2, height - 50); // place dropdown at x, y on canvas
        this.select.style('font-size', '20px');
        this.select.style('color', 'navy');
        this.select.style('background-color', 'lavender');
        this.select.style('text-align', 'center');
        // fill the dropdown options with all opinion values
        var opinions = this.data.columns; // one opinion per column
        for (let i = 1; i < opinions.length; i++) { // index 0 is education levels
            this.select.option(opinions[i]); // each dropdown value
        }
    };

    this.destroy = function() {
        this.select.remove(); // dropdown menue
    };

    // Create a new doughnut chart object, from doughnutChart.js
    this.doughnut = new DoughnutChart(width * 0.35, height / 2, 500);

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Get the value of the opinion we're interested in from the select item.
        var opinion = this.select.value(); // from dropdown menu

        // Get the column of raw data for opinion.
        var col = this.data.getColumn(opinion); // data from loadTable

        // Convert all data strings to numbers.
        col = stringsToNumbers(col);

        // Copy the row labels from the table (the first item of each row).
        var labels = this.data.getColumn(0); // from loadTable; column 0

        // Colour to use for each category.
        var colours = ['#000080', '#800000', '#006400', '#8B008B', '#FF8C00'];

        // Make a title.
        var title = 'Opinion: ' + opinion;

        // Draw the pie chart based on data from above
        this.doughnut.draw(col, labels, colours, title);
    };
}