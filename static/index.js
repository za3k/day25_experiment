'use strict';
let failures = {};
let maxTimeMs = 100; // in ms
let maxArraySize = 1000;

function bubbleSort1() { // Unoptimized bubble-sort
    let swapped;
    do {
        swapped = false;
        for (let i=1; i<this.length; i++) {
            if (this.cmp(i-1, i) > 0) {
                this.swap(i-1, i);
                swapped = true;
            }
        }
    } while (swapped);
}
function bubbleSort2() { // Optimized bubble-sort
    let swapped,j=this.length;
    do {
        swapped = false;
        for (let i=1; i<j; i++) {
            if (this.cmp(i-1, i) > 0) {
                this.swap(i-1, i);
                swapped = true;
            }
        }
        j--;
    } while (swapped);
}

function customSort() { // Write your own!
    // no direct access is provided to the array, so we can easily count compares and swaps

    // this.cmp(index1, index2) returns -1, 0, or 1
    // this.swap(index1, index2) swaps two indices
}

function quickSort1() { // Pivot on the last element
    function _quickSort(lo, hi) { // Inclusive
        if (lo >= hi) return;
        const pivotIndex = _quickPartition.bind(this)(lo, hi);
        _quickSort.bind(this)(lo, pivotIndex-1);
        _quickSort.bind(this)(pivotIndex+1, hi);
    }
    function _quickPartition(lo, hi) { // Inclusive
        const pivot = hi;
        let j = lo-1;
        for (let i=lo; i<hi; i++) {
            if (this.cmp(i, pivot) <= 0) this.swap(i, ++j)
        }
        this.swap(++j, pivot);
        return j;
    }
    return _quickSort.bind(this)(0, this.length-1);
}

function insertionSort() {
    let i=1, j;
    while (i<this.length) {
        j=i;
        while (j > 0 && this.cmp(j-1,j)>0) {
            this.swap(j,j-1)
            j--;
        }
        i++
    }
}

