import React, { useState, useEffect, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Input, Button } from "reactstrap";
import { getMembers, inviteMember, removeMember } from "../services/api";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

const AVATAR_COLORS = ["#0052cc", "#6554c0", "#00875a", "#de350b", "#ff8b00"];
function avatarColor(name) {
  const code = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function MembersModal({ isOpen, toggle, projectId, projectOwnerId }) {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMembers = useCallback(async () => {
    const res = await getMembers(projectId);
    setMembers(res.data);
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) fetchMembers();
  }, [isOpen, projectId, fetchMembers]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await inviteMember(projectId, email.trim());
      setEmail("");
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    await removeMember(projectId, userId);
    fetchMembers();
  };

  const isOwner = members.find(m => m.userId?._id === user?._id)?.role === "Owner"
    || projectOwnerId === user?._id;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>Project Members</ModalHeader>
      <ModalBody>
        {/* Member list */}
        <div className="mb-4">
          {members.map(m => {
            const name = m.userId?.name || "Unknown";
            const uid = m.userId?._id;
            return (
              <div key={uid} className="member-row">
                <div className="member-row-left">
                  <div
                    className="member-avatar"
                    style={{ background: avatarColor(name) }}
                  >
                    {initials(name)}
                  </div>
                  <div>
                    <div className="member-name">{name}</div>
                    <div className="member-email">{m.userId?.email}</div>
                  </div>
                </div>
                <div className="member-row-right">
                  <span className={`role-badge role-badge--${m.role.toLowerCase()}`}>
                    {m.role}
                  </span>
                  {isOwner && m.role !== "Owner" && (
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleRemove(uid)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite form */}
        <div className="member-invite-form">
          <div className="member-invite-label">Invite by email</div>
          <div className="d-flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              onKeyDown={e => e.key === "Enter" && handleInvite()}
            />
            <Button color="primary" onClick={handleInvite} disabled={loading}>
              {loading ? "..." : "Invite"}
            </Button>
          </div>
          {error && <div className="text-danger mt-1" style={{ fontSize: 13 }}>{error}</div>}
        </div>
      </ModalBody>
    </Modal>
  );
}

export default MembersModal;
