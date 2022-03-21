function PieChartLabels(x, y, diameter) {

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 40;

    this.draw = function(data, labels, colours, title) {
        // Test that data is not empty and that each input array is the same length.
        if (data.length == -0) {
            alert('Data has length zero!');
        } else if (![labels, colours].every((array) => {
                return array.length == data.length;
            })) {
            alert(`Data (length: ${data.length})
          Labels (length: ${labels.length})
          Colours (length: ${colours.length})
          Arrays must be the same length!`);
        }

        let start = 0; // start at 0
        let total = data.reduce((v, s) => v + s, 0); // total of inputs in data array
        let anglesHover = data.map(v => v / total * 360); // create new array of percentages (value / total); calculated in degrees

        if (title) {
            noStroke();
            textAlign('center', 'center');
            fill(0, 0, 128);
            textSize(32);
            text(title, 300, this.y - this.diameter * 0.59);
        }
        push(); // do following calculations, i.e. degrees, versus radians in other extensions

        angleMode(DEGREES); // circle calculations in degrees
        let mouseAngle = atan2(mouseY - this.x, mouseX - this.y); // calculate angle in degrees; same as angleBetween()
        if (mouseAngle < 0) {
            mouseAngle += 360; // if angle is negative, make positive by adding 360 degrees
        }

        let mouseDist = dist(this.x, this.y, mouseX, mouseY); // mouse position
        for (let i = 0; i < anglesHover.length; i++) { // iterate through anglesHover array
            push();

            stroke(50); // circumfrance line
            strokeWeight(4); // circumfrance line

            let hover = mouseDist < this.diameter &&
                mouseAngle >= start &&
                mouseAngle < start + anglesHover[i];
            fill(red(colours[i]), green(colours[i]), blue(colours[i]), hover ? 255 : 100); // adjust opacity based on mouse position
            arc(this.x, this.y, // calculated in degrees; display pie value
                this.diameter, this.diameter,
                start, start + anglesHover[i]); // start at 0 degrees, add anglesHover value in degrees
            if (mouseDist < this.diameter * 0.5) { // check if mouse hovering over piechart, less than circumfrance
                if (mouseAngle >= start &&
                    mouseAngle < start + anglesHover[i]) { // check if mouse is hoveing over specific pie slice
                    push();
                    fill(255);
                    noStroke();
                    textSize(30)
                    text(int(data[i]) + "%", mouseX, mouseY); // pie slice value printed over slice as mouse hovers
                    pop();
                }
            }
            start += anglesHover[i]; // increment pie slices
            pop();
            if (labels) { // add legend based on description of each pie value
                this.makeLegendItem(labels[i], i, colours[i]); // call function below for each i
            }
        }
        pop();

    }; // end draw

    this.makeLegendItem = function(label, i, colour) { // add legend based on description of each pie value
        let x = this.x + 100 + this.diameter / 2;
        let y = this.y + (this.labelSpace * i) - this.diameter / 4;
        let boxWidth = this.labelSpace / 2;
        let boxHeight = this.labelSpace / 2;

        fill(colour);
        rect(x, y, boxWidth, boxHeight);

        fill('black');
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(18);
        textWrap(WORD);
        text(label, x + boxWidth + 10, y + boxWidth / 2);
    }; // end legend items

} // end PieChart