import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { updateTask } from "../services/api";
import socket from "../socket";

const COLUMNS = [
  { id: "Pending", label: "To Do", colorClass: "kanban-col--todo" },
  { id: "In Progress", label: "In Progress", colorClass: "kanban-col--inprogress" },
  { id: "Completed", label: "Done", colorClass: "kanban-col--done" },
];

function KanbanBoard({ tasks, onRefresh, projectId, members }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Join socket room and subscribe to real-time events
  useEffect(() => {
    if (!projectId) return;
    socket.emit("join:project", projectId);

    const refresh = () => onRefresh();
    socket.on("task:created", refresh);
    socket.on("task:updated", refresh);
    socket.on("task:deleted", refresh);

    return () => {
      socket.off("task:created", refresh);
      socket.off("task:updated", refresh);
      socket.off("task:deleted", refresh);
    };
  }, [projectId, onRefresh]);

  const openTask = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const toggleModal = () => setModalOpen(o => !o);

  const onDragEnd = async (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    await updateTask(draggableId, { status: newStatus });
    onRefresh();
  };

  const tasksByStatus = (statusId) => tasks.filter(t => t.status === statusId);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus(col.id);
            return (
              <div key={col.id} className={`kanban-col ${col.colorClass}`}>
                <div className="kanban-col-header">
                  <span className="kanban-col-label">{col.label}</span>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-col-body ${snapshot.isDraggingOver ? "kanban-col-body--over" : ""}`}
                    >
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="kanban-empty-state">
                          <div className="kanban-empty-icon">
                            {col.id === "Pending" ? "📝" : col.id === "In Progress" ? "⚡" : "✅"}
                          </div>
                          <div className="kanban-empty-text">No tasks here</div>
                        </div>
                      )}
                      {colTasks.map((task, index) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          onClick={openTask}
                          members={members}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={modalOpen}
        toggle={toggleModal}
        onSaved={onRefresh}
        onDeleted={onRefresh}
        projectId={projectId}
        members={members}
      />
    </>
  );
}

export default KanbanBoard;
