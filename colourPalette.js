//Displays and handles the colour palette.
function ColourPalette() {
    //a list of web colour strings
    this.colours = ["black", "silver", "gray", "white", "maroon", "red", "purple",
        "orange", "pink", "fuchsia", "green", "lime", "olive", "yellow", "navy",
        "blue", "teal", "aqua", "coral", "darkseagreen",
    ];
    //make the start colour be black
    this.selectedColour = "black";

    var self = this; // for anonymous functions

    var colourClick = function() {
        //remove the old border
        var current = select("#" + self.selectedColour + "Swatch");
        current.style("border", "0"); // set CSS border to 0

        //get the new colour from the id of the clicked element
        var c = this.id().split("Swatch")[0]; // split id at 'Swatch' and take 0 value, i.e. id redSwatch

        //set the selected colour and fill and stroke
        self.selectedColour = c;
        fill(c);
        stroke(c);

        //add a solid blue border to the colour selected, to highlight the selected colour
        this.style("border", "2px solid blue"); // add CSS border
    }

    //load in the colours
    this.loadColours = function() {
        //set the fill and stroke properties to be black at the start of the programme running
        fill(this.colours[0]);
        stroke(this.colours[0]);

        //for each colour create a new div in the html for the colourSwatches
        for (var i = 0; i < this.colours.length; i++) {
            var colourID = this.colours[i] + "Swatch"; // div id, i.e. greenSwatch

            //using p5.dom add the swatch to the palette and set its colour to be the colour value.
            var colourSwatch = createDiv()
            colourSwatch.class('colourSwatches'); // div class colourSwatches
            colourSwatch.id(colourID); // div id is colour value from line 38 above

            select(".colourPalette").child(colourSwatch); // select class 'box colourPalette' child div
            select("#" + colourID).style("background-color", this.colours[i]); // select div id, colour the box
            colourSwatch.mouseClicked(colourClick) // event handler to change selected colour
        }

        select(".colourSwatches").style("border", "2px solid blue");
    };
    //call the loadColours function now that it is declared
    this.loadColours();
}