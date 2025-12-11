// import { useForm, type SubmitHandler } from "react-hook-form";
// import { plansData, subscriptionsData } from "../Data/Index";
// import PageHeader from "../Components/UI/PageHeader";
// import DetailItem from "../Components/UI/DetailItem";
// import SaveButton from "../Components/Form/SaveButton";

// // --- Form input type for the upgrade request ---
// interface UpgradeRequestInputs {
//   new_plan_id: string;
//   comments: string;
// }

// const MyPlanPage = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<UpgradeRequestInputs>();

//   // --- Simulate a Logged-in Organisation ---
//   // In a real app, you would get this ID from your authentication context.
//   const LOGGED_IN_ORG_ID = "ORG-001A";

//   // --- Find the current subscription and plan for this organisation ---
//   const currentSubscription = subscriptionsData.find(
//     (sub) => sub.organisation_id === LOGGED_IN_ORG_ID && sub.status === "Active"
//   );
//   const currentPlan = plansData.find(
//     (plan) => plan.id === currentSubscription?.plan_id
//   );

//   // --- Filter for plans that are an upgrade (and are not the current plan) ---
//   const upgradeablePlans = plansData.filter(
//     (plan) => plan.id !== currentPlan?.id && plan.status === "Active"
//   );

//   const onSubmit: SubmitHandler<UpgradeRequestInputs> = (data) => {
//     // In a real app, this would send an email or create a support ticket.
//     console.log("Plan Upgrade Request:", {
//       organisationId: LOGGED_IN_ORG_ID,
//       currentPlanId: currentPlan?.id,
//       requestedPlanId: data.new_plan_id,
//       comments: data.comments,
//     });
//     alert(
//       "Your plan upgrade request has been submitted! Our team will contact you shortly."
//     );
//   };

//   if (!currentSubscription || !currentPlan) {
//     return (
//       <div className="px-4 bg-white min-h-screen">
//         <PageHeader title="My Plan" />
//         <div className="p-10 text-center">
//           <h2 className="text-xl font-bold">No Active Subscription Found</h2>
//           <p className="text-gray-600 mt-2">
//             Please contact support for assistance.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 bg-white min-h-screen">
//       <div className="p-8 mx-auto max-w-6xl space-y-8">
//         {/* --- Top Section: Current Plan & Subscription Details --- */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Subscription Details Column */}
//             <div>
//               <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
//                 Subscription
//               </h2>
//               <div className="space-y-4">
//                 <DetailItem
//                   label="Status"
//                   value={
//                     <span
//                       className={`px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}
//                     >
//                       {currentSubscription.status}
//                     </span>
//                   }
//                 />
//                 <DetailItem
//                   label="Next Payment Date"
//                   value={new Date(
//                     currentSubscription.next_payment_date
//                   ).toLocaleDateString()}
//                 />
//                 <DetailItem
//                   label="Current Billing"
//                   value={`₹${currentSubscription.amount} / ${currentSubscription.billing_cycle}`}
//                 />
//                 <DetailItem
//                   label="Payment Method"
//                   value={currentSubscription.payment_method}
//                 />
//               </div>
//             </div>

//             {/* Plan Details Column */}
//             <div>
//               <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
//                 {currentPlan.name}
//               </h2>
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-600">
//                   {currentPlan.description}
//                 </p>
//                 <div>
//                   <h4 className="font-semibold text-sm uppercase mb-2 text-gray-800">
//                     Features
//                   </h4>
//                   <ul className="space-y-2">
//                     {currentPlan.features.map((feature) => (
//                       <li
//                         key={feature.name}
//                         className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md"
//                       >
//                         <span className="font-medium text-gray-700">
//                           {feature.name}
//                         </span>
//                         <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
//                           {feature.value}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* --- Bottom Section: Upgrade Request Form --- */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <h2 className="text-sm font-bold text-purple-950 uppercase mb-4">
//             Request a Plan Upgrade
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="new_plan_id"
//                 className="block text-purple-950 text-sm uppercase font-bold mb-2"
//               >
//                 Choose a New Plan<span className="text-red-600">*</span>
//               </label>
//               <select
//                 id="new_plan_id"
//                 {...register("new_plan_id", {
//                   required: "Please select a new plan.",
//                 })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">Select Plan</option>
//                 {upgradeablePlans.map((plan) => (
//                   <option key={plan.id} value={plan.id}>
//                     {plan.name} (₹{plan.monthly_price}/month)
//                   </option>
//                 ))}
//               </select>
//               {errors.new_plan_id && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.new_plan_id.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="comments"
//                 className="block text-sm  text-purple-950 uppercase font-bold mb-2"
//               >
//                 Comments (Optional)
//               </label>
//               <textarea
//                 id="comments"
//                 {...register("comments")}
//                 rows={4}
//                 className="w-full text-sm uppercase px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 placeholder="Any specific questions or requirements?"
//               />
//             </div>

//             <div className="flex justify-end">
//               <SaveButton label="Submit" />
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyPlanPage;
