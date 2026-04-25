// Entry point — registers all Azure Functions (v4 programmatic model)
// Each file handles multiple HTTP methods on the same route to avoid conflicts

// auth (separate routes, no conflict)
import "./auth/login";
import "./auth/refresh";

// dashboard
import "./dashboard/stats";

// fees  (GET+POST merged, no {id} route)
import "./fees/index";

// instructors
import "./instructors/index";   // GET + POST  /instructors
import "./instructors/byId";    // PUT + DELETE /instructors/{id}

// roles
import "./roles/index";         // GET + POST  /roles
import "./roles/byId";          // PUT + DELETE /roles/{id}

// sessions (GET+POST for both /sessions and /sessions/templates in one file)
import "./sessions/index";
import "./sessions/updateStatus"; // PUT /sessions/{id}/status

// staff
import "./staff/index";          // GET + POST  /staff
import "./staff/byId";           // PUT + DELETE /staff/{id}

// trainees
import "./trainees/index";        // GET + POST  /trainees
import "./trainees/byId";         // PUT + DELETE /trainees/{id}

// vehicles
import "./vehicles/index";        // GET + POST  /vehicles
import "./vehicles/byId";         // PUT + DELETE /vehicles/{id}
import "./vehicles/live";         // GET /vehicles/live  (no conflict — unique route)
