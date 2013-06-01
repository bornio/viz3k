describe("chartBarHorizontal", function() {
  var chart;

  beforeEach(function() {
    chart = chartBarHorizontal()
  });

  describe("data()", function() {
    it("when called with no arguments, returns an empty array for a new chart", function() {
      expect(chart.data()).toEqual([]);
    });

    it("when called with one argument, sets the data on the chart", function() {
      var testData = [{
        key: "Test data",
        color: "#6699cc",
        values: [
          { label: "value1", color: "#ff00ff", value: 5 },
          { label: "value2", color: "#ffff00", value: 8 }
        ]
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

  describe("configure()", function() {
    it("configures the chart to show value labels and axis ticks", function() {
      var nvChart = chart.configure();
      expect(nvChart.showValues()).toEqual(true);
      expect(nvChart.xAxis.tickValues()).toEqual(null); // if null, the D3 axis generates its own tick values
      expect(nvChart.yAxis.tickValues()).toEqual(null); // if null, the D3 axis generates its own tick values
    });

    it("hides x axis ticks if showXAxis(false) was called", function() {
      var nvChart = chart.showXAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual(null);
    });

    it("hides y axis ticks if showYAxis(false) was called", function() {
      var nvChart = chart.showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual(null);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });

    it("hides all axis ticks if showXAxis(false) and showYAxis(false) were both called", function() {
      var nvChart = chart.showXAxis(false).showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });
  });
});
