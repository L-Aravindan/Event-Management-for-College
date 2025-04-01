import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import defaultEventImage from "../assets/logo-sm.svg";

const AdminEventDetail = () => {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    club: "",
  });
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    attendanceMarked: 0,
  });
  const [events, setEvents] = useState([]);
  const { eventId } = useParams();

  const isEventExpired = (eventDate, eventTime) => {
    try {
      const [hours, minutes] = eventTime.split(":");
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      const currentDateTime = new Date();
      return currentDateTime > eventDateTime;
    } catch (error) {
      console.error("Error checking event expiry:", error);
      return false;
    }
  };

  const fetchEventRequests = async () => {
    try {
      const response = await apiClient.get(`/admin/events/${eventId}/requests`);
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching event requests:", err);
    }
  };

  const fetchEventsParticipated = async () => {
    try {
      const response = await apiClient.get(`/admin/events/${eventId}/participated`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events participated:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, attendanceResponse] = await Promise.all([
          apiClient.get(`/events/${eventId}`),
          apiClient.get(`/admin/events/${eventId}/attendance`),
        ]);

        setEvent(eventResponse.data);
        const applicants = eventResponse.data.applicants || [];

        setStats({
          totalApplicants: applicants.length,
          approved: applicants.filter((a) => a.status === "approved").length,
          pending: applicants.filter((a) => a.status === "pending").length,
          rejected: applicants.filter((a) => a.status === "rejected").length,
          attendanceMarked: attendanceResponse.data.count || 0,
        });

        setFormData({
          name: eventResponse.data.name,
          date: eventResponse.data.date.split("T")[0],
          time: eventResponse.data.time,
          venue: eventResponse.data.venue,
          description: eventResponse.data.description,
          club: eventResponse.data.club,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchEventsParticipated();
  }, [eventId]);

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      alert("Event deleted successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/events/${eventId}`, formData);
      alert("Event updated successfully!");
      setEvent({ ...event, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  const handleRequestAction = async (studentId, action) => {
    try {
      await apiClient.put(
        `/admin/users/${studentId}/event-requests/${eventId}`,
        {
          status: action,
        }
      );
      alert(
        `Request ${
          action === "approved" ? "approved" : "rejected"
        } successfully`
      );
      fetchEventRequests(); // Refresh the requests
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Failed to update request");
    }
  };

  const handleEventStatusChange = async (eventId, status) => {
    try {
      await apiClient.put(`/admin/events/${eventId}/status`, { status });
      alert("Event status updated successfully!");
      fetchEventsParticipated();
    } catch (err) {
      console.error("Error updating event status:", err);
      alert("Failed to update event status");
    }
  };

  

  if (loading) return <div className="loading">Loading...</div>;
  if (!event) return <div className="error">Event not found</div>;

  const isExpired = isEventExpired(event.date, event.time);

  return (
    <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="group mb-6 px-4 py-2 bg-white/10 rounded-lg transition-all duration-300 hover:-translate-y-1 text-white/90 hover:text-white flex items-center gap-2 text-base"
        >
          <span className="transform transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Back
        </button>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Image and Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              <div className="relative w-full rounded-xl overflow-hidden border border-white/10 h-[550px]">
                <img
                  src={event.image || defaultEventImage}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultEventImage;
                  }}
                />
                {isExpired && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white/90 font-bold text-2xl tracking-wider px-6 py-2 rounded-full border border-white/20 bg-black/50">
                      EXPIRED
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-base mb-1">Club</p>
                <p className="text-white font-medium text-lg truncate">
                  {event.club}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-base mb-1">Venue</p>
                <p className="text-white font-medium text-lg truncate">
                  {event.venue}
                </p>
              </div>
            </div>

            {/* Events Participated */}
            <div className="space-y-4">
              <h3 className="text-xl text-white font-semibold mb-4">Events Participated</h3>
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div 
                      key={event._id}
                      className={`bg-white/10 rounded-lg p-4 border border-white/10 ${
                          event.hasAttendance ? 'border-green-500/30' : ''
                      }`}
                    >
                      <h4 className="text-white font-medium mb-2">{event.name}</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="text-white/60">Date:</span>
                          <span className="text-white">
                            {new Date(event.date).toLocaleDateString('en-GB')}
                          </span>
                        </p>
                        <p className="flex justify-between items-center">
                          <span className="text-white/60">Status:</span>
                          <select
                            value={event.status}
                            onChange={(e) => handleEventStatusChange(event._id, e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="pending" className="bg-black text-yellow-300">Pending</option>
                            <option value="approved" className="bg-black text-green-300">Approved</option>
                            <option value="rejected" className="bg-black text-red-300">Rejected</option>
                          </select>
                        </p>
                        <p className="flex justify-between items-center">
                          <span className="text-white/60">Attendance:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                              event.hasAttendance 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                          }`}>
                              {event.hasAttendance ? 'Present' : 'Absent'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                    No events found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="lg:col-span-7">
            <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 space-y-6">
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                    placeholder="Event Name"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/50"
                      required
                    />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                      placeholder="Venue"
                      required
                    />
                    <input
                      type="text"
                      name="club"
                      value={formData.club}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                      placeholder="Club"
                      required
                    />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 min-h-[150px] resize-none"
                    placeholder="Description"
                    required
                  />
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">
                      {event.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                        <p className="text-white/60 text-sm mb-1">Date</p>
                        <p className="text-white font-medium text-xl">
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                        <p className="text-white/60 text-sm mb-1">Time</p>
                        <p className="text-white font-medium text-xl">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-lg font-medium text-white mb-2">
                        Description
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Event Statistics */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Event Statistics
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.totalApplicants}
                        </p>
                        <p className="text-sm text-white/60">
                          Total Applicants
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {stats.approved}
                        </p>
                        <p className="text-sm text-white/60">Approved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">
                          {stats.pending}
                        </p>
                        <p className="text-sm text-white/60">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">
                          {stats.rejected}
                        </p>
                        <p className="text-sm text-white/60">Rejected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {stats.attendanceMarked}
                        </p>
                        <p className="text-sm text-white/60">
                          Attendance Marked
                        </p>
                      </div>
                    </div>
                  </div>

                
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={toggleEditMode}
                      className="flex-1 bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                    >
                      Delete Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Requests Section */}
        <div className="mt-8 bg-black/70 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Event Requests</h2>
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
              {requests.map((request) => (
                <div
                  key={request.studentId._id}
                  className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:border-white/20"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium">
                        {request.studentId.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          request.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : request.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/60 text-sm">
                        Register: {request.studentId.registerNumber}
                      </p>
                      <p className="text-white/60 text-sm">
                        Department: {request.studentId.department}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() =>
                          handleRequestAction(request.studentId._id, "approved")
                        }
                        className={`flex-1 py-2 rounded-lg transition-all duration-300 hover:-translate-y-1 ${
                          request.status === "approved"
                            ? "bg-green-500/40 text-green-300"
                            : "bg-green-500/20 hover:bg-green-500/30 text-white"
                        }`}
                      >
                        {request.status === "approved" ? "Approved" : "Approve"}
                      </button>
                      <button
                        onClick={() =>
                          handleRequestAction(request.studentId._id, "rejected")
                        }
                        className={`flex-1 py-2 rounded-lg transition-all duration-300 hover:-translate-y-1 ${
                          request.status === "rejected"
                            ? "bg-red-500/40 text-red-300"
                            : "bg-red-500/20 hover:bg-red-500/30 text-white"
                        }`}
                      >
                        {request.status === "rejected" ? "Rejected" : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
              No requests found for this event
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventDetail;
