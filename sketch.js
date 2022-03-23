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
    gallery.addVisual(new HousePricing()); // linear regression analysis
    gallery.addVisual(new Beverages()); // bubble chart
    gallery.addVisual(new EducationLabels()); // education pie chart
    gallery.addVisual(new UKFoodOpinions()); // doughnut chart
    gallery.addVisual(new PayGapTimeSeries()); // line graph
    gallery.addVisual(new UKFoodNutrients()); // multi-line graph
    gallery.addVisual(new ClimateChange()); // line graph
}

function draw() {
    background(255, 250, 240); // canvas colour
    if (gallery.selectedVisual != null) { // based on mouseClicked in gallery.js; assiged visual id
        gallery.selectedVisual.draw();
    }
}