beforeEach(function() {
  
});

function sharedBehaviorForCharts(context) {
  describe("(shared)", function() {
    var chart;

    beforeEach(function() {
      chart = context.chart;
    });
    
    describe("data()", function() {
      it("when called with no arguments, returns an empty array for a new chart", function() {
        expect(chart.data()).toEqual([]);
      });

      it("when called with one argument, sets the data on the chart", function() {
        var testData = [{
          key: "Test data",
          values: [ [1,1], [2,1] ]
        }];
        chart.data(testData)
        expect(chart.data()).toEqual(testData);
      });

      it("when called with one argument, returns the chart for method chaining", function() {
        expect(chart.data([])).toEqual(chart);
      });
    });

    describe("showXAxis()", function() {
      it("when called with no arguments, returns true for a new chart", function() {
        expect(chart.showXAxis()).toEqual(true);
      });

      it("when called with one argument, sets showXAxis on the chart", function() {
        chart.showXAxis(false);
        expect(chart.showXAxis()).toEqual(false);
      });

      it("when called with one argument, returns the chart for method chaining", function() {
        expect(chart.showXAxis(false)).toEqual(chart);
      });
    });

    describe("showYAxis()", function() {
      it("when called with no arguments, returns true for a new chart", function() {
        expect(chart.showYAxis()).toEqual(true);
      });

      it("when called with one argument, sets showYAxis on the chart", function() {
        chart.showYAxis(false);
        expect(chart.showYAxis()).toEqual(false);
      });

      it("when called with one argument, returns the chart for method chaining", function() {
        expect(chart.showYAxis(false)).toEqual(chart);
      });
    });
  });
}
