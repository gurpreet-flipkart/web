var Table = function(colorScheme) {
    //a new Table class.
    this.colorScheme = colorScheme;
    this.columns = ['BRSNR', 'RESORT_EXPECTED', 'OUTBOUND_PENDING', "PROCESS_PENDING", "FCPH_EXPECTED"];
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
            //d3.select(this).style('background-color','green');
        });
    }



    this.render = function(jsondata, column, sortFunction) {
        //here we have the json data for the given column.
        console.log('render with column:' + column);
        this.data = jsondata;
        var rowZ = d3.selectAll("table").selectAll(".zonehub").data(this.data, function(d) {
            return d.id;
        });
        renderNewRows(rowZ, column);
        renderExistingColumns(rowZ, column);
        d3.selectAll('.zonehub').sort(sortFunction);
        var max = d3.max(jsondata, function(d) {
            return d.count;
        });
        console.log(max);
        //find the column with max class.
        //d3.select("." + column + "-max").classed(column + "-max", false).style('background-color', 'white');
       /*d3.selectAll(".zonehub")
            .filter(function(d) {
                return d.count === max;
            }).select('.' + column).classed(column + "-max", true)
            .style('background-color', function(d) {
                return colorScheme(column);
            });*/
        //renderOldColumns(rowZ, column);

    }

    function renderExistingColumns(rowZ, column) {
        var cols = rowZ.selectAll('.' + column).data(function(r, i) {
            return [r.count];
        });
        cols.enter().append('td').html(function(d) {
            return d;
        }).classed(column, true);
        //case where column exists.
        cols.html(function(count) {
            return count;
        });
    }

    function renderOldColumns(rowZ, column) {
        rowZ.exit().remove();
    }


    function renderNewRows(rowZ, column) {
        var that = colorScheme;
        var newRowz = rowZ.enter().append('tr').classed('zonehub', true).attr("id", function(d) {
            return 'h-' + d.id;
        }).on('mouseover', function(d) {
            //d3.select(this).style('background-color', colorScheme(d.zone));
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
            return [r.count];
        });

        cols.html(function(count) {
            return count;
        });
    }


    this.refresh = function(url, column) {
        $.getJSON(url, function(json) {
            this.render(this.data, column);
        });
    }

}