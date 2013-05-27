describe("chartBarHorizontal", function() {
  var chart;

  beforeEach(function() {
    chart = chartBarHorizontal()
  });

  describe("data()", function() {
    it("should return an empty array when called on a new chart", function() {
      expect(chart.data()).toEqual([]);
    });

    it("should set the data on the chart when called with an argument", function() {
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
  });

  describe("configure()", function() {
    it("should configure the chart to show value labels and axis ticks", function() {
      var nvChart = chart.configure();
      expect(nvChart.showValues()).toEqual(true);
      expect(nvChart.xAxis.tickValues()).toEqual(null); // if null, the D3 axis generates its own tick values
      expect(nvChart.yAxis.tickValues()).toEqual(null); // if null, the D3 axis generates its own tick values
    });

    it("should hide x axis ticks if showXAxis(false) was called", function() {
      var nvChart = chart.showXAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual(null);
    });

    it("should hide y axis ticks if showYAxis(false) was called", function() {
      var nvChart = chart.showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual(null);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });

    it("should hide all axis ticks if showAxes(false) was called", function() {
      var nvChart = chart.showAxes(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });

    it("should hide all axis ticks if showXAxis(false) and showYAxis(false) were both called", function() {
      var nvChart = chart.showXAxis(false).showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });
  });
});
