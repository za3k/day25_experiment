'use strict';
function bubbleSort1() {
    // Unoptimized bubble-sort
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

function quickSort() {
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

(() => {
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
        return _doSort(S, randomArray(n));
    }

    jQuery.readyException = function(error) {
        throw error;
    }

    // Taken from https://observablehq.com/@d3/bar-chart
    function BarChart(data, {
        x = (d, i) => i,
        y = d => d,
        title,
        marginTop = 20,
        marginRight = 0,
        marginBottom = 30,
        marginLeft = 40,
        width = 640,
        height = 500,
        xDomain,
        xRange = [marginLeft, width - marginRight],
        yType = d3.scaleLinear,
        yDomain,
        yRange = [height - marginBottom, marginTop],
        xPadding = 0.1,
        yFormat,
        yLabel,
        color = "currentColor"
    } = {}) {
        const X = d3.map(data, x);
        const Y = d3.map(data, y);

        // Compute default domains, and unique the x-domain.
        if (xDomain === undefined) xDomain = X;
        if (yDomain === undefined) yDomain = [0, d3.max(Y)];
        xDomain = new d3.InternSet(xDomain);

        // Omit any data not present in the x-domain.
        const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

        // Construct scales, axes, and formats.
        const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

        // Compute titles.
        if (title == undefined) {
            const formatValue = yScale.tickFormat(100, yFormat);
            title = i => `${X[i]}\n${formatValue(Y[i])}`;
        } else {
            const O = d3.map(data, d => d);
            const T = title;
            title = i => T(O[i], i, data);
        }

        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));

        const bar = svg.append("g")
            .attr("fill", color)
            .selectAll("rect")
            .data(I)
            .join("rect")
                .attr("x", i=> xScale(X[i]))
                .attr("y", i=> yScale(Y[i]))
                .attr("height", i=>yScale(0) - yScale(Y[i]))
                .attr("width", xScale.bandwidth());

        if (title) bar.append("title")
            .text("title");

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        return svg.node();
    }

    const algorithms = Object.keys(window).filter(x=>x.includes("Sort")).map(x=>window[x]);
    function main() {
        algorithms.forEach(function(S) {
            const content = $(".content");
            const width = content.width();
            const data = [...Array(100).keys()].map(n=>({
                x: n,
                ...doSortN(S, n)
            }));

            const chart = BarChart(data, {
                x: d => d.x,
                y: d => d.operations,
                yLabel: "operations",
                width,
                height: 500,
                title: `${S.name}`,
                color: "steelblue"
            })
            $(".content").append($(chart));
        })
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
    docReady(main);
})();

