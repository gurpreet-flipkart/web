var Table = function(colorScheme) {

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
        this.tableHeader = d3.selectAll("table").append("tr").attr('id', 'header');
        this.tableHeader.selectAll('th').data(this.heads.list).enter().append("th").classed('parameter', true).html(function(d) {
            return d;
        }).style('background-color', function(d) {
            return colorScheme(d);
        }).on('click', function(d) {
            //d is the name of the column here.
            sortingCriteria = sortByColumn(d);
            d3.selectAll('.zonehub').sort(sortingCriteria);
        });
    }



    this.render = function(jsondata, column, sortFunction) {
        console.log('render with column:' + column);
        this.data = jsondata;
        var rowZ = d3.selectAll("table").selectAll(".zonehub").data(this.data, function(d) {
            return d.id;
        });
        renderNewRows(rowZ, column);
        renderExistingRows(rowZ, column);
        //console.log(maxColMap);
        var hub = getMax(column);
        highlightMax(column, hub);
        //validate the constraint that jsondata.length ==selected .column's length
        d3.selectAll('.zonehub').sort(sortFunction);
        //renderOldColumns(rowZ, column);

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
                debug = html;
                if (d.count === hub.count && html !== '') {
                    return true;
                }
                return false;
            }).classed(column + "-max", true)
            .style('background-color', function(d) {
                console.log(d.name);
                match = true;
                return colorScheme(column);
            });
        if (!match) {
            console.log("Warning:" + hub.count + ":" + hub.id + ":" + debug);
        }
        console.log("Updated :" + column + "  with " + hub.count);
    }

    function renderExistingRows(rowZ, column) {
        var cols = rowZ.selectAll('.' + column).data(function(r, i) {
            return [r];
        }, function(d) {
            return d.id;
        });
        cols.html(function(d) {
            return d.count;
        }).classed(column, true);
    }

    function renderOldColumns(rowZ, column) {
        rowZ.exit().remove();
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

        cols.html(function(d) {
            return d.count;
        });
    }


    this.refresh = function(url, column) {
        $.getJSON(url, function(json) {
            this.render(this.data, column);
        });
    }

}