(() => {
    function editFunc(name, text) {
        try {
            const value = eval("(" + text + ")");
            window[name] = value;
        } catch (e) {
            $(".error").text(e);
            return;
        }
        $(".error").text(null);
    }

    function loadFunction(name) {
        const f = window[name];
        const source = f.toString();
        $(".formula")[0].value=source;
    }

    function loadSelected() {
        const selection = $(".algorithm-name").val();
        loadFunction(selection);
        $(".formula").toggleClass("failing", !!failures[$(".algorithm-name").val()]);
    }

    function saveSelected() {
        const selection = $(".algorithm-name").val();
        const code = $(".formula").val();
        editFunc(selection, code);
    }

    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    function makeSwap(array) {
        if (typeof(array) != "object") throw "makeSwap should be called only on arrays";
        const swap = (i, j) => {
            swap.count++;
            const tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }
        swap.count = 0;
        return swap;
    }
    function makeCmp(array) {
        if (typeof(array) != "object") throw "makeCmp should be called only on arrays";
        const cmp = (i, j) => {
            cmp.count++;
            if (array[i] == array[j]) return 0;
            else if (array[i] < array[j]) return -1;
            else return 1;
        }
        cmp.count = 0;
        return cmp;
    }

    function randomArray(n) {
        const A = [];
        for (let i=0; i<n; i++) A[i] = Math.random();
        return A;
    }
    function isOrdered(A) {
        for (let i=0; i<A.length-1; i++) {
            if (A[i-1] > A[i]) return false
        }
        return true;
    }
    function _doSort(algorithm, A) {
        const length = A.length;
        const name = algorithm.name;
        const o = {
            length,
            swap: makeSwap(A),
            cmp: makeCmp(A),
        };
        const before = Date.now();
        const r = algorithm.bind(o)();
        const after = Date.now();
        const ms = after-before;
        const success = isOrdered(A);
        const swaps = o.swap.count;
        const comparisons = o.cmp.count;
        const operations = swaps + comparisons;
        return { name, ms, success, comparisons, swaps, operations, length, algorithm, A };
    }
    function doSortN(S, n) {
        if (n > S.maxsize) return null;
        const r = _doSort(S, randomArray(n));
        if (r.ms > maxTimeMs) S.maxsize = n;
        return r;
    }
    window.doN = doSortN

    // Adapted from https://d3-graph-gallery.com/graph/line_basic.html and https://d3-graph-gallery.com/graph/line_several_group.html
    // Updated using https://observablehq.com/@d3/d3-group
    function lineChart(data, {
        div = d3.select(".results"),
        x,
        xScale = d3.scaleLinear,
        y,
        yScale = d3.scaleLinear,
        z,
        title,
        margin = {
            top: 50,
            right: 30,
            bottom: 30,
            left: 60
        },
        width = 640,
        height = 500,
        rwidth = width - margin.left -margin.right,
        rheight = height - margin.top - margin.bottom,
    } = {}) {
        // A basic box
        const svg = div.append("svg")
            .attr("width", rwidth + margin.left + margin.right)
            .attr("height", rheight + margin.top + margin.bottom)
            .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        const legend = div.append("svg");

        // Separate into lines
        var sumstat = d3.group(data, d=> z(d));
        
        // x axis
        var xs = xScale()
            .domain(d3.extent(data, x))
            .clamp(true)
            .range([0, rwidth]);
        svg.append("g")
            .attr("transform", `translate(0, ${rheight})`)
            .call(d3.axisBottom(xs));//.ticks(5));

        // y axis
        var ys = yScale()
            .domain([1, d3.max(data, y)])
            .clamp(true)
            .range([rheight, 0]);
        svg.append("g")
            .call(d3.axisLeft(ys));

        // color palette
        var color = d3.scaleOrdinal()
            .domain(sumstat.keys())
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#8f8f33','#a65628','#f781bf','#999999']);

        if (title) {
            svg.append("text")
                .attr("x", (rwidth/2))
                .attr("y", -(margin.top / 2))
                .attr("text-anchor", "middle")
                .style("text-decoration", "underline")
                .style("font-size", "16px")
                .text(title);
        }

        svg.selectAll(".line")
            .data(sumstat)
            .enter().append("path")
                .attr("fill", "none")
                .attr("stroke", ([k,v]) => color(k))
                .attr("stroke-width", 1.5)
                .attr("d", ([k,values]) => {
                    return d3.line()
                        .x(d => xs(x(d)))
                        .y(d => ys(y(d)))
                        (values)
                })
                .append("title")
                    .text(([k,v])=>k)

        const size = 20;
        legend.selectAll(".legend-dot")
            .data(sumstat)
            .enter().append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => 0+i*(size+5))
                .attr("width", size)
                .attr("height", size)
                .style("fill", ([k,v]) => color(k));
        legend.selectAll(".legend-label")
            .data(sumstat)
            .enter().append("text")
                .attr("x", 0 + size*1.2)
                .attr("y", (d, i) => 0+i*(size+5) + size/2)
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("fill", ([k,v]) => color(k))
                .text(([k, v]) => {
                    if (failures[k]) return `${k} (failing)`;
                    else return k;
                })
        legend
            .attr("height", (size+5) * sumstat.size);

        return div.node();
    }

    function update() {
        const algorithms = window.algorithms = Object.keys(window).filter(x=>x.includes("Sort")).sort().map(x=>window[x]);
        d3.select(".algorithm-name")
            .selectAll("option")
            .data(algorithms)
            .enter().append("option")
                //.attr("selected", (a,i)=>i==0)
                .text(a=>a.name)
                .attr("value", a=>a.name);

        const allData = window.allData = [];
        const content = $(".content");
        failures = {};
        const width = content.width();
        const logStep = 1.1; // 25 steps per power of 10
        const max = Math.floor(Math.log(maxArraySize)/Math.log(logStep));
        const Ns = [...Array(max).keys()].map(n=>Math.floor(Math.pow(logStep,n)));
        //const Ns = [...Array(100).keys()];
        algorithms.forEach(function(S) {
            const data = Ns.map(n=>doSortN(S,n));
            data.forEach(x => {
                if (x && x.success) allData.push(x);
                if (!x.success) failures[S.name]=1;
            })
        });
        /*
        Ns.forEach((i) => {
            allData.push({
                length: i,
                operations: i,
                name: "O(n)",
            })
            allData.push({
                length: i,
                operations: i*Math.log(i),
                name: "O(n log n)",
            })
            allData.push({
                length: i,
                operations: i*i,
                name: "O(n^2)",
            })
        });
        */

        d3.selectAll(".results").selectChildren().remove();
        ["operations"].forEach(metric =>
            lineChart(allData, {
                div: d3.select(".results.linear"),
                title: `sort time (${metric})`,
                x: d => d.length,
                y: d => d[metric],
                z: d => d.name,
                width,
                height: 400,
            })
        );
        ["operations"].forEach(metric =>
            lineChart(allData, {
                div: d3.select(".results.log-log"),
                title: `sort time (${metric}) - log-log`,
                x: d => d.length,
                y: d => d[metric],
                xScale: d3.scaleLog,
                yScale: d3.scaleLog,
                z: d => d.name,
                width,
                height: 400,
            })
        );
        $(".formula").toggleClass("failing", !!failures[$(".algorithm-name").val()]);
    }

    function docReady(fn) { // https://stackoverflow.com/questions/9899372/vanilla-javascript-equivalent-of-jquerys-ready-how-to-call-a-function-whe. Avoiding jquery because it's messing up error display
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }
    function main() {
        update();

        $(".algorithm-name").on("input", loadSelected);
        loadSelected();        

        $(".update").on("click", () => {
            saveSelected();
            update();
        });

        $("#maxTimeMs").on("input", a => maxTimeMs=Number(a) );
        $("#maxTimeMs")[0].value = maxTimeMs;

        $("#maxArraySize").on("input", a => maxArraySize=Number(a) );
        $("#maxArraySize")[0].value = maxArraySize;
    }
    docReady(main);
})();

