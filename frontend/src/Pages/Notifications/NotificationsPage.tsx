import React, { useState } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Star, 
  FileText, 
  MessageSquare, 
  Filter, 
  MoreVertical,
  Clock,
  Eye,
  Archive,
  MoreHorizontal
} from "lucide-react";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'compliance' | 'feedback' | 'system';
  isRead: boolean;
  isStarred?: boolean;
  sender?: string;
  rating?: number;
}

const NotificationsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred'>('all');
  
  // Hardcoded dummy data as requested
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Compliance doc uploaded",
      message: "A new compliance guidelines document has been uploaded by the administration and is awaiting your review.",
      time: "3 hrs ago",
      type: "compliance",
      isRead: false,
      isStarred: true
    },
    {
      id: "2",
      title: "Feedback from Anjali S.",
      message: "Rated 5 stars for the defensive driving session with instructor Rajesh. 'Great communication and very patient.'",
      time: "Yesterday",
      type: "feedback",
      isRead: true,
      sender: "Anjali S.",
      rating: 5
    }
  ]);

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'starred') return n.isStarred;
    return true;
  });

  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'compliance': return <FileText className="text-blue-500" size={20} />;
      case 'feedback': return <MessageSquare className="text-purple-500" size={20} />;
      default: return <Bell className="text-amber-500" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <PageHeaderBack title="Notifications" buttonLink="/dashboard" />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 w-fit">
            {(['all', 'unread', 'starred'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-xl text-[11px] font-900 uppercase tracking-widest transition-all ${
                  activeFilter === filter 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl text-[11px] font-900 uppercase tracking-widest border border-slate-100 shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
            <button className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:text-slate-600 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`group relative bg-white rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/40 hover:-translate-y-1 ${
                  notif.isRead ? "border-slate-100 opacity-90" : "border-indigo-100 shadow-md ring-1 ring-indigo-50"
                }`}
              >
                <div className="p-6 md:p-8 flex gap-6">
                  {/* Icon Column */}
                  <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      notif.isRead ? "bg-slate-50 text-slate-400" : "bg-indigo-50 text-indigo-600 shadow-inner"
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    {!notif.isRead && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-sm md:text-base font-900 uppercase tracking-tight transition-colors ${
                          notif.isRead ? "text-slate-500" : "text-slate-800"
                        }`}>
                          {notif.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-800 text-slate-400 uppercase tracking-widest mt-1">
                          <Clock size={12} strokeWidth={3} />
                          {notif.time}
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          {notif.type}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStar(notif.id)}
                          className={`p-2 rounded-lg transition-colors ${notif.isStarred ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"}`}
                        >
                          <Star size={16} fill={notif.isStarred ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${notif.isRead ? "text-slate-400 font-500" : "text-slate-600 font-700"}`}>
                      {notif.message}
                    </p>

                    {notif.rating && (
                      <div className="pt-2 flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < notif.rating! ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Read/Unread Toggle Overlay for Desktop */}
                <div 
                  className="absolute inset-y-0 right-0 w-2 cursor-pointer transition-all hover:w-3 group-hover:bg-slate-50 rounded-r-3xl"
                  onClick={() => toggleRead(notif.id)}
                ></div>
              </div>
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                <Bell size={48} strokeWidth={1} />
              </div>
              <h3 className="text-lg font-900 text-slate-800 uppercase tracking-tight">All caught up!</h3>
              <p className="text-sm font-700 text-slate-400 uppercase tracking-widest mt-2">No {activeFilter === 'all' ? '' : activeFilter} notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
