// Global variable to store the gallery object. The gallery object is a container for all the visualisations.
var gallery;

function setup() {
    // Create a canvas to fill the content div from index.html.
    canvasContainer = select('#app');
    var c = createCanvas(1200, 800);
    c.parent('app'); // top DOM element

    // Create a new gallery object.
    gallery = new Gallery();

    // Add the visualisation objects here.
    gallery.addVisual(new Bollinger()); // Bollinger bands
    gallery.addVisual(new HousePricing()); // NEW regression analysis
    gallery.addVisual(new Beverages());
    gallery.addVisual(new Education()); // NEW education pie chart
    gallery.addVisual(new EducationLabels()); // NEW education pie chart
    gallery.addVisual(new PayGapTimeSeries());
    gallery.addVisual(new UKFoodOpinions());
    gallery.addVisual(new UKFoodNutrients());
    gallery.addVisual(new ClimateChange());

    //gallery.addVisual(new Waffle());
}

function draw() {
    background(250, 250, 210);
    if (gallery.selectedVisual != null) { // based on mouseClicked in gallery.js; assiged visual id
        gallery.selectedVisual.draw();
    }
}