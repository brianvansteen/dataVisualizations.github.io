function Waffle(x, y, waffleWidth, waffleHeight, boxesWidth, boxesHeight, table, columnHeading, possibleValues) {

    // description for the visualisation to appear in the menu bar.
    this.name = 'Daily Beverages';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'daily-beverages';

    // layout object to store all common plot layout parameters and methods.
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
        leftMargin: 130,
        rightMargin: width,
        topMargin: 30,
        bottomMargin: height,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };


    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/finalData.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };


    this.setup = function() {

        this.x = x;
        this.y = y;
        this.waffleWidth = waffleWidth;
        this.waffleHeight = waffleHeight;
        this.boxesWidth = boxesWidth;
        this.boxesHeight = boxesHeight;

        this.column = this.data.getColumn(columnHeading);
        this.possibleValues = possibleValues;

        this.colours = ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'teal', 'cyan', 'maroon'];

        this.beverages = [];
        this.boxes = [];
    }


    this.categoryLocation = function(categoryName) {
        for (var i = 0; i < beverages.length; i++) {
            if (categoryName == beverages[i].name) {
                return i;
            }
        }
        return -1;
    }

    this.addCategories = function() {
        for (var i = 0; i < possibleValues.length; i++) {
            beverages.push({
                "name": possibleValues[i],
                "count": 0,
                "colour": colours[i % colours.length],
            })
        }
        for (var i = 0; i < column.length; i++) {
            var catLocation = categoryLocation(column[i])
            if (catLocation != -1) {
                beverages[catLocation].count++
            }
        }
        for (var i = 0; i < beverages.length; i++) {
            beverages[i].boxes = round((beverages[i].count / column.length) *
                (boxesHeight * boxesWidth));
        }
    }

    this.addBoxes = function() {
        var currentBeverage = 0
        var currentBeverageBox = 0
        var boxWidth = width / boxesWidth;
        var boxHeight = height / boxesHeight;
        for (var i = 0; i < boxesHeight; i++) {
            boxes.push([]);
            for (var j = 0; j < boxesWidth; j++) {
                if (currentBeverageBox == beverages[currentBeverage].boxes) {
                    currentBeverageBox = 0;
                    currentBeverage++;
                }
                boxes[i].push(new Box(x + (j * boxWidth),
                    y + (i * boxHeight),
                    boxWidth,
                    boxHeight,
                    beverages[currentBeverage]));
                currentBeverageBox++;
            }
        }
    }

    addCategories();
    addBoxes();

    this.draw = function() {
        for (var i = 0; i < boxes.length; i++) {
            for (var j = 0; j < boxes[i].length; j++) {
                boxes[i][j].draw();
            }
        }
    }

    this.checkMouse = function(mouseX, mouseY) {
        for (var i = 0; i < boxes.length; i++) {
            for (var j = 0; j < boxes[i].length; j++) {
                var mouseOver = boxes[i][j].mouseOver(mouseX, mouseY);
                if (mouseOver != false) {
                    push();
                    fill(0);
                    textSize(20);
                    var tWidth = textWidth(mouseOver);
                    textAlign(LEFT, TOP);
                    rect(mouseX, mouseY, tWidth + 20, 40);
                    fill(255);
                    text(mouseOver, mouseX + 10, mouseY + 10);
                    pop();
                    break;
                }
            }
        }
    }

}