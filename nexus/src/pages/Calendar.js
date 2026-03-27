import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getAllTasks, getProjects } from "../services/api";
import TaskDetailModal from "../components/TaskDetailModal";
import { Skeleton } from "../components/SkeletonLoader";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const PRIORITY_COLORS = {
  High: "#de350b",
  Medium: "#ff8b00",
  Low: "#36b37e",
};

function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const [taskRes, projRes] = await Promise.all([getAllTasks(), getProjects()]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
    } catch (err) {
      // 401 is handled globally in the API client.
      console.error("Failed to load calendar data", err);
      setLoadError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  };

  const events = tasks
    .filter(t => t.dueDate)
    .map(t => ({
      id: t._id,
      title: t.title,
      start: new Date(t.dueDate),
      end: new Date(t.dueDate),
      allDay: true,
      resource: t,
    }));

  const eventPropGetter = useCallback((event) => {
    const task = event.resource;
    const color = PRIORITY_COLORS[task.priority] || "#6c757d";
    const isCompleted = task.status === "Completed";
    return {
      style: {
        backgroundColor: isCompleted ? "#adb5bd" : color,
        borderColor: isCompleted ? "#adb5bd" : color,
        opacity: isCompleted ? 0.6 : 1,
        textDecoration: isCompleted ? "line-through" : "none",
        fontSize: "12px",
        borderRadius: "4px",
        padding: "2px 6px",
        cursor: "pointer",
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedTask(event.resource);
    setModalOpen(true);
  }, []);

  const projectName = (projectId) => {
    const p = projects.find(pr => pr._id === projectId);
    return p?.name || "";
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <Skeleton width={120} height={28} />
          <Skeleton width={220} height={20} />
        </div>
        <div className="calendar-wrapper">
          <Skeleton width="100%" height={520} borderRadius={8} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="empty-state" style={{ padding: "56px 24px" }}>
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Calendar unavailable</div>
        <div className="empty-state-subtitle">{loadError}</div>
        <button className="btn btn-outline-secondary mt-3" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  const hasDueEvents = events.length > 0;

  return (
    <div>
      <div className="page-header">
        <h2>Calendar</h2>
        <span style={{ fontSize: "13px", color: "#5e6c84", display: "flex", alignItems: "center", gap: "12px" }}>
          <span><span style={{ color: "#de350b", marginRight: 4 }}>■</span>High</span>
          <span><span style={{ color: "#ff8b00", marginRight: 4 }}>■</span>Medium</span>
          <span><span style={{ color: "#36b37e", marginRight: 4 }}>■</span>Low</span>
        </span>
      </div>

      <div className="calendar-wrapper">
        {!hasDueEvents && (
          <div className="empty-state empty-state--compact">
            <div className="empty-state-icon">🗓️</div>
            <div className="empty-state-title">No due dates yet</div>
            <div className="empty-state-subtitle">Add due dates to tasks and they will appear on this calendar.</div>
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100vh - 164px)" }}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          popup
          tooltipAccessor={(event) =>
            `${event.title}${projectName(event.resource.projectId) ? ` · ${projectName(event.resource.projectId)}` : ""}`
          }
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          views={["month", "week", "agenda"]}
        />
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        onSaved={fetchData}
        onDeleted={fetchData}
      />
    </div>
  );
}

export default CalendarPage;
