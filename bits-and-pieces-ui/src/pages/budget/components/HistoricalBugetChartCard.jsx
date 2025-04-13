import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import API_BASE_URL from "../../../apiConfig";

export default function HistoricalBudgetChart({ historyData, currentMonth }) {
  const svgRef = useRef();
  const [categoryDetails, setCategoryDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  
  const allData = [
    { month: currentMonth.month, categories: currentMonth.categories },
    ...historyData,
  ];
  
  const filteredData = allData
    .filter(monthData => monthData.categories && monthData.categories.length > 0)
    .slice(0, 5);

  const allCategories = [
    ...new Set(
      filteredData.flatMap((month) => month.categories.map((cat) => cat.name))
    ),
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/categories/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const lookupDetails = data.reduce((acc, category) => {
            acc[category.id] = {
              name: category.name,
              color: category.category_color
            };
            return acc;
          }, {});
          setCategoryDetails(lookupDetails);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch category details:", err);
        setLoading(false);
      });
  }, [token]);

  const getCategoryColor = (category) => {
    if (category.id && categoryDetails[category.id]) {
      return categoryDetails[category.id].color || "#cccccc";
    }
    
    const matchingCategory = Object.values(categoryDetails).find(
      c => c.name === category.name
    );
    
    if (matchingCategory) {
      return matchingCategory.color || "#cccccc";
    }
    
    const defaultColors = [
      "#2c698d", "#e76f51", "#2a9d8f", "#e9c46a", "#264653", 
      "#f4a261", "#023e8a", "#d62828", "#588157", "#bc6c25"
    ];
    
    const hashCode = str => 
      str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const colorIndex = Math.abs(hashCode(category.name)) % defaultColors.length;
    return defaultColors[colorIndex];
  };

  useEffect(() => {
    if (loading || !filteredData || filteredData.length === 0) return;

    const margin = { top: 30, right: 80, bottom: 70, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const months = filteredData.map((d) => d.month);
    const x = d3.scaleBand().domain(months).range([0, width]).padding(0.2);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "9px");

    const maxBudget =
      d3.max(filteredData, (d) => d3.max(d.categories, (c) => c.budget)) * 1.1;
    const y = d3.scaleLinear().domain([0, maxBudget]).range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-opacity", 0.7);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-opacity", 0.7);

    allCategories.forEach((categoryName) => {
      const categoryData = filteredData.map((monthData) => {
        const cat = monthData.categories.find((c) => c.name === categoryName);
        return { 
          month: monthData.month, 
          budget: cat ? cat.budget : 0,
          category: cat || { name: categoryName }
        };
      });

      if (categoryData.some(d => d.budget > 0)) {
        const categoryColor = getCategoryColor(categoryData[0].category);
        
        const line = d3
          .line()
          .x((d) => x(d.month) + x.bandwidth() / 2)
          .y((d) => y(d.budget))
          .curve(d3.curveMonotoneX);

        svg
          .append("path")
          .datum(categoryData)
          .attr("fill", "none")
          .attr("stroke", categoryColor)
          .attr("stroke-width", 2.5)
          .attr("d", line);

        svg
          .selectAll(`.dot-${categoryName.replace(/\s+/g, "-")}`)
          .data(categoryData.filter(d => d.budget > 0)) 
          .enter()
          .append("circle")
          .attr("class", `dot-${categoryName.replace(/\s+/g, "-")}`)
          .attr("cx", (d) => x(d.month) + x.bandwidth() / 2)
          .attr("cy", (d) => y(d.budget))
          .attr("r", 5)
          .attr("fill", categoryColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
          
        const lastPoint = categoryData.filter(d => d.budget > 0).pop();
        if (lastPoint) {
          svg
            .append("text")
            .attr("x", x(lastPoint.month) + x.bandwidth() / 2 + 5)
            .attr("y", y(lastPoint.budget))
            .text(`${categoryName}: Rs.${lastPoint.budget.toFixed(0)}`)
            .attr("font-size", "8px")
            .attr("fill", categoryColor)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle");
        }
      }
    });
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Last 5 Months Budget Trend");
      
  }, [filteredData, allCategories, categoryDetails, loading]);

  if (loading) {
    return (
      <motion.div
        key="budget-chart-loading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="p-6 rounded-xl shadow-lg bg-white flex flex-col justify-center items-center"
      >
        <h2 className="text-lg font-bold mb-2">Category Budget Trend</h2>
        <div className="w-full text-center py-8 text-gray-500">
          Loading chart data...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="budget-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="p-6 rounded-xl shadow-lg bg-white flex flex-col justify-center items-start"
    >
      <h2 className="text-lg font-bold mb-2">Category Budget Trend</h2>
      {filteredData.length === 0 ? (
        <div className="w-full text-center py-8 text-gray-500">
          No historical budget data available
        </div>
      ) : (
        <div className="flex justify-center items-center mt-4 overflow-x-auto w-full">
          <svg ref={svgRef}></svg>
        </div>
      )}
    </motion.div>
  );
}