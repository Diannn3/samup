---
title: 'Shortest Paths: When Fewer Stops Cost More'
slug: 'shortest-paths'
concept: 'Weighted graphs and shortest-path reasoning'
level: 'introductory'
summary: 'A small weighted graph shows why the route with the fewest connections is not necessarily the route with the lowest total cost.'
accessibilityDescription: 'A weighted graph with nodes A, B, C, D, and E. Route A to B to E costs 17, while route A to C to D to E costs 12, making the longer-by-edge-count route cheaper.'
publishedAt: '2026-09-22'
sources:
  - label: 'E. W. Dijkstra, A note on two problems in connexion with graphs, Numerische Mathematik 1 (1959)'
evidence:
  status: 'verified-current'
  visibility: 'public'
  sourceLabel: 'SAM-UP Applied Mathematics editorial explainer'
  reviewedAt: '2026-09-22'
  notes: 'Educational content reviewed for conceptual correctness; not an organizational policy or current-status claim.'
---

Applied Mathematics often starts by deciding **what a real-world cost means**.

Suppose five locations are connected by roads. Each road has a number attached to it. That number could represent distance, travel time, fuel, money, risk, or another measurable cost.

We can model the locations as **nodes** and the available connections as **weighted edges**.

For the example used here:

- route **A → B → E** costs (9 + 8 = 17);
- route **A → C → D → E** costs (4 + 5 + 3 = 12).

The second route uses more edges, but its total cost is lower.

That is the important modeling lesson: **the shortest path is defined by the quantity we choose to minimize, not by how few turns or stops a route contains.**

In real systems, the graph may contain millions of nodes and costs may change over time. The mathematical workflow is still recognizable:

1. decide what the nodes and edges represent;
2. define a meaningful cost;
3. identify feasible routes;
4. compare total cost under that model;
5. use an appropriate algorithm to find the best path.

The diagram is not the goal. The goal is the **decision the model helps us make**.
