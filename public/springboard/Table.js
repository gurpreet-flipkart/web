var Table = function(colorScheme) {
    
    
    function refresh(column) {
        //derive the url based on the column
        var url = getUrl(column);
        $.getJSON(url, function(json) {
            this.render(this.data, column);
        });
    }

    var maxColMap = new Object();
    //a new Table class.
    this.colorScheme = colorScheme;
    this.columns = ['BRSNR', 'RESORT_EXPECTED', 'OUTBOUND_PENDING', "PROCESS_PENDING", "FCPH_EXPECTED"];
    this.columns.forEach(function(c) {
        maxColMap[c] = -1;
    });
    this.headers = function(headers) {
        this.heads = new Set();
        var that = this;
        headers.forEach(function(d) {
            that.heads.add(d);
        });
        this.columns.forEach(function(d) {
            that.heads.add(d);
        });
        //<span class="glyphicon glyphicon-search" aria-hidden="true"></span>
        this.tableHeader = d3.select("thead").append('tr').attr('id', 'header');
        this.tableHeader.selectAll('th').data(this.heads.list).enter().append("th").html(function(d) {
            return d;
        }).style('background-color', function(d) {
            return colorScheme(d);
        }).on('click', function(d) {
            //d is the name of the column here.
            sortingCriteria = sortByColumn(d);
            d3.selectAll('.zonehub').sort(sortingCriteria);
            d3.select('.parameter').classed('parameter', false);
            d3.select(this).classed('parameter', true);
        }).append('span').classed('glyphicon', true).classed('glyphicon-refresh', true).attr('aria-hidden', true).on('click', function(c){
            refresh(c);
        });
        $('table').stickyTableHeaders( /*{fixedOffset: $('body')}*/ );
    }



    this.render = function(jsondata, column, sortFunction) {
        console.log('render with column:' + column);
        this.data = jsondata;
        var rowZ = d3.select("tbody").selectAll(".zonehub").data(this.data, function(d) {
            return d.id;
        });
        console.log("Present:" + rowZ.size());
        console.log(rowZ.size() + "+" + rowZ.enter().size() + "+" + rowZ.exit().size() + "=" + (rowZ.size() + rowZ.enter().size() + rowZ.exit().size()) + ":" + jsondata.length);
        renderExistingRows(rowZ, column);
        renderNewRows(rowZ, column);
        //console.log(maxColMap);
        var hub = getMax(column);
        highlightMax(column, hub);
        //validate the constraint that jsondata.length ==selected .column's length
        d3.selectAll('.zonehub').sort(sortFunction);
        renderOldRows(rowZ, column);

    }


    function getMax(column) {
        var max = -1;
        var id = -1;
        d3.selectAll("." + column).each(function(d) {
            if (d3.select(this).html() !== '') {
                var count = parseInt(d3.select(this).html());
                if (count > max) {
                    max = count;
                    id = d.id;
                }
            }
        });
        console.log("max for " + column + ": " + max);
        return {
            count: max,
            id: id
        };
    }

    function highlightMax(column, hub) {
        d3.select("." + column + "-max").classed(column + "-max", false).style('background-color', 'white');
        var match = false;
        var debug = "";
        d3.selectAll("." + column)
            .filter(function(d) {
                var html = d3.select(this).html();
                var value = 0;
                if (!isNaN(html)) {
                    value = parseInt(html);
                    if (value === hub.count) {
                        return true;
                    }
                }
                return false;
            }).classed(column + "-max", true)
            .style('background-color', function(d) {
                console.log(d.name);
                match = true;
                return colorScheme(column);
            });
        if (!match) {
            console.error("Warning:" + hub.count + ":" + hub.id + ":" + debug);
        }
        console.log("Updated :" + column + "  with " + hub.count);
    }

    function renderExistingRows(rowZ, column) {
        console.log("Present:" + rowZ.size());
        var cols = rowZ.selectAll('.' + column).data(function(r, i) {
            return [r];
        }, function(d) {
            return d.id;
        });
        console.log(rowZ.size() + "=" + cols.size());
        cols.html(function(d) {
            return d.count;
        }).classed(column, true).call(show, 'orange', 0);
    }

    function renderOldRows(rowZ, column) {
        console.log("Not updated :" + rowZ.exit().size());
        rowZ.exit().selectAll('.' + column).filter(function(d) {
            var html = d3.select(this).html();
            return html !== '';
        }).call(show, 'blue', 0);
    }


    function renderNewRows(rowZ, column) {
        var that = colorScheme;
        var newRowz = rowZ.enter().append('tr').classed('zonehub', true).attr("id", function(d) {
            return 'h-' + d.id;
        }).on('mouseover', function(d) {
            d3.select(this).style('opacity', 1.0);
        }).on('mouseout', function(d) {
            d3.select(this).style('opacity', 0.75);
        }).style('opacity', 0.75);
        //adding new column for zone.
        newRowz.append('td')
            .html(function(d) {
                return d.zone;
            })
            .style('background-color', function(m) {
                return colorScheme(d3.select(this).html());
            })
            .classed('zone', true);
        //adding new column for hub.
        newRowz.append('td').html(function(d) {
            return d.name;
        }).classed("hub", true);
        this.columns.forEach(function(col) {
            newRowz.append('td').classed(col, true);
        });
        var cols = newRowz.selectAll('.' + column).data(function(r, i) {
            return [r];
        }, function(d) {
            return d.count;
        });
        console.log(rowZ.enter().size() + "=" + cols.size());
        cols.html(function(d) {
            return d.count;
        }).call(show, 'green', 0);
    }

    function show(cur, color, delay) {
        //alert(color);
        this.style({
            "border-right-width": '3px',
            "border-right-color": color
        });
        /*.transition().duration(2500).delay(delay).style({
                    "border-right-width": '1px',
                    "border-right-color": 'grey'
                });*/
    }



    function getUrl(column) {
        return column;
    }

}