describe("chartStream", function() {
  var context = {};

  beforeEach(function() {
    context.chart = chartStream();
  });

  sharedBehaviorForCharts(context);

  describe("configure()", function() {
    it("hides x axis ticks if showXAxis(false) was called", function() {
      var nvChart = context.chart.showXAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual(null);
    });

    it("hides y axis ticks if showYAxis(false) was called", function() {
      var nvChart = context.chart.showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual(null);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });

    it("hides all axis ticks if showXAxis(false) and showYAxis(false) were both called", function() {
      var nvChart = context.chart.showXAxis(false).showYAxis(false).configure();
      expect(nvChart.xAxis.tickValues()).toEqual([]);
      expect(nvChart.yAxis.tickValues()).toEqual([]);
    });
  });
});
