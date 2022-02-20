function Gallery() {

    this.visuals = []; // private property
    this.selectedVisual = null; // public property; null until mouseClicked
    var self = this;

    // Add a new visualisation to the navigation bar.
    this.addVisual = function(vis) { // from sketch.js, input is vis; i.e. new Bollinger()

        // Check that the vis object has an id and name.
        if (!vis.hasOwnProperty('id') &&
            !vis.hasOwnProperty('name')) { // JS method checking for property
            alert('Make sure your visualisation has an id and name!');
        }

        // Check that the vis object has a unique id.
        if (this.findVisIndex(vis.id) != null) {
            alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
        }

        this.visuals.push(vis);

        // Create menu item.
        var menuItem = createElement('li', vis.name); // p5.js createElement(), for the DOM, using <li>
        menuItem.addClass('menu-item'); // add CSS class
        menuItem.id(vis.id); //id of visual from sketch.js; i.e. bollinger.id 'TSLA-stock-price'

        menuItem.mouseOver(function(e) {
            var el = select('#' + e.srcElement.id); //i.e. #TSLA-stock-price
            el.addClass("hover"); // add CSS 'hover' class
        })

        menuItem.mouseOut(function(e) {
            var el = select('#' + e.srcElement.id);
            el.removeClass("hover"); // remove CSS class
        })

        menuItem.mouseClicked(function(e) {
            //remove selected class from any other menu-items
            var menuItems = selectAll('.menu-item');

            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].removeClass('selected'); // de-select previous menu item used
            }

            var el = select('#' + e.srcElement.id); // searches for matching element
            el.addClass('selected'); // add CSS 'selected' class

            self.selectVisual(e.srcElement.id); // call selectVisual with id, i.e. TSLA-stock-price
        })

        var visMenu = select('#visuals-menu'); // class from index.html; line 34 <ul>
        visMenu.child(menuItem); // p5.js child method; attach menuItem to DOM class visuals-menu

        if (vis.hasOwnProperty('preload')) { // preload data if necessary
            vis.preload(); // call preload
        }
    }; // end addVisual

    this.findVisIndex = function(visId) {
        // search through the visualisations array looking for postion with the id matching visId
        for (var i = 0; i < this.visuals.length; i++) {
            if (this.visuals[i].id == visId) {
                return i;
            }
        }
        return null; // visualisation not found
    };

    this.selectVisual = function(visId) { // call from mouseClicked, using id, i.e. TSLA-stock-price
        var visIndex = this.findVisIndex(visId); // call findVisIndex constructor; return index 'i'

        if (visIndex != null) {
            // If the current visualisation has a de-select method run it.
            if (this.selectedVisual != null &&
                this.selectedVisual.hasOwnProperty('destroy')) {
                this.selectedVisual.destroy(); // i.e. different pie charts
            }
            // Select the visualisation in the gallery.
            this.selectedVisual = this.visuals[visIndex]; // used in sketch.js to call draw

            // Initialise visualisation if necessary.
            if (this.selectedVisual.hasOwnProperty('setup')) { // JS boolean method
                this.selectedVisual.setup(); // run setup of selected visual
            }

            loop(); // enable animation in case it has been paused by the current visualisation
        }
    };
}