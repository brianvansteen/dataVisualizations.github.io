function Box(x, y, boxWidth, boxHeight, beverage) {
    this.x = x;
    this.y = y;
    this.boxWidth;
    this.boxHeight;

    this.beverage = beverage; // each beverage

    this.mouseOver = function(mouseX, mouseY) {
        if (mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + heigth) {
            return this.category.name;
        } else
            return false;
    }

    this.draw = function() {
        fill(beverage.colour);
        rect(x, y, boxWidth, boxHeight);
    }
}