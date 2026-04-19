/**
 * ParseTreeViewer.jsx
 * 
 * Interactive parse tree visualization using D3.js.
 * Features:
 * - Tree layout with colored nodes (purple for non-terminals, cyan for terminals)
 * - Tabs to switch between multiple parse trees
 * - Zoom and pan
 * - Export as PNG
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { toPng } from 'html-to-image';

export default function ParseTreeViewer({ parseTrees }) {
  const [activeTree, setActiveTree] = useState(0);
  const svgContainerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!parseTrees || parseTrees.length === 0 || !svgRef.current) return;

    const tree = parseTrees[activeTree];
    if (!tree) return;

    renderTree(tree);
  }, [parseTrees, activeTree]);

  function renderTree(treeData) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgContainerRef.current;
    const width = container.clientWidth;
    const height = Math.max(400, container.clientHeight);

    svg.attr('width', width).attr('height', height);

    // Convert tree data to D3 hierarchy
    const root = d3.hierarchy(treeData, d => d.children);

    // Create tree layout
    const treeLayout = d3.tree()
      .size([width - 120, height - 120])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));

    treeLayout(root);

    // Create a group for zoom/pan
    const g = svg.append('g')
      .attr('transform', 'translate(60, 50)');

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Set initial transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(60, 50));

    // Draw links (curved)
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'tree-link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      )
      .style('opacity', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 40)
      .style('opacity', 1);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', 0);

    // Animate nodes in
    nodes.transition()
      .duration(500)
      .delay((_, i) => i * 50)
      .style('opacity', 1);

    const isTerminal = (d) => !d.data.children || d.data.children.length === 0;

    // Node circles/rectangles
    nodes.each(function (d) {
      const node = d3.select(this);
      const terminal = isTerminal(d);
      const label = d.data.label;

      if (terminal) {
        // Terminal: rounded rectangle
        const rectWidth = Math.max(label.length * 10 + 16, 36);
        const rectHeight = 28;

        node.append('rect')
          .attr('x', -rectWidth / 2)
          .attr('y', -rectHeight / 2)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', 'rgba(6, 182, 212, 0.15)')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 1.5);
      } else {
        // Non-terminal: circle
        const radius = Math.max(label.length * 5 + 8, 18);

        node.append('circle')
          .attr('r', radius)
          .attr('fill', 'rgba(139, 92, 246, 0.15)')
          .attr('stroke', '#8b5cf6')
          .attr('stroke-width', 2);
      }

      // Label text
      node.append('text')
        .text(label)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', terminal ? '#22d3ee' : '#c4b5fd')
        .attr('font-size', terminal ? '11px' : '13px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .attr('font-weight', terminal ? '500' : '600');
    });

    // Tooltip on hover
    nodes.on('mouseenter', function (event, d) {
      d3.select(this).select('circle, rect')
        .transition().duration(200)
        .attr('stroke-width', 3);

      if (d.data.production) {
        const tooltip = g.append('g')
          .attr('class', 'tooltip-group')
          .attr('transform', `translate(${d.x}, ${d.y - 35})`);

        const text = tooltip.append('text')
          .text(d.data.production)
          .attr('text-anchor', 'middle')
          .attr('fill', '#e2e8f0')
          .attr('font-size', '10px')
          .attr('font-family', "'JetBrains Mono', monospace");

        const bbox = text.node().getBBox();

        tooltip.insert('rect', 'text')
          .attr('x', bbox.x - 6)
          .attr('y', bbox.y - 4)
          .attr('width', bbox.width + 12)
          .attr('height', bbox.height + 8)
          .attr('rx', 4)
          .attr('fill', 'rgba(30, 30, 50, 0.95)')
          .attr('stroke', 'rgba(139, 92, 246, 0.3)')
          .attr('stroke-width', 1);
      }
    }).on('mouseleave', function (event, d) {
      d3.select(this).select('circle, rect')
        .transition().duration(200)
        .attr('stroke-width', isTerminal(d) ? 1.5 : 2);

      g.selectAll('.tooltip-group').remove();
    });
  }

  async function handleExport() {
    if (!svgContainerRef.current) return;
    try {
      const dataUrl = await toPng(svgContainerRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `parse-tree-${activeTree + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  if (!parseTrees || parseTrees.length === 0) return null;

  return (
    <div className="animate-slide-up">
      <div className="section-label">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        Parse Trees
      </div>

      <div className="glass-card overflow-hidden">
        {/* Tabs + Export */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-dark-800/30">
          <div className="flex items-center gap-1">
            {parseTrees.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTree(i)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTree === i
                    ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-600/50'
                }`}
              >
                Tree {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       text-gray-400 hover:text-white hover:bg-dark-600/50 transition-all duration-200
                       border border-white/[0.06] hover:border-accent-purple/30"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PNG
          </button>
        </div>

        {/* SVG Container */}
        <div
          ref={svgContainerRef}
          className="relative bg-dark-900/50 min-h-[400px]"
          style={{ cursor: 'grab' }}
        >
          <svg ref={svgRef} className="w-full" style={{ minHeight: '400px' }} />

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                          bg-dark-800/80 border border-white/[0.06] text-[10px] text-gray-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Scroll to zoom • Drag to pan
          </div>
        </div>

        {/* Production used label */}
        <div className="px-4 py-2.5 border-t border-white/[0.04] bg-dark-800/30">
          <p className="text-[11px] text-gray-500 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-accent-purple mr-1.5 align-middle" />
            Non-terminal
            <span className="inline-block w-2 h-2 rounded-sm bg-accent-cyan ml-4 mr-1.5 align-middle" />
            Terminal
            <span className="text-gray-600 ml-4">Hover nodes for production rules</span>
          </p>
        </div>
      </div>
    </div>
  );
}
