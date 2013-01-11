<!DOCTYPE html>
<html>
  <head>
    <title>Chapter {{chapter}}</title>
    <script type="text/javascript" src="/lib/d3/d3.v2.min.js"></script>
    <script type="text/javascript" src="/assets/js/coappear/force.js"></script>
    <link type="text/css" rel="stylesheet" href="/assets/css/coappear/force.css"/>
  </head>
  <body>
    <div id="stack"></div>
    <div id="chart"></div>
    <script type="text/javascript">
      coappear("./data/chapter{{chapter}}.json");
    </script>
  </body>
</html>
