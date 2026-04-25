"use strict";
// Entry point — registers all Azure Functions for Office Backend
// Note: Route registration order matters. More specific routes (like /live or /unread-count)
// must be imported before parameterized routes (like /{id}) to prevent route conflicts.
Object.defineProperty(exports, "__esModule", { value: true });
// Auth
require("./auth/login");
require("./auth/refresh");
// Dashboard
require("./dashboard/stats");
// Roles
require("./roles/index");
require("./roles/byId");
// Staff
require("./staff/index");
require("./staff/byId");
// Vehicles — live route MUST be before byId
require("./vehicles/live"); // GET /vehicles/live
require("./vehicles/index"); // GET+POST /vehicles
require("./vehicles/byId"); // PUT+DELETE /vehicles/{id}
// Drivers
require("./drivers/index");
require("./drivers/byId");
// Travellers
require("./travellers/index");
require("./travellers/byId");
// Bookings — updateStatus MUST be before byId
require("./bookings/updateStatus"); // PUT /bookings/{id}/status
require("./bookings/index"); // GET+POST /bookings
require("./bookings/byId"); // PUT+DELETE /bookings/{id}
// Vendors
require("./vendors/index");
require("./vendors/byId");
// Feedbacks
require("./feedbacks/index");
require("./feedbacks/byId");
// Compliance
require("./compliance/index");
require("./compliance/byId");
// Devices
require("./devices/index");
require("./devices/byId");
// App Users
require("./app-users/index");
require("./app-users/byId");
// Notifications — unread-count and read-all BEFORE parameterized routes
require("./notifications/unreadCount"); // GET /notifications/unread-count
require("./notifications/markRead"); // PUT /notifications/{id}/read + read-all
require("./notifications/index"); // GET /notifications
// Masters
require("./masters/dropdowns");
// Settings
require("./settings/index");
