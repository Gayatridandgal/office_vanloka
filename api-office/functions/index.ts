// Entry point — registers all Azure Functions for Office Backend
// Note: Route registration order matters. More specific routes (like /live or /unread-count)
// must be imported before parameterized routes (like /{id}) to prevent route conflicts.

// Auth
import "./auth/login";
import "./auth/refresh";

// Dashboard
import "./dashboard/stats";

// Roles
import "./roles/index";
import "./roles/byId";

// Staff
import "./staff/index";
import "./staff/byId";

// Vehicles — live route MUST be before byId
import "./vehicles/live";           // GET /vehicles/live
import "./vehicles/index";          // GET+POST /vehicles
import "./vehicles/byId";           // PUT+DELETE /vehicles/{id}

// Drivers
import "./drivers/index";
import "./drivers/byId";

// Travellers
import "./travellers/index";
import "./travellers/byId";

// Bookings — updateStatus MUST be before byId
import "./bookings/updateStatus";   // PUT /bookings/{id}/status
import "./bookings/index";          // GET+POST /bookings
import "./bookings/byId";           // PUT+DELETE /bookings/{id}

// Vendors
import "./vendors/index";
import "./vendors/byId";

// Feedbacks
import "./feedbacks/index";
import "./feedbacks/byId";

// Compliance
import "./compliance/index";
import "./compliance/byId";

// Devices
import "./devices/index";
import "./devices/byId";

// App Users
import "./app-users/index";
import "./app-users/byId";

// Notifications — unread-count and read-all BEFORE parameterized routes
import "./notifications/unreadCount";   // GET /notifications/unread-count
import "./notifications/markRead";      // PUT /notifications/{id}/read + read-all
import "./notifications/index";         // GET /notifications

// Masters
import "./masters/dropdowns";

// Settings
import "./settings/index";
