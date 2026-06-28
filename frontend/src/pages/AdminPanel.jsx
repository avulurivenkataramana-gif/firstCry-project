import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  ShieldAlert, 
  Check, 
  Mail, 
  Phone, 
  School,
  X,
  Shield,
  Building2,
  Baby,
  Download,
  AlertCircle,
  MessageSquare,
  FileText,
  RefreshCw
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';
  const setActiveTab = (tId) => {
    setSearchParams({ tab: tId });
  };
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState('teacher');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [classroom, setClassroom] = useState('');
  const [childName, setChildName] = useState('');

  const [feedback, setFeedback] = useState(null);

  // Student Admissions tab states
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Student Admissions Form state
  const [studName, setStudName] = useState('');
  const [studAdmNum, setStudAdmNum] = useState('');
  const [studClass, setStudClass] = useState('Nursery');
  const [studAge, setStudAge] = useState('');
  const [studGender, setStudGender] = useState('Male');
  const [studFatherName, setStudFatherName] = useState('');
  const [studParentName, setStudParentName] = useState('');
  const [studParentEmail, setStudParentEmail] = useState('');
  const [studRelationship, setStudRelationship] = useState('Father');
  const [studContactNumber, setStudContactNumber] = useState('');

  // Role Request states
  const [roleRequests, setRoleRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pending approvals state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-slate-505 dark:text-slate-400 font-sans">
        <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-2 animate-pulse" />
        <h3 className="text-base font-bold text-slate-805 dark:text-white">Access Denied</h3>
        <p className="text-xs mt-1">You do not have administrative permissions to view this panel.</p>
      </div>
    );
  }
  const [deletedLogIds, setDeletedLogIds] = useState(() => {
    try {
      const saved = localStorage.getItem('deleted_audit_log_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleDeleteLog = (logId) => {
    const updated = [...deletedLogIds, logId];
    setDeletedLogIds(updated);
    localStorage.setItem('deleted_audit_log_ids', JSON.stringify(updated));
    setAuditLogs(prev => prev.filter(l => l.id !== logId));
  };

  const handleClearAllLogs = () => {
    const allIds = auditLogs.map(l => l.id);
    const updated = [...deletedLogIds, ...allIds];
    setDeletedLogIds(updated);
    localStorage.setItem('deleted_audit_log_ids', JSON.stringify(updated));
    setAuditLogs([]);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Role', 'Phone Number', 'Assignment / Child', 'Child Name'];
    const rows = users.map(u => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.role.replace(/"/g, '""')}"`,
      `"${(u.phoneNumber || '').replace(/"/g, '""')}"`,
      `"${(u.classroom || '').replace(/"/g, '""')}"`,
      `"${(u.childName || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `intellitots_user_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const [currRes, lessRes, notifRes] = await Promise.all([
        api.get('/curriculum'),
        api.get('/lessons'),
        api.get('/notifications')
      ]);

      const logs = [];
      
      users.forEach(u => {
        logs.push({
          id: `user_${u._id}`,
          action: 'User Account Created',
          description: `${u.name} registered as role "${u.role}" under assignment "${u.classroom || 'General Staff'}"`,
          time: u.createdAt || new Date(2026, 5, 10),
          type: 'user'
        });
      });

      if (currRes.success && currRes.data) {
        currRes.data.forEach(c => {
          logs.push({
            id: `curr_${c._id}`,
            action: 'Curriculum Plan Update',
            description: `Plan "${c.title}" (Theme: ${c.themeName}) updated. Status: "${c.status}"`,
            time: c.updatedAt || c.createdAt || new Date(),
            type: 'curriculum'
          });
        });
      }

      if (lessRes.success && lessRes.data) {
        lessRes.data.forEach(l => {
          logs.push({
            id: `less_${l._id}`,
            action: 'Lesson Scheduled',
            description: `Topic "${l.topic}" scheduled for week ${l.weekNumber} (Classroom: ${l.classroom || (l.teacher && l.teacher.classroom) || 'Nursery'}). Status: "${l.status}"`,
            time: l.updatedAt || l.createdAt || new Date(),
            type: 'lesson'
          });
        });
      }

      if (notifRes.success && notifRes.data) {
        notifRes.data.forEach(n => {
          if (n.type === 'enquiry') {
            logs.push({
              id: `enq_${n._id}`,
              action: 'Parent Enquiry Logged',
              description: `Parent submitted query "${n.title}"`,
              time: n.createdAt || new Date(),
              type: 'enquiry'
            });
          }
        });
      }

      logs.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      // Filter out deleted logs using the persistent list from localStorage
      let currentDeletedIds = [];
      try {
        const saved = localStorage.getItem('deleted_audit_log_ids');
        currentDeletedIds = saved ? JSON.parse(saved) : [];
      } catch (_) {}
      
      const filteredLogs = logs.filter(l => !currentDeletedIds.includes(l.id));
      setAuditLogs(filteredLogs);
    } catch (err) {
      console.error('Failed to build audit logs:', err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await api.get('/parent/students');
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const payload = {
        name: studName,
        admissionNumber: studAdmNum,
        classroom: studClass,
        age: parseInt(studAge, 10),
        gender: studGender,
        fatherName: studFatherName,
        parentName: studParentName,
        parentEmail: studParentEmail,
        relationship: studRelationship,
        contactNumber: studContactNumber
      };
      
      const response = await api.post('/parent/students', payload);
      if (response.success) {
        setFeedback({ type: 'success', text: `Student "${studName}" admitted successfully! Parent login generated.` });
        fetchStudents();
        fetchUsers();
        resetStudentForm();
        setShowAddStudentModal(false);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!selectedStudent) return;

    try {
      const payload = {
        name: studName,
        classroom: studClass,
        age: parseInt(studAge, 10),
        gender: studGender,
        fatherName: studFatherName,
        parentName: studParentName,
        parentEmail: studParentEmail,
        relationship: studRelationship,
        contactNumber: studContactNumber
      };
      
      const response = await api.put(`/parent/students/${selectedStudent._id}`, payload);
      if (response.success) {
        setFeedback({ type: 'success', text: `Student details updated successfully!` });
        fetchStudents();
        fetchUsers();
        setShowEditStudentModal(false);
        setSelectedStudent(null);
        resetStudentForm();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const resetStudentForm = () => {
    const firstTeacherClass = users.find(u => u.role === 'teacher' && u.classroom)?.classroom || 'Nursery';
    setStudName('');
    setStudAdmNum('');
    setStudClass(firstTeacherClass);
    setStudAge('');
    setStudGender('Male');
    setStudFatherName('');
    setStudParentName('');
    setStudParentEmail('');
    setStudRelationship('Father');
    setStudContactNumber('');
  };

  const triggerOpenEditStudent = (stud) => {
    setSelectedStudent(stud);
    setStudName(stud.name);
    setStudAdmNum(stud.admissionNumber);
    setStudClass(stud.classroom);
    setStudAge(stud.age);
    setStudGender(stud.gender);
    setStudFatherName(stud.fatherName || '');
    setStudParentName(stud.parentName);
    setStudParentEmail(stud.parentEmail);
    setStudRelationship(stud.relationship);
    setStudContactNumber(stud.contactNumber);
    setShowEditStudentModal(true);
  };

  const fetchRoleRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await api.get('/admin/role-requests');
      if (response.success && response.data) {
        setRoleRequests(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch role requests:', err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!window.confirm(`Are you sure you want to approve the role request for ${request.userName} to become "${request.requestedRole}"?`)) return;
    try {
      const response = await api.put(`/admin/role-requests/${request._id}`, { status: 'Approved' });
      if (response.success) {
        setFeedback({ type: 'success', text: `Role request for "${request.userName}" approved. Permissions granted.` });
        fetchRoleRequests();
        fetchUsers(); // Sync
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRejectRequest = async (request) => {
    const reason = window.prompt(`Please enter the rejection reason for ${request.userName}'s request:`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      const response = await api.put(`/admin/role-requests/${request._id}`, { status: 'Rejected', rejectionReason: reason });
      if (response.success) {
        setFeedback({ type: 'success', text: `Role request for "${request.userName}" rejected.` });
        fetchRoleRequests();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'permissions') {
      fetchRoleRequests();
    }
  }, [activeTab, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    setLoadingPending(true);
    try {
      const response = await api.get('/auth/admin/pending-users');
      if (response.success) {
        setPendingUsers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending users:', err.message);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveAccount = async (userId, userName) => {
    try {
      await api.put(`/auth/admin/approve/${userId}`);
      setApprovalFeedback({ type: 'success', text: `✅ ${userName}'s account has been approved. They can now log in.` });
      fetchPendingUsers();
      fetchUsers();
      setTimeout(() => setApprovalFeedback(null), 4000);
    } catch (err) {
      setApprovalFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRejectAccount = async (userId, userName) => {
    try {
      await api.put(`/auth/admin/reject/${userId}`);
      setApprovalFeedback({ type: 'success', text: `❌ ${userName}'s account has been rejected.` });
      fetchPendingUsers();
      setTimeout(() => setApprovalFeedback(null), 4000);
    } catch (err) {
      setApprovalFeedback({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const payload = {
        name,
        email,
        password,
        role: newRole,
        classroom,
        phoneNumber,
        childName: newRole === 'parent' ? childName : undefined
      };
      
      const response = await api.post('/admin/users', payload);
      if (response.success) {
        setFeedback({ type: 'success', text: `User "${name}" created successfully!` });
        fetchUsers();
        resetForm();
        setShowAddModal(false);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!selectedUser) return;

    try {
      const payload = {
        name,
        role: newRole,
        classroom,
        phoneNumber,
        childName: newRole === 'parent' ? childName : undefined
      };
      
      const response = await api.put(`/admin/users/${selectedUser._id}`, payload);
      if (response.success) {
        setFeedback({ type: 'success', text: `User details updated successfully!` });
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDeleteUser = async (targetId, targetName) => {
    if (targetId === user._id) {
      alert('You cannot delete your own admin account!');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete user "${targetName}"? This action is irreversible.`)) return;

    try {
      const response = await api.delete(`/admin/users/${targetId}`);
      if (response.success) {
        setFeedback({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setNewRole('teacher');
    setPhoneNumber('');
    setClassroom('');
    setChildName('');
  };

  const triggerOpenEdit = (target) => {
    setSelectedUser(target);
    setName(target.name);
    setNewRole(target.role);
    setPhoneNumber(target.phoneNumber || '');
    setClassroom(target.classroom || '');
    setChildName(target.childName || '');
    setShowEditModal(true);
  };

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Derive teacher classrooms for the student admission dropdown
  const teacherClassrooms = [
    ...new Set(
      users
        .filter(u => u.role === 'teacher' && u.classroom)
        .map(u => u.classroom)
    )
  ].sort();
  // Fallback if no teachers exist yet
  const classroomOptions = teacherClassrooms.length > 0
    ? teacherClassrooms
    : ['Nursery', 'LKG', 'UKG', 'Nursery-A', 'Kindergarten-B'];


  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Administration User Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Create new team members, edit classroom ownerships, adjust user roles, and manage permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-all"
          >
            <Download className="h-4.5 w-4.5 mr-1.5" /> Export Users (CSV)
          </button>
          <button
            onClick={() => {
              resetStudentForm();
              setShowAddStudentModal(true);
            }}
            className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-all"
          >
            <Baby className="h-4.5 w-4.5 mr-1.5" /> Admit Student
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
          >
            <UserPlus className="h-4.5 w-4.5 mr-1.5" /> Register New Account
          </button>
        </div>
      </div>

      {/* Alert Notice */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 border animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
            : 'bg-red-500/10 border-red-500/15 text-red-650 dark:bg-red-950/20 dark:text-red-450'
        }`}>
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200/60 dark:border-slate-800/40 pb-1.5 overflow-x-auto select-none">
        {[
          { id: 'users', label: 'User Account Directory', icon: Users },
          { id: 'approvals', label: 'Pending Approvals', icon: Check, badge: pendingUsers.length },
          { id: 'students', label: 'Student Admissions', icon: Baby },
          { id: 'branches', label: 'Schools & Branches', icon: Building2 },
          { id: 'permissions', label: 'Roles & Permissions', icon: Shield },
          { id: 'audit', label: 'System Activity Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all flex items-center space-x-2 border ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-slate-100/50 hover:bg-slate-200/70 border-transparent dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Panels */}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'Total Accounts', val: users.length, icon: Users, bg: 'bg-brand-500/10 text-brand-500' },
              { label: 'Teachers', val: users.filter(u => u.role === 'teacher').length, icon: School, bg: 'bg-sky-500/10 text-sky-500' },
              { label: 'Coordinators', val: users.filter(u => u.role === 'coordinator').length, icon: Building2, bg: 'bg-purple-500/10 text-purple-500' },
              { label: 'Parents', val: users.filter(u => u.role === 'parent').length, icon: Baby, bg: 'bg-amber-500/10 text-amber-500' },
              { label: 'Administrators', val: users.filter(u => u.role === 'admin').length, icon: Shield, bg: 'bg-rose-500/10 text-rose-500' }
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="glass-card p-5 rounded-2xl flex items-center space-x-3.5 border border-slate-205/50 dark:border-slate-800/15">
                  <div className={`p-2.5 rounded-xl ${k.bg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{k.label}</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">{k.val}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toolbar filter */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
              />
            </div>

            {/* Role filters pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto select-none py-1">
              {['all', 'teacher', 'coordinator', 'admin', 'parent'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans whitespace-nowrap capitalize transition-all ${
                    roleFilter === r
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-450'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Table block */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 glass-card rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-655 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-805 dark:text-white">No users registered</h3>
              <p className="text-slate-400 text-xs mt-1">
                There are no user accounts matching your selected role filters.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-505 uppercase font-bold">
                      <th className="py-4 pl-6">Full Name</th>
                      <th className="py-4">Email</th>
                      <th className="py-4">Role</th>
                      <th className="py-4">Phone</th>
                      <th className="py-4">Assignment / Child</th>
                      <th className="py-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 dark:divide-slate-800/30">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-55/20 dark:hover:bg-slate-900/10">
                        <td className="py-4 pl-6 font-bold text-slate-805 dark:text-white text-sm">
                          {u.name}
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-350 font-medium font-mono text-xs">
                          {u.email}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                              : u.role === 'coordinator' 
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20' 
                              : u.role === 'parent' 
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' 
                              : 'bg-sky-50 text-sky-600 dark:bg-sky-950/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {u.phoneNumber || '—'}
                        </td>
                        <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">
                          {u.role === 'parent' ? (
                            <span className="flex flex-col">
                              <span className="text-xs">Child: {u.childName || 'Not Listed'}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Class: {u.classroom || 'Not Assigned'}</span>
                            </span>
                          ) : (
                            u.classroom || 'General Staff'
                          )}
                        </td>
                        <td className="py-4 pr-6 text-right space-x-1">
                          <button
                            onClick={() => triggerOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                            title="Edit User Info"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Admitted', val: students.length, icon: Baby, bg: 'bg-brand-500/10 text-brand-500' },
              { label: 'Nursery', val: students.filter(s => s.classroom.startsWith('Nursery')).length, icon: Baby, bg: 'bg-sky-500/10 text-sky-500' },
              { label: 'LKG', val: students.filter(s => s.classroom.startsWith('LKG')).length, icon: Baby, bg: 'bg-purple-500/10 text-purple-500' },
              { label: 'UKG', val: students.filter(s => s.classroom.startsWith('UKG')).length, icon: Baby, bg: 'bg-amber-500/10 text-amber-500' }
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="glass-card p-5 rounded-2xl flex items-center space-x-3.5 border border-slate-205/50 dark:border-slate-800/15">
                  <div className={`p-2.5 rounded-xl ${k.bg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{k.label}</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">{k.val}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or admission number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto select-none py-1">
              {['all', 'Nursery', 'LKG', 'UKG'].map(c => (
                <button
                  key={c}
                  onClick={() => setStudentClassFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans whitespace-nowrap capitalize transition-all ${
                    studentClassFilter === c
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-450'
                  }`}
                >
                  {c === 'all' ? 'All Classes' : c}
                </button>
              ))}
            </div>
          </div>

          {loadingStudents ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 glass-card rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-105 dark:bg-slate-900 text-slate-400 dark:text-slate-655 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Baby className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-805 dark:text-white">No students admitted yet</h3>
              <p className="text-slate-400 text-xs mt-1">
                Admit your first student by clicking the button in the top right.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-505 uppercase font-bold">
                      <th className="py-4 pl-6">Student Name</th>
                      <th className="py-4">Admission Number</th>
                      <th className="py-4">Class</th>
                      <th className="py-4">Age / Gender</th>
                      <th className="py-4">Parent Details</th>
                      <th className="py-4">Relationship</th>
                      <th className="py-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 dark:divide-slate-800/30">
                    {students
                      .filter(s => {
                        const matchText = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                          s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase());
                        const matchClass = studentClassFilter === 'all' || s.classroom.toLowerCase().startsWith(studentClassFilter.toLowerCase());
                        return matchText && matchClass;
                      })
                      .map((s) => (
                        <tr key={s._id} className="hover:bg-slate-55/20 dark:hover:bg-slate-900/10">
                          <td className="py-4 pl-6 font-bold text-slate-805 dark:text-white text-sm">
                            {s.name}
                          </td>
                          <td className="py-4 font-mono font-bold text-slate-500">
                            {s.admissionNumber}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-brand-500/10 text-brand-500 dark:text-brand-400">
                              {s.classroom}
                            </span>
                          </td>
                          <td className="py-4 text-slate-600 dark:text-slate-350 font-semibold">
                            {s.age} yrs / {s.gender}
                          </td>
                          <td className="py-4 text-slate-550 dark:text-slate-400 font-semibold">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-white">{s.parentName}</span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">{s.parentEmail}</span>
                              <span className="text-[10px] text-slate-455 dark:text-slate-400 font-normal">{s.contactNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 capitalize font-semibold text-slate-550 dark:text-slate-400">
                            {s.relationship}
                          </td>
                          <td className="py-4 pr-6 text-right">
                            <button
                              onClick={() => triggerOpenEditStudent(s)}
                              className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                              title="Edit Student details"
                            >
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-brand-500" /> School Branches & Campuses
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Register, monitor, and configure different early childhood centers under the platform.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Greenwood Campus (Main)', code: 'GW-01', director: 'Sunita Nair', classrooms: 6, students: 120, status: 'Active' },
                  { name: 'Sunrise Valley Center', code: 'SV-02', director: 'Rajesh Mehta', classrooms: 4, students: 85, status: 'Active' },
                  { name: 'City Center Preschool', code: 'CC-03', director: 'Anjali Desai', classrooms: 3, students: 60, status: 'Active' }
                ].map((branch, i) => (
                  <div key={i} className="p-4 bg-slate-55/20 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{branch.name}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-sans">
                        <span>Code: {branch.code}</span>
                        <span>•</span>
                        <span>Director: {branch.director}</span>
                        <span>•</span>
                        <span>Classrooms: {branch.classrooms}</span>
                        <span>•</span>
                        <span>Students: {branch.students}</span>
                      </div>
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 rounded-lg">
                        {branch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-4">
                <School className="h-5 w-5 mr-2 text-brand-500" /> Academic Years
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-4">
                Configure school term definitions and academic calendars.
              </p>
              
              <div className="space-y-4">
                {[
                  { year: '2025-2026', status: 'Active', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' },
                  { year: '2026-2027', status: 'Planning', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' }
                ].map((term, i) => (
                  <div key={i} className="p-4 bg-slate-55/20 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white">{term.year} Term</span>
                      <p className="text-[10px] text-slate-450 mt-0.5">Aug 15 - Jun 10</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${term.color}`}>
                      {term.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Permissions Matrix */}
          <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
            <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-2">
              <Shield className="h-5 w-5 mr-2 text-brand-500" /> Roles & Permissions Control Matrix
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
              View permission mapping across Admin, Coordinator, Teacher, and Parent portals.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-505 uppercase font-semibold">
                    <th className="pb-3 pl-2">System Module / Permission</th>
                    <th className="pb-3 text-center">Admin</th>
                    <th className="pb-3 text-center">Coordinator</th>
                    <th className="pb-3 text-center">Teacher</th>
                    <th className="pb-3 text-center">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {[
                    { permission: 'Platform & Global School Settings', admin: true, coord: false, teacher: false, parent: false },
                    { permission: 'User Directory & Account Creation', admin: true, coord: false, teacher: false, parent: false },
                    { permission: 'Curriculum Approvals & Rejections', admin: true, coord: true, teacher: false, parent: false },
                    { permission: 'Academic Notice Bulletins Creation', admin: true, coord: true, teacher: false, parent: false },
                    { permission: 'Weekly Lesson Planning & Execution', admin: false, coord: false, teacher: true, parent: false },
                    { permission: 'AI Assistant Prompt & Generation', admin: false, coord: false, teacher: true, parent: false },
                    { permission: 'Attendance Recording & Grades Input', admin: false, coord: false, teacher: true, parent: false },
                    { permission: 'Student Progress Dashboard', admin: true, coord: true, teacher: true, parent: true },
                    { permission: 'Direct Messaging (Parent-Teacher)', admin: false, coord: false, teacher: true, parent: true }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-55/20 dark:hover:bg-slate-900/10">
                      <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-white">{row.permission}</td>
                      <td className="py-3.5 text-center">
                        {row.admin ? <Check className="h-4 w-4 text-emerald-550 mx-auto" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-3.5 text-center">
                        {row.coord ? <Check className="h-4 w-4 text-emerald-550 mx-auto" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-3.5 text-center">
                        {row.teacher ? <Check className="h-4 w-4 text-emerald-550 mx-auto" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-3.5 text-center">
                        {row.parent ? <Check className="h-4 w-4 text-emerald-550 mx-auto" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Requests Workflow Table */}
          <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
            <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-2">
              <ShieldAlert className="h-5 w-5 mr-2 text-brand-500" /> Role & Access Request Workflows
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
              Review and approve or reject role upgrade requests submitted by portal users.
            </p>

            {loadingRequests ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-16 glass-card rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : roleRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No role or access requests found in the system.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-505 uppercase font-bold">
                      <th className="py-4 pl-6">User Name</th>
                      <th className="py-4">Requested Role</th>
                      <th className="py-4">Requested Permissions</th>
                      <th className="py-4">Request Date</th>
                      <th className="py-4">Status</th>
                      <th className="py-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 dark:divide-slate-800/30">
                    {roleRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-slate-55/20 dark:hover:bg-slate-900/10">
                        <td className="py-4 pl-6 font-bold text-slate-855 dark:text-white text-sm">
                          {request.userName}
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-brand-500/10 text-brand-500 dark:text-brand-400">
                            {request.requestedRole}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-350 font-medium">
                          {request.requestedPermissions}
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            request.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                              : request.status === 'Rejected'
                              ? 'bg-red-50 text-red-650 dark:bg-red-950/20'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDetailModal(true);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                          >
                            View Details
                          </button>
                          {request.status === 'Pending' && (
                            <span className="inline-flex items-center space-x-1">
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all inline-flex items-center"
                                title="Approve Request"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request)}
                                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all inline-flex items-center"
                                title="Reject Request"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System activity logs */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-brand-500" /> Platform Security & Audit Trail
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Chronological tracking of database operations, registrations, approvals, and parent communications.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {auditLogs.length > 0 && (
                  <button
                    onClick={handleClearAllLogs}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-rose-200/50 dark:border-rose-500/20 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                  </button>
                )}
                <button
                  onClick={fetchAuditLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
                </button>
              </div>
            </div>

            {loadingAudit ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-14 bg-slate-205/50 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No logs to display. Click Refresh Logs to load.</p>
                  </div>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-start space-x-3 text-left group hover:border-slate-200 dark:hover:border-slate-700/50 transition-all">
                      <span className={`p-1.5 rounded-lg text-xs font-black uppercase mt-0.5 flex-shrink-0 ${
                        log.type === 'user' 
                          ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/20' 
                          : log.type === 'curriculum' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                          : log.type === 'lesson' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                      }`}>
                        {log.type}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {log.action}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] text-slate-400 font-mono font-medium">
                              {new Date(log.time).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              title="Delete log"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-300 hover:text-rose-500 transition-all duration-150"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-0.5 leading-snug font-medium text-left">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-scale-up max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">Register New Account</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Input user details and select appropriate early education portal role.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleAddUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                     type="text"
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="e.g. Aditi Sharma"
                     className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="e.g. aditi@school.com"
                     className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                     type="password"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                     type="text"
                     required
                     value={phoneNumber}
                     onChange={(e) => setPhoneNumber(e.target.value)}
                     placeholder="+91 98765 43210"
                     className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Portal Role Access</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                >
                  <option value="teacher">Teacher (Classroom Schedule)</option>
                  <option value="coordinator">Coordinator (Curriculum Approvals)</option>
                  <option value="admin">Administrator (Branch Panel)</option>
                  <option value="parent">Parent (Child Progress / Reports)</option>
                </select>
              </div>

              {/* Dynamic Inputs */}
              {newRole === 'parent' ? (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/40 rounded-2xl animate-scale-up">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Child's Name</label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Aarav Patel"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Child's Classroom</label>
                    <input
                      type="text"
                      required
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      placeholder="e.g. Nursery-A"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="animate-scale-up">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {newRole === 'coordinator' ? 'Department Unit' : newRole === 'admin' ? 'Branch / Campus' : 'Classroom Assignment'}
                  </label>
                  <input
                    type="text"
                    required
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder={newRole === 'coordinator' ? 'e.g. Curriculum Office' : newRole === 'admin' ? 'e.g. All Classrooms' : 'e.g. Nursery-A'}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              )}

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/35 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!name || !email || !password}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Add Account
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-scale-up max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">Modify User details</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Edit user role, classroom tags, or phone details.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleEditUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Portal Role Access</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                >
                  <option value="teacher">Teacher (Classroom Schedule)</option>
                  <option value="coordinator">Coordinator (Curriculum Approvals)</option>
                  <option value="admin">Administrator (Branch Panel)</option>
                  <option value="parent">Parent (Child Progress / Reports)</option>
                </select>
              </div>

              {/* Dynamic Inputs */}
              {newRole === 'parent' ? (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/40 rounded-2xl animate-scale-up">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Child's Name</label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Child's Classroom</label>
                    <input
                      type="text"
                      required
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="animate-scale-up">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {newRole === 'coordinator' ? 'Department Unit' : newRole === 'admin' ? 'Branch / Campus' : 'Classroom Assignment'}
                  </label>
                  <input
                    type="text"
                    required
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              )}

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-55/40 dark:bg-slate-900/35 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-550 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={!name}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Update User
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-scale-up max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">Admit New Student</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5 font-sans">Submit student details and create associated parent account automatically.</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-405 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleAddStudent} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              
              <div className="border-b border-slate-100 dark:border-slate-800/30 pb-3">
                <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest">Student Information</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={studName}
                    onChange={(e) => setStudName(e.target.value)}
                    placeholder="e.g. Reyansh Sen"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admission Number</label>
                  <input
                    type="text"
                    required
                    value={studAdmNum}
                    onChange={(e) => setStudAdmNum(e.target.value)}
                    placeholder="e.g. ADM-2026-105"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classroom/Class</label>
                  <select
                    value={studClass}
                    onChange={(e) => setStudClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    {classroomOptions.map(cls => (
                      <option key={cls} value={cls} className="dark:bg-slate-900">{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={8}
                    value={studAge}
                    onChange={(e) => setStudAge(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={studGender}
                    onChange={(e) => setStudGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    <option value="Male" className="dark:bg-slate-900">Male</option>
                    <option value="Female" className="dark:bg-slate-900">Female</option>
                    <option value="Other" className="dark:bg-slate-900">Other</option>
                  </select>
                </div>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800/30 pt-3 pb-3">
                <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest">Parent / Guardian Information</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Father Name</label>
                  <input
                    type="text"
                    value={studFatherName}
                    onChange={(e) => setStudFatherName(e.target.value)}
                    placeholder="e.g. Amit Sen"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parent/Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={studParentName}
                    onChange={(e) => setStudParentName(e.target.value)}
                    placeholder="e.g. Amit Sen"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={studParentEmail}
                    onChange={(e) => setStudParentEmail(e.target.value)}
                    placeholder="parent@school.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Relationship</label>
                  <select
                    value={studRelationship}
                    onChange={(e) => setStudRelationship(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    <option value="Father" className="dark:bg-slate-900">Father</option>
                    <option value="Mother" className="dark:bg-slate-900">Mother</option>
                    <option value="Guardian" className="dark:bg-slate-900">Guardian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Number</label>
                <input
                  type="text"
                  required
                  value={studContactNumber}
                  onChange={(e) => setStudContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/35 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={!studName || !studAdmNum || !studParentEmail || !studParentName || !studContactNumber}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Admit Student
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditStudentModal && selectedStudent && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-scale-up max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">Modify Student Profile</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5 font-sans">Update student records or reassign classes.</p>
              </div>
              <button onClick={() => setShowEditStudentModal(false)} className="text-slate-405 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleEditStudent} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              
              <div className="border-b border-slate-100 dark:border-slate-800/30 pb-3">
                <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest">Student Information</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={studName}
                    onChange={(e) => setStudName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admission Number</label>
                  <input
                    type="text"
                    disabled
                    value={studAdmNum}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input bg-slate-100 dark:bg-slate-800 opacity-60 font-mono dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classroom/Class</label>
                  <select
                    value={studClass}
                    onChange={(e) => setStudClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    <option value="Nursery" className="dark:bg-slate-900">Nursery</option>
                    <option value="LKG" className="dark:bg-slate-900">LKG</option>
                    <option value="UKG" className="dark:bg-slate-900">UKG</option>
                    <option value="Nursery-A" className="dark:bg-slate-900">Nursery-A</option>
                    <option value="Kindergarten-B" className="dark:bg-slate-900">Kindergarten-B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={8}
                    value={studAge}
                    onChange={(e) => setStudAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={studGender}
                    onChange={(e) => setStudGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    <option value="Male" className="dark:bg-slate-900">Male</option>
                    <option value="Female" className="dark:bg-slate-900">Female</option>
                    <option value="Other" className="dark:bg-slate-900">Other</option>
                  </select>
                </div>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800/30 pt-3 pb-3">
                <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest">Parent / Guardian Information</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Father Name</label>
                  <input
                    type="text"
                    value={studFatherName}
                    onChange={(e) => setStudFatherName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parent/Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={studParentName}
                    onChange={(e) => setStudParentName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={studParentEmail}
                    onChange={(e) => setStudParentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Relationship</label>
                  <select
                    value={studRelationship}
                    onChange={(e) => setStudRelationship(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans bg-transparent dark:text-white"
                  >
                    <option value="Father" className="dark:bg-slate-900">Father</option>
                    <option value="Mother" className="dark:bg-slate-900">Mother</option>
                    <option value="Guardian" className="dark:bg-slate-900">Guardian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Number</label>
                <input
                  type="text"
                  required
                  value={studContactNumber}
                  onChange={(e) => setStudContactNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/55 dark:bg-slate-900/35 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditStudentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-550 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStudent}
                disabled={!studName || !studParentEmail || !studParentName || !studContactNumber}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Update Student
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ROLE REQUEST DETAIL MODAL */}
      {showRequestDetailModal && selectedRequest && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-scale-up max-h-[80vh] flex flex-col animate-scale-in">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">Role Request Details</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5 font-sans">Review submission status and requested access permissions.</p>
              </div>
              <button onClick={() => setShowRequestDetailModal(false)} className="text-slate-405 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Name</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">{selectedRequest.userName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Role</span>
                  <span className="mt-1 block">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-brand-500/10 text-brand-500 dark:text-brand-400">
                      {selectedRequest.requestedRole}
                    </span>
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Permissions</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block leading-relaxed">{selectedRequest.requestedPermissions}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request Date</span>
                  <span className="text-xs text-slate-600 dark:text-slate-350 font-semibold mt-1 block">{new Date(selectedRequest.requestDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="mt-1 block">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      selectedRequest.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                        : selectedRequest.status === 'Rejected'
                        ? 'bg-red-50 text-red-650 dark:bg-red-950/20'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </span>
                </div>
              </div>

              {selectedRequest.status === 'Rejected' && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">Rejection Reason</span>
                  <p className="text-xs text-red-650 dark:text-red-400 font-semibold mt-1 leading-relaxed">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/35 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRequestDetailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestDetailModal(false);
                      handleRejectRequest(selectedRequest);
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestDetailModal(false);
                      handleApproveRequest(selectedRequest);
                    }}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ─── Pending Approvals Tab ─────────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-sans">Pending User Approvals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              Review and approve or reject newly registered Teacher, Parent, and Coordinator accounts.
            </p>
          </div>

          {/* Approval feedback */}
          {approvalFeedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              approvalFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/15 text-red-600 dark:text-red-400'
            }`}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-sans">{approvalFeedback.text}</span>
            </div>
          )}

          {loadingPending ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/20">
              <Check className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-800 dark:text-white font-sans">All caught up!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">No accounts are pending approval right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div key={u._id} className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white ${
                      u.role === 'teacher' ? 'bg-sky-500' :
                      u.role === 'coordinator' ? 'bg-purple-500' : 'bg-amber-500'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white font-sans truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'teacher' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' :
                          u.role === 'coordinator' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>{u.role}</span>
                        {u.phoneNumber && (
                          <span className="text-[10px] text-slate-400 font-sans">{u.phoneNumber}</span>
                        )}
                        {u.createdAt && (
                          <span className="text-[10px] text-slate-400 font-sans">
                            Registered: {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproveAccount(u._id, u.name)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectAccount(u._id, u.name)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
