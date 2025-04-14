import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

export default function CategoryExpenseChart({ categories }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setContainerWidth(wrapperRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!categories || categories.length === 0 || containerWidth === 0) return;

    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(categories.map((d) => d.name))
      .range([0, width])
      .padding(0.2);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const maxValue = d3.max(categories, (d) => Math.max(d.budget, d.actual));
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar-budget")
      .data(categories)
      .enter()
      .append("rect")
      .attr("class", "bar-budget")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.budget))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - y(d.budget))
      .attr("fill", "#377eb8");

    svg
      .selectAll(".bar-actual")
      .data(categories)
      .enter()
      .append("rect")
      .attr("class", "bar-actual")
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.actual))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - y(d.actual))
      .attr("fill", (d) => (d.actual > d.budget ? "#e41a1c" : "#4daf4a"));

    svg
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", 10)
      .attr("r", 6)
      .style("fill", "#377eb8");
    svg
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", 30)
      .attr("r", 6)
      .style("fill", "#4daf4a");
    svg
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", 50)
      .attr("r", 6)
      .style("fill", "#e41a1c");
    svg
      .append("text")
      .attr("x", width - 100)
      .attr("y", 10)
      .text("Budget")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", width - 100)
      .attr("y", 30)
      .text("Within Budget")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", width - 100)
      .attr("y", 50)
      .text("Over Budget")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }, [categories, containerWidth]);

  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="p-6 rounded-xl shadow-lg bg-white flex flex-col justify-center items-start"
      ref={wrapperRef}
    >
      <h2 className="text-lg font-bold mb-2">
        Category Budget vs. Spending
      </h2>
      <div className="flex justify-center items-center mt-4 overflow-x-auto w-full">
        <svg ref={svgRef}></svg>
      </div>
    </motion.div>
  );
}