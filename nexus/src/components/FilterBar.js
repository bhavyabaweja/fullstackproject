import React, { useState, useEffect } from "react";

function FilterBar({ tasks, members, onFilterChange }) {
  const [search, setSearch]     = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [labelName, setLabel]   = useState("");

  const allLabels = [...new Set(
    tasks.flatMap(t => (t.labels || []).map(l => l.name))
  )].sort();

  useEffect(() => {
    let filtered = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }
    if (priority)   filtered = filtered.filter(t => t.priority === priority);
    if (assigneeId) filtered = filtered.filter(t =>
      (t.assigneeId?._id || t.assigneeId) === assigneeId
    );
    if (labelName)  filtered = filtered.filter(t =>
      (t.labels || []).some(l => l.name === labelName)
    );
    onFilterChange(filtered);
  }, [search, priority, assigneeId, labelName, tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilter = search || priority || assigneeId || labelName;
  const clearAll = () => { setSearch(""); setPriority(""); setAssignee(""); setLabel(""); };

  return (
    <div className="filter-bar">
      <input
        className="form-control form-control-sm filter-bar-search"
        placeholder="Search tasks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select className="form-select form-select-sm" value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="">All priorities</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <select className="form-select form-select-sm" value={assigneeId} onChange={e => setAssignee(e.target.value)}>
        <option value="">All assignees</option>
        {members.map(m => (
          <option key={m.userId?._id} value={m.userId?._id}>{m.userId?.name}</option>
        ))}
      </select>
      {allLabels.length > 0 && (
        <select className="form-select form-select-sm" value={labelName} onChange={e => setLabel(e.target.value)}>
          <option value="">All labels</option>
          {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      )}
      {hasFilter && (
        <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>Clear</button>
      )}
    </div>
  );
}

export default FilterBar;